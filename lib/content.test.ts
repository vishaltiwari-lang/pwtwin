import { test } from "node:test";
import assert from "node:assert/strict";
import { getPage, getAllPages, listPageSummaries } from "./content.ts";

test("getAllPages returns pages with unique ids", () => {
  const pages = getAllPages();
  assert.ok(pages.length >= 4, "expected at least 4 seeded pages");
  const ids = pages.map((p) => p.id);
  assert.equal(new Set(ids).size, ids.length, "page ids must be unique");
});

test("every page meets the content contract", () => {
  for (const p of getAllPages()) {
    assert.ok(p.questions.length >= 2, `${p.id} needs >=2 questions`);
    for (const q of p.questions) {
      assert.ok(q.steps.length >= 2, `${q.id} needs >=2 steps`);
      assert.ok(q.why.trim().length > 0, `${q.id} needs a 'why'`);
      assert.ok(q.answer.trim().length > 0, `${q.id} needs an answer`);
    }
    assert.ok(p.mnemonics.length >= 3, `${p.id} needs >=3 mnemonics`);
    assert.ok(p.shorthand.length >= 3, `${p.id} needs >=3 shorthand rows`);
    assert.ok(p.cheatSheet.length >= 3, `${p.id} needs a cheat sheet`);
    assert.ok(p.concept.trim().length > 0, `${p.id} needs a concept summary`);
  }
});

test("every question id is unique across all pages", () => {
  const qids = getAllPages().flatMap((p) => p.questions.map((q) => q.id));
  assert.equal(new Set(qids).size, qids.length, "question ids must be globally unique");
});

test("getPage resolves known ids and rejects unknown ones", () => {
  const first = getAllPages()[0];
  assert.equal(getPage(first.id)?.id, first.id);
  assert.equal(getPage("does-not-exist"), undefined);
});

test("listPageSummaries mirrors the seeded pages", () => {
  const summaries = listPageSummaries();
  assert.equal(summaries.length, getAllPages().length);
  for (const s of summaries) {
    assert.ok(getPage(s.id), `summary ${s.id} must map to a real page`);
    assert.ok(s.title.length > 0 && s.subject.length > 0);
  }
});

test("all four core subjects are represented", () => {
  const subjects = new Set(getAllPages().map((p) => p.subject));
  for (const s of ["Physics", "Chemistry", "Biology", "Math"]) {
    assert.ok(subjects.has(s as never), `missing a ${s} page`);
  }
});
