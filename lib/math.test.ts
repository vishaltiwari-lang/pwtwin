import { test } from "node:test";
import assert from "node:assert/strict";
import { splitMath } from "./math";

test("splitMath separates inline math from text", () => {
  assert.deepEqual(splitMath("The values are $-2K$; $-K$ respectively."), [
    { type: "text", value: "The values are " },
    { type: "inline", value: "-2K" },
    { type: "text", value: "; " },
    { type: "inline", value: "-K" },
    { type: "text", value: " respectively." },
  ]);
});

test("splitMath handles display math blocks", () => {
  assert.deepEqual(splitMath("Result: $$a = \\frac{g}{2}$$ done"), [
    { type: "text", value: "Result: " },
    { type: "block", value: "a = \\frac{g}{2}" },
    { type: "text", value: " done" },
  ]);
});

test("splitMath returns plain text untouched", () => {
  assert.deepEqual(splitMath("no math here"), [{ type: "text", value: "no math here" }]);
});

test("splitMath handles a string that is only math", () => {
  assert.deepEqual(splitMath("$E = mc^2$"), [{ type: "inline", value: "E = mc^2" }]);
});

test("splitMath leaves an unclosed dollar as plain text", () => {
  assert.deepEqual(splitMath("costs $5 total"), [{ type: "text", value: "costs $5 total" }]);
});
