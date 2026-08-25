import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveFigureFile } from "./figures";

test("resolveFigureFile resolves a real figure to an absolute path", () => {
  const path = resolveFigureFile("cuet-physics-2024-05-29", "q03-a.png");
  assert.ok(path, "expected a path for a real figure");
  assert.ok(path!.endsWith("digital-documents/cuet-physics-2024-05-29/figures/q03-a.png"));
});

test("resolveFigureFile rejects path traversal", () => {
  assert.equal(resolveFigureFile("../..", "q03-a.png"), null);
  assert.equal(resolveFigureFile("cuet-physics-2024-05-29", "../paper.json"), null);
  assert.equal(resolveFigureFile("cuet-physics-2024-05-29", "..%2fpaper.json"), null);
});

test("resolveFigureFile rejects non-png and missing files", () => {
  assert.equal(resolveFigureFile("cuet-physics-2024-05-29", "paper.json"), null);
  assert.equal(resolveFigureFile("cuet-physics-2024-05-29", "does-not-exist.png"), null);
});
