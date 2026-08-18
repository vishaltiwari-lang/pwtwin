import { test } from "node:test";
import assert from "node:assert/strict";
import { buildSystemPrompt, groundedFallbackAnswer } from "./ai";
import { getPage } from "./content";

const page = getPage("phy-rot-207")!;

test("buildSystemPrompt names the page and forbids going off-page", () => {
  const sys = buildSystemPrompt(page);
  assert.match(sys, /Moment of Inertia & Rolling/);
  assert.match(sys, /this page/i);
  // Must instruct the model to decline chapter-wide / off-page questions.
  assert.match(sys, /only|decline|do not|scope/i);
  // The actual page content should be embedded for grounding.
  assert.match(sys, /solid sphere/i);
});

test("buildSystemPrompt is the elite mentor prompt", () => {
  const sys = buildSystemPrompt(page);
  // Verbatim markers from the mentor prompt, start to finish.
  assert.match(sys, /PW TWIN — ELITE JEE\/NEET PERSONAL MENTOR/);
  assert.match(sys, /DIAGNOSE → EXPLAIN → GUIDE → ATTEMPT → EVALUATE → CORRECT → RETEST → RETAIN/);
  assert.match(sys, /SOCRATIC TUTORING ENGINE/);
  assert.match(sys, /NEXT UNSEEN QUESTION/);
});

test("buildSystemPrompt fills CURRENT PAGE INPUT with real page data", () => {
  const sys = buildSystemPrompt(page);
  const pageInput = sys.slice(sys.indexOf("49. CURRENT PAGE INPUT"));
  assert.match(pageInput, /Subject: Physics/);
  assert.match(pageInput, /Moment of Inertia & Rolling/);
  // Question data, not the raw [QUESTION DATA] placeholder.
  assert.doesNotMatch(pageInput, /\[QUESTION DATA\]/);
  assert.doesNotMatch(pageInput, /\[DATA\]/);
  assert.match(pageInput, /solid sphere/i);
  assert.match(pageInput, /Correct answer:/);
});

test("groundedFallbackAnswer returns a question's stepwise reasoning on a keyword match", () => {
  const res = groundedFallbackAnswer(page, "why does the solid sphere reach the bottom first?");
  assert.equal(res.usedQuestionId, "phy-rot-207-q1");
  // It should surface that question's 'why' explanation.
  assert.match(res.text, /hollow sphere/i);
  // And include the stepwise working.
  assert.match(res.text, /I\/MR/);
});

test("groundedFallbackAnswer resolves an explicit question code like 'Q2'", () => {
  const res = groundedFallbackAnswer(page, "explain Q2 please");
  assert.equal(res.usedQuestionId, "phy-rot-207-q2");
  assert.match(res.text, /ML²\/12|ML\^2\/12|rod/i);
});

test("groundedFallbackAnswer scopes an unrelated doubt back to this page", () => {
  const res = groundedFallbackAnswer(page, "who won the cricket world cup");
  assert.equal(res.usedQuestionId, undefined);
  // The scoped reply must name the page so the student knows the boundary.
  assert.match(res.text, /Moment of Inertia & Rolling/);
});

test("groundedFallbackAnswer can answer from a mnemonic keyword", () => {
  const res = groundedFallbackAnswer(page, "give me a mnemonic for this");
  assert.match(res.text, /Slow Hollow|Ring, Disc, Sphere|Add M-d-squared/);
});
