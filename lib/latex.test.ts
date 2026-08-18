import { test } from "node:test";
import assert from "node:assert/strict";
import { latexFromText } from "./latex";

test("escapes LaTeX specials in plain text", () => {
  assert.equal(latexFromText("marks & rank: 100% #1 q_id"), "marks \\& rank: 100\\% \\#1 q\\_id");
});

test("preserves inline math while escaping surrounding text", () => {
  assert.equal(latexFromText("50% of $\\frac{a}{b}$ here"), "50\\% of $\\frac{a}{b}$ here");
});

test("preserves display math blocks", () => {
  assert.equal(latexFromText("see $$\\int_0^1 x\\,dx$$ above"), "see $$\\int_0^1 x\\,dx$$ above");
});

test("escapes an unmatched dollar sign", () => {
  assert.equal(latexFromText("cost $5"), "cost \\$5");
});

test("maps unicode symbols in text to math commands", () => {
  assert.equal(latexFromText("4π × 10⁻⁷ T·m/A"), "4$\\pi$ $\\times$ 10$^{-7}$ T$\\cdot$m/A");
  assert.equal(latexFromText("verified ✔"), "verified $\\checkmark$");
  assert.equal(latexFromText("μ₀ and δ_min"), "$\\mu$$_{0}$ and $\\delta$\\_min");
});

test("normalises unicode inside math segments to ASCII LaTeX", () => {
  assert.equal(latexFromText("$a − b$"), "$a - b$");
  assert.equal(latexFromText("$Ω = 2π$"), "$\\Omega  = 2\\pi $");
});
