import type { Question } from "./types";

export interface MindMapBranch {
  label: string;
  children: string[];
}

export interface MindMap {
  root: string;
  branches: MindMapBranch[];
}

/** First sentence of a paragraph (kept whole if there's no sentence break). */
function firstSentence(text: string): string {
  const m = text.match(/^[\s\S]*?[.?!](?=\s|$)/);
  return (m ? m[0] : text).trim();
}

/**
 * Deterministic one-glance summary of a question, built entirely from its
 * seeded data — the RETAIN step at the end of a walkthrough.
 */
export function buildMindMap(q: Question): MindMap {
  const branches: MindMapBranch[] = [
    { label: "Topics", children: q.tags.slice(0, 6) },
    { label: "Solution path", children: q.steps.map((s) => s.label) },
    { label: "Answer", children: [q.answer] },
    { label: "Why", children: [firstSentence(q.why)] },
  ];
  if (q.figure) {
    branches.push({ label: "Diagram", children: [firstSentence(q.figure)] });
  }
  return {
    root: q.tags.length ? `${q.code} · ${q.tags[0]}` : q.code,
    branches,
  };
}
