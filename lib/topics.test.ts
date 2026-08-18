import { test } from "node:test";
import assert from "node:assert/strict";
import { extractTopics, filterByTopic } from "./topics";
import type { Question } from "./types";

const q = (id: string, tags: string[]): Question => ({
  id,
  code: id.toUpperCase(),
  prompt: `prompt ${id}`,
  answer: "42",
  difficulty: "Easy",
  steps: [{ label: "s", detail: "d" }],
  why: "because",
  tags,
});

const questions = [
  q("q1", ["bohr model", "atomic physics"]),
  q("q2", ["photoelectric effect", "atomic physics"]),
  q("q3", ["bohr model"]),
  q("q4", []),
];

test("extractTopics returns unique topics with counts, most frequent first", () => {
  const topics = extractTopics(questions);
  assert.deepEqual(topics, [
    { topic: "atomic physics", count: 2 },
    { topic: "bohr model", count: 2 },
    { topic: "photoelectric effect", count: 1 },
  ]);
});

test("extractTopics ties break alphabetically", () => {
  const topics = extractTopics([q("a", ["zeta", "alpha"])]);
  assert.deepEqual(
    topics.map((t) => t.topic),
    ["alpha", "zeta"],
  );
});

test("extractTopics on empty input returns empty list", () => {
  assert.deepEqual(extractTopics([]), []);
});

test("filterByTopic keeps only questions tagged with the topic", () => {
  const filtered = filterByTopic(questions, "bohr model");
  assert.deepEqual(
    filtered.map((x) => x.id),
    ["q1", "q3"],
  );
});

test("filterByTopic with null returns all questions", () => {
  assert.equal(filterByTopic(questions, null), questions);
});

test("filterByTopic with unknown topic returns empty list", () => {
  assert.deepEqual(filterByTopic(questions, "thermodynamics"), []);
});
