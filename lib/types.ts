export type Subject = "Physics" | "Chemistry" | "Biology" | "Math";
export type Difficulty = "Easy" | "Medium" | "Hard";

export interface Step {
  /** Short label for the step, e.g. "Set up" or "Apply the formula". */
  label: string;
  /** The worked detail for this step. */
  detail: string;
}

export interface Question {
  id: string;
  /** Human-facing code shown on the card, e.g. "Q1" or "JEE 2019". */
  code: string;
  prompt: string;
  /** Present for MCQs. */
  options?: string[];
  answer: string;
  difficulty: Difficulty;
  steps: Step[];
  /** One short paragraph: why this answer is correct. */
  why: string;
  /** Keywords used to match a free-form doubt to this question. */
  tags: string[];
  /** Text description of the question's diagram, when it has one. */
  figure?: string;
  /** Served URLs of the diagram image crops (e.g. /figures/<pageId>/q03-a.png). */
  figureImages?: string[];
}

export interface Mnemonic {
  phrase: string;
  expands: string;
  note?: string;
}

export interface Shorthand {
  term: string;
  meaning: string;
}

export interface CheatRow {
  name: string;
  value: string;
}

export interface PageContent {
  id: string;
  subject: Subject;
  book: string;
  chapter: string;
  pageNumber: number;
  title: string;
  /** Short concept summary for the top of the page. */
  concept: string;
  questions: Question[];
  mnemonics: Mnemonic[];
  shorthand: Shorthand[];
  cheatSheet: CheatRow[];
}

export interface PageSummary {
  id: string;
  subject: Subject;
  book: string;
  chapter: string;
  pageNumber: number;
  title: string;
}
