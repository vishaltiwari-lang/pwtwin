import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { CheatRow, Difficulty, Mnemonic, PageContent, Question, Shorthand, Step, Subject } from "./types";

/**
 * Loads digitized question papers (digital-documents/<slug>/paper.json) as
 * app pages. Server-side only — reads from the filesystem. Dropping a new
 * digitized paper folder in is enough for it to appear on /publisher (QR)
 * and get its own /p/<slug> companion.
 */

const PAPERS_DIR = join(process.cwd(), "digital-documents");
const SUBJECTS: readonly string[] = ["Physics", "Chemistry", "Biology", "Math"];

interface PaperQuestion {
  id: string;
  code: string;
  prompt: string;
  options?: string[];
  answer: string;
  difficulty: Difficulty;
  steps: Step[];
  why: string;
  tags: string[];
}

interface PaperJson {
  id: string;
  kind: string;
  exam: string;
  subject: string;
  title: string;
  concept?: string;
  questions: PaperQuestion[];
  studyAids?: {
    mnemonics?: Mnemonic[];
    shorthand?: Shorthand[];
    cheatSheet?: CheatRow[];
  };
}

/**
 * paper.json stores MCQ answers as "(a) <option text>"; the UI highlights the
 * correct option by exact string equality, so resolve the letter to the
 * literal option text.
 */
function resolveAnswer(answer: string, options?: string[]): string {
  if (!options) return answer;
  const m = answer.match(/^\(([a-e])\)\s*/i);
  if (m) {
    const opt = options[m[1].toLowerCase().charCodeAt(0) - 97];
    if (opt) return opt;
  }
  return answer;
}

function toPage(d: PaperJson): PageContent {
  const questions: Question[] = d.questions.map((q) => ({
    id: q.id,
    code: q.code,
    prompt: q.prompt,
    options: q.options,
    answer: resolveAnswer(q.answer, q.options),
    difficulty: q.difficulty,
    steps: q.steps,
    why: q.why,
    tags: q.tags,
  }));
  return {
    id: d.id,
    subject: d.subject as Subject,
    book: d.exam,
    chapter: "Question paper",
    pageNumber: 1,
    title: d.title,
    concept: d.concept ?? d.title,
    questions,
    mnemonics: d.studyAids?.mnemonics ?? [],
    shorthand: d.studyAids?.shorthand ?? [],
    cheatSheet: d.studyAids?.cheatSheet ?? [],
  };
}

let cache: PageContent[] | null = null;

export function loadPaperPages(): PageContent[] {
  if (cache) return cache;
  const pages: PageContent[] = [];
  if (existsSync(PAPERS_DIR)) {
    for (const entry of readdirSync(PAPERS_DIR, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const file = join(PAPERS_DIR, entry.name, "paper.json");
      if (!existsSync(file)) continue;
      const data = JSON.parse(readFileSync(file, "utf8")) as PaperJson;
      if (data.kind !== "question-paper" || !SUBJECTS.includes(data.subject)) continue;
      pages.push(toPage(data));
    }
  }
  cache = pages.sort((a, b) => a.id.localeCompare(b.id));
  return cache;
}
