import { test } from "node:test";
import assert from "node:assert/strict";
import { loadPaperPages } from "./papers";
import { getPage } from "./content";

const SUBJECTS = ["Physics", "Chemistry", "Biology", "Math"];

test("loadPaperPages loads every digitized paper as a page", () => {
  const pages = loadPaperPages();
  const ids = pages.map((p) => p.id);
  assert.ok(ids.includes("cuet-physics-2024-05-29"), "missing CUET paper page");
  assert.ok(ids.includes("jkbose-12-math-6006b-2022"), "missing JK BOSE paper page");
  assert.equal(new Set(ids).size, ids.length, "paper page ids must be unique");
});

test("paper pages meet the app content contract", () => {
  for (const p of loadPaperPages()) {
    assert.ok(SUBJECTS.includes(p.subject), `${p.id}: bad subject ${p.subject}`);
    assert.ok(p.questions.length >= 2, `${p.id} needs >=2 questions`);
    assert.ok(p.mnemonics.length >= 3, `${p.id} needs >=3 mnemonics`);
    assert.ok(p.shorthand.length >= 3, `${p.id} needs >=3 shorthand rows`);
    assert.ok(p.cheatSheet.length >= 3, `${p.id} needs >=3 cheat sheet rows`);
    assert.ok(p.concept.trim().length > 0, `${p.id} needs a concept summary`);
    for (const q of p.questions) {
      assert.ok(q.steps.length >= 2, `${q.id} needs >=2 steps`);
      assert.ok(q.why.trim().length > 0, `${q.id} needs a why`);
      assert.ok(q.answer.trim().length > 0, `${q.id} needs an answer`);
    }
  }
});

test("MCQ answers exactly match one of the options", () => {
  // QuestionCard highlights the correct option via `opt === question.answer`,
  // so the "(a) ..." letter prefix from paper.json must be resolved to option text.
  let mcqs = 0;
  for (const p of loadPaperPages()) {
    for (const q of p.questions) {
      if (!q.options) continue;
      mcqs++;
      assert.ok(
        q.options.includes(q.answer),
        `${q.id}: answer ${JSON.stringify(q.answer)} is not literally one of the options`
      );
    }
  }
  assert.ok(mcqs >= 50, `expected at least 50 MCQs across papers, saw ${mcqs}`);
});

test("paper question counts match their source papers", () => {
  const cuet = loadPaperPages().find((p) => p.id === "cuet-physics-2024-05-29");
  const jkbose = loadPaperPages().find((p) => p.id === "jkbose-12-math-6006b-2022");
  assert.equal(cuet?.questions.length, 50);
  assert.equal(jkbose?.questions.length, 29);
});

test("paper pages are served through the content lib (and thus /publisher QRs)", () => {
  assert.equal(getPage("cuet-physics-2024-05-29")?.subject, "Physics");
  assert.equal(getPage("jkbose-12-math-6006b-2022")?.subject, "Math");
});
