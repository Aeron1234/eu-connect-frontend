import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import vm from "node:vm";

const require = createRequire(import.meta.url);
const { transformSync } = require("next/dist/compiled/babel/core");
const file = new URL("../components/auth-ui/PhilippinesNetwork.js", import.meta.url);
const { code } = transformSync(readFileSync(file, "utf8"), {
  filename: file.pathname, babelrc: false, configFile: false,
  presets: [[require("next/babel"), { "preset-env": { modules: "commonjs" }, "preset-react": { runtime: "automatic" } }]],
});

function elements(node) {
  if (Array.isArray(node)) return node.flatMap(elements);
  if (!node || typeof node !== "object") return [];
  return [node, ...elements(node.props?.children)];
}

function harness({ reduced = false, random = () => 0 } = {}) {
  const states = [], refs = [], timers = new Map(), listeners = new Set();
  let stateIndex = 0, refIndex = 0, now = 0, nextTimer = 0, pendingEffect, cleanup, lastDependencies;
  const media = { matches: reduced,
    addEventListener: (_, callback) => listeners.add(callback),
    removeEventListener: (_, callback) => listeners.delete(callback) };
  const compiledModule = { exports: {} };
  vm.runInNewContext(code, {
    module: compiledModule, exports: compiledModule.exports,
    Math: Object.assign(Object.create(Math), { random }),
    window: {
      matchMedia: () => media,
      setTimeout(callback, delay) { timers.set(++nextTimer, { callback, due: now + delay }); return nextTimer; },
      clearTimeout(id) { timers.delete(id); },
    },
    require(id) {
      if (id === "react") return {
        useState(initial) {
          const slot = stateIndex++;
          if (!(slot in states)) states[slot] = initial;
          return [states[slot], value => { states[slot] = typeof value === "function" ? value(states[slot]) : value; }];
        },
        useRef(initial) { return refs[refIndex++] ??= { current: initial }; },
        useEffect(callback, dependencies) {
          if (!lastDependencies || dependencies.some((value, index) => value !== lastDependencies[index])) {
            pendingEffect = callback;
            lastDependencies = [...dependencies];
          }
        },
      };
      if (id === "next/image") return () => null;
      if (id.startsWith("@/public/")) return { src: id };
      return require(id);
    },
  });
  function render() {
    stateIndex = 0; refIndex = 0;
    const tree = compiledModule.exports.default();
    if (pendingEffect) {
      cleanup?.();
      cleanup = pendingEffect();
      pendingEffect = null;
    }
    return tree;
  }
  render();
  return {
    render, timers, listeners,
    routes() { return elements(render()).filter(node => node.props?.className === "landing-network-route-active"); },
    selected() { return elements(render()).filter(node => node.props?.className === "landing-network-pin" && node.props["aria-pressed"]); },
    click(name) { elements(render()).find(node => node.props?.title === name).props.onClick(); },
    reduce(value) { media.matches = value; for (const listener of listeners) listener(); },
    dispose() { cleanup(); },
    advance(milliseconds) {
      const until = now + milliseconds;
      for (;;) {
        const next = [...timers.entries()].filter(([, timer]) => timer.due <= until)
          .sort((a, b) => a[1].due - b[1].due || a[0] - b[0])[0];
        if (!next) break;
        const [id, timer] = next;
        now = timer.due; timers.delete(id); timer.callback();
      }
      now = until;
    },
  };
}

test("random groups contain two to five unique routes and avoid the previous group", () => {
  for (const [random, count] of [[() => 0, 2], [() => 0.999, 5]]) {
    const h = harness({ random });
    h.advance(300);
    const first = h.routes().map(route => route.props.d);
    assert.equal(first.length, count); assert.equal(new Set(first).size, count);
    h.advance(1700);
    const overlap = h.routes().map(route => route.props.d);
    assert.equal(overlap.length, count * 2); assert.equal(new Set(overlap).size, count * 2);
    h.dispose();
  }
});

test("the next group appears exactly 100ms before the 1800ms routes expire", () => {
  const h = harness(); h.advance(300);
  const firstKeys = h.routes().map(route => route.key);
  h.advance(1699); assert.equal(h.routes().length, 2);
  h.advance(1); assert.equal(h.routes().length, 4);
  h.advance(99); assert(firstKeys.every(key => h.routes().some(route => route.key === key)));
  h.advance(1); assert.equal(h.routes().length, 2);
  assert(firstKeys.every(key => !h.routes().some(route => route.key === key)));
  h.dispose();
});

test("the continuous loop varies group sizes and stays bounded over many cycles", () => {
  let seed = 42;
  const h = harness({ random() { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; } });
  const sizes = new Set(); h.advance(300);
  for (let cycle = 0; cycle < 100; cycle++) {
    const routes = h.routes(); sizes.add(routes.length);
    assert(routes.length >= 2 && routes.length <= 10);
    assert(h.timers.size <= 3);
    h.advance(1700);
  }
  assert(sizes.size > 1); h.dispose();
});

test("pin clicks keep selection and replay one pulse without restarting the group schedule", () => {
  const h = harness(); h.advance(300);
  h.click("Cebu, Cebu"); h.click("Cebu, Cebu");
  assert.equal(h.routes().length, 3); assert.equal(h.selected().length, 1);
  assert.equal(h.selected()[0].props.title, "Cebu, Cebu");
  h.advance(1699); assert.equal(h.routes().length, 3);
  h.advance(1); assert.equal(h.routes().length, 5);
  const pulse = h.routes().find(route => route.props.d === elements(h.render()).find(node => node.props?.className === "landing-network-route-selected").props.d);
  pulse.props.onAnimationEnd();
  assert.equal(h.routes().length, 4); assert.equal(h.selected().length, 1);
  h.dispose();
});

test("reduced motion stops both pending groups and expirations, then can resume", () => {
  const h = harness({ reduced: true });
  h.advance(10000); assert.equal(h.routes().length, 0); assert.equal(h.timers.size, 0);
  h.click("Cebu, Cebu"); assert.equal(h.selected().length, 1);
  h.reduce(false); h.advance(300); assert.equal(h.routes().length, 2);
  h.advance(1700); assert.equal(h.routes().length, 4);
  h.reduce(true); assert.equal(h.routes().length, 0); assert.equal(h.timers.size, 0);
  assert.equal(h.selected().length, 1);
  h.advance(10000); assert.equal(h.routes().length, 0);
  h.dispose();
});

test("unmounting during an overlap removes all timers and the motion listener", () => {
  const h = harness(); h.advance(2000);
  assert.equal(h.routes().length, 4); assert.equal(h.timers.size, 3);
  h.dispose(); assert.equal(h.timers.size, 0); assert.equal(h.listeners.size, 0);
  h.advance(10000); assert.equal(h.routes().length, 4);
});
