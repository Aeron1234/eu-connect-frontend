"use client";

import { useEffect } from "react";

const APP_SCROLL_REGION = 'nav[aria-label="Main navigation"], main, main > [class~="overflow-y-auto"]';
const NATIVE_WHEEL_REGION = '.leaflet-container, [role="dialog"], [role="listbox"], input, textarea, select, [contenteditable="true"]';

export default function SmoothScroll() {
  useEffect(() => {
    const animations = new Map();
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    function finish(element) {
      const animation = animations.get(element);
      if (!animation) return;
      cancelAnimationFrame(animation.frame);
      element.style.scrollBehavior = animation.originalBehavior;
      animations.delete(element);
    }

    function canScroll(element, delta) {
      const maxScroll = element.scrollHeight - element.clientHeight;
      if (maxScroll <= 1) return false;
      const position = animations.get(element)?.target ?? element.scrollTop;
      return delta > 0 ? position < maxScroll - 1 : position > 1;
    }

    function findTarget(start, delta) {
      for (let element = start; element && element !== document.body; element = element.parentElement) {
        const overflow = getComputedStyle(element).overflowY;
        if ((overflow === "auto" || overflow === "scroll") && canScroll(element, delta)) {
          // Nested lists, menus, and dialogs retain their own native scrolling.
          return element.matches(APP_SCROLL_REGION) ? element : null;
        }
      }

      const root = document.scrollingElement;
      return root && canScroll(root, delta) ? root : null;
    }

    function animate(element) {
      const animation = animations.get(element);
      if (!animation) return;
      const remaining = animation.target - element.scrollTop;
      if (Math.abs(remaining) < 0.6) {
        element.scrollTop = animation.target;
        finish(element);
        return;
      }
      element.scrollTop += remaining * 0.22;
      animation.frame = requestAnimationFrame(() => animate(element));
    }

    function onWheel(event) {
      if (event.defaultPrevented || reducedMotion.matches || event.ctrlKey || event.shiftKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      if (!(event.target instanceof Element) || event.target.closest(NATIVE_WHEEL_REGION)) return;

      // Small pixel deltas usually come from a trackpad, which the browser already scrolls smoothly.
      if (event.deltaMode === 0 && Math.abs(event.deltaY) < 32) {
        for (const element of animations.keys()) finish(element);
        return;
      }

      const rawDelta = event.deltaMode === 1
        ? event.deltaY * 16
        : event.deltaMode === 2
          ? event.deltaY * window.innerHeight
          : event.deltaY;
      if (!rawDelta) return;

      const delta = Math.sign(rawDelta) * Math.min(Math.abs(rawDelta), 480);
      const element = findTarget(event.target, delta);
      if (!element) return;

      event.preventDefault();
      let animation = animations.get(element);
      if (!animation) {
        animation = {
          target: element.scrollTop,
          frame: 0,
          originalBehavior: element.style.scrollBehavior,
        };
        element.style.scrollBehavior = "auto";
        animations.set(element, animation);
      }

      animation.target = Math.max(0, Math.min(element.scrollHeight - element.clientHeight, animation.target + delta));
      if (!animation.frame) animation.frame = requestAnimationFrame(() => animate(element));
    }

    document.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      document.removeEventListener("wheel", onWheel);
      for (const element of animations.keys()) finish(element);
    };
  }, []);

  return null;
}
