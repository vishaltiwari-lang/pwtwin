import { test } from "node:test";
import assert from "node:assert/strict";
import { buildMindMap } from "./mindmap";
import type { Question } from "./types";

const q: Question = {
  id: "t-q1",
  code: "Q1",
  prompt: "What is the total energy?",
  options: ["$-K$", "$+K$"],
  answer: "$-K$",
  difficulty: "Easy",
  steps: [
    { label: "Recall the relation", detail: "PE = -2K" },
    { label: "Add them up", detail: "TE = KE + PE" },
  ],
  why: "In the Bohr model the potential energy is always minus twice the kinetic energy, so the total comes out negative. This binds the electron.",
  tags: ["bohr model", "total energy"],
};

test("buildMindMap roots on code + primary topic with core branches in order", () => {
  const map = buildMindMap(q);
  assert.equal(map.root, "Q1 · bohr model");
  assert.deepEqual(
    map.branches.map((b) => b.label),
    ["Topics", "Solution path", "Answer", "Why"],
  );
});

test("buildMindMap fills branches from the question's data", () => {
  const map = buildMindMap(q);
  const by = Object.fromEntries(map.branches.map((b) => [b.label, b.children]));
  assert.deepEqual(by["Topics"], ["bohr model", "total energy"]);
  assert.deepEqual(by["Solution path"], ["Recall the relation", "Add them up"]);
  assert.deepEqual(by["Answer"], ["$-K$"]);
  assert.equal(by["Why"].length, 1);
  assert.ok(by["Why"][0].startsWith("In the Bohr model"));
});

test("buildMindMap trims a long why to its first sentence", () => {
  const map = buildMindMap(q);
  const why = map.branches.find((b) => b.label === "Why")!.children[0];
  assert.ok(!why.includes("This binds"), "why should stop at the first sentence");
});

test("buildMindMap adds a Diagram branch only when the question has a figure", () => {
  assert.ok(!buildMindMap(q).branches.some((b) => b.label === "Diagram"));
  const withFig = { ...q, figure: "Four graphs of current vs distance." };
  const diagram = buildMindMap(withFig).branches.find((b) => b.label === "Diagram");
  assert.deepEqual(diagram?.children, ["Four graphs of current vs distance."]);
});

test("buildMindMap falls back to the code alone when a question has no tags", () => {
  assert.equal(buildMindMap({ ...q, tags: [] }).root, "Q1");
});
