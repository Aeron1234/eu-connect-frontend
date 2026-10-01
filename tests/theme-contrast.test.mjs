import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const css = readFileSync(new URL("../app/_styles/globals.css", import.meta.url), "utf8");

function palette(selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const block = css.match(new RegExp(`${escaped}\\s*\\{([^}]+)\\}`))?.[1];
  assert.ok(block, `${selector} palette exists`);
  return Object.fromEntries(
    [...block.matchAll(/--([\w-]+):\s*(#[\da-fA-F]{6});/g)].map((match) => [
      match[1],
      match[2],
    ]),
  );
}

function luminance(hex) {
  const rgb = [1, 3, 5].map((offset) =>
    Number.parseInt(hex.slice(offset, offset + 2), 16) / 255,
  );
  const [red, green, blue] = rgb.map((channel) =>
    channel <= 0.04045
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4,
  );
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function contrast(foreground, background) {
  const [lighter, darker] = [luminance(foreground), luminance(background)].sort(
    (a, b) => b - a,
  );
  return (lighter + 0.05) / (darker + 0.05);
}

test("both themes keep common text and buttons readable", () => {
  for (const theme of [palette(":root"), palette(".dark")]) {
    for (const [foreground, background] of [
      ["foreground", "background"],
      ["card-foreground", "card"],
      ["foreground-soft", "card"],
      ["foreground-subtle", "card"],
      ["primary-emphasis", "card"],
      ["primary-foreground", "primary"],
    ]) {
      assert.ok(theme[foreground] && theme[background]);
      assert.ok(
        contrast(theme[foreground], theme[background]) >= 4.5,
        `${foreground} on ${background} needs 4.5:1 contrast`,
      );
    }
  }
});

test("primary utilities use the maroon theme token", () => {
  assert.match(css, /--color-primary:\s*var\(--primary\)/);
  assert.equal(palette(":root").primary, "#800000");
  assert.equal(palette(".dark").primary, "#710000");
  assert.equal(palette(".dark")["color-white"], "#efefef");
  assert.ok(
    contrast(palette(".dark").primary, palette(".dark")["color-white"]) >= 4.5,
    "active navigation text stays readable on school white",
  );
});
