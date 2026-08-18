// Builds a production PDF for every digitized paper: digital-documents/<slug>/
// (paper.json + qr.png) → LaTeX → XeLaTeX → docs/<slug>.pdf.
// Usage: npm run pdf            (BASE_URL sets the printed QR target URL label)
import { execFileSync } from "node:child_process";
import {
  copyFileSync,
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { latexFromText } from "../lib/latex";

interface Step {
  label: string;
  detail: string;
}

interface Solution {
  prompt?: string;
  answer: string;
  steps: Step[];
  why: string;
}

interface PaperQuestion extends Solution {
  code: string;
  number: number;
  marks: number;
  prompt: string;
  options?: string[];
  difficulty: string;
  figure?: string;
  /** Figure crops from the source PDF (paths relative to the paper folder). */
  figureImages?: string[];
  alternative?: Solution;
  provenance?: Record<string, string>;
}

interface Paper {
  id: string;
  exam: string;
  subject: string;
  title: string;
  date: string;
  fullMarks: number;
  timeMinutes: number;
  instructions: string[];
  sourcePdf: string;
  digitizationNote?: string;
  sections?: { name: string; marksPerQuestion: number; questionNumbers: number[] }[];
  questions: PaperQuestion[];
}

const ROOT = process.cwd();
const PAPERS_DIR = join(ROOT, "digital-documents");
const OUT_DIR = join(ROOT, "docs");
const BASE_URL = (process.env.BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");

const T = latexFromText;

/** Folder of the paper currently being built; figure paths resolve against it. */
let currentPaperDir = "";

function figureWidthBp(relPath: string): number {
  // PNG IHDR: width is the big-endian uint32 at byte offset 16.
  const px = readFileSync(join(currentPaperDir, relPath)).readUInt32BE(16);
  return Math.round((px * 72) / 300);
}

const PREAMBLE = String.raw`\documentclass[11pt,a4paper]{article}
\usepackage[margin=2.3cm,top=2.8cm,bottom=2.6cm]{geometry}
\usepackage{amsmath,amssymb}
\usepackage{fontspec}
\setmainfont{TeX Gyre Pagella}
\usepackage{graphicx}
\usepackage{xcolor}
\definecolor{ink}{HTML}{141B2E}
\definecolor{lime}{HTML}{D7F464}
\definecolor{slate}{HTML}{5A647A}
\usepackage{enumitem}
\usepackage{longtable}
\usepackage{fancyhdr}
\usepackage[hidelinks]{hyperref}
\setlength{\parindent}{0pt}
\setlength{\parskip}{4pt}
\newcommand{\papersection}[1]{\par\bigskip{\Large\bfseries\color{ink}#1}\\[0.15em]{\color{lime}\rule{\linewidth}{2.5pt}}\par\medskip}
\newcommand{\qmeta}[1]{{\small\color{slate}[#1]}}
\pagestyle{fancy}
\fancyhf{}
\renewcommand{\headrulewidth}{0.4pt}
`;

function questionBlock(q: PaperQuestion): string {
  const lines: string[] = [];
  lines.push(
    `\\textbf{\\color{ink}${T(q.code)}.}\\enspace ${T(q.prompt)} \\qmeta{${q.marks} mark${q.marks > 1 ? "s" : ""} · ${T(q.difficulty)}}\\par`
  );
  if (q.figureImages?.length) {
    // 300 DPI crops: explicit width in bp (= px · 72/300) reproduces the source print size.
    const imgs = q.figureImages
      .map((f) => `\\includegraphics[width=${figureWidthBp(f)}bp]{${f}}`)
      .join("\\quad ");
    lines.push(`\\begin{center}${imgs}\\end{center}`);
  } else if (q.figure) {
    lines.push(`{\\small\\itshape\\color{slate}Figure: ${T(q.figure)}}\\par`);
  }
  if (q.options?.length) {
    lines.push(`\\begin{enumerate}[label=(\\alph*),nosep,leftmargin=2.4em,topsep=2pt]`);
    for (const opt of q.options) lines.push(`  \\item ${T(opt)}`);
    lines.push(`\\end{enumerate}`);
  }
  if (q.alternative) {
    lines.push(`\\smallskip{\\itshape\\color{slate}Or}\\par`);
    lines.push(T(q.alternative.prompt ?? ""));
    lines.push(`\\par`);
  }
  lines.push(`\\medskip`);
  return lines.join("\n");
}

function solutionBody(s: Solution): string {
  const lines: string[] = [];
  lines.push(`\\textbf{Answer:} ${T(s.answer)}\\par`);
  lines.push(`\\begin{itemize}[nosep,leftmargin=1.6em,topsep=2pt]`);
  for (const st of s.steps) lines.push(`  \\item \\textbf{${T(st.label)}:} ${T(st.detail)}`);
  lines.push(`\\end{itemize}`);
  lines.push(`{\\itshape\\color{slate}${T(s.why)}}\\par`);
  return lines.join("\n");
}

function answerKeyGrid(paper: Paper): string | null {
  const letters = paper.questions.map((q) => q.answer.match(/^\(([a-eA-E])\)/)?.[1]?.toLowerCase());
  if (letters.some((l) => !l)) return null; // mixed papers carry answers in the solutions instead
  const lines: string[] = [
    `\\begin{longtable}{|c c|c c|c c|c c|c c|}`,
    `\\hline`,
  ];
  for (let i = 0; i < letters.length; i += 5) {
    const row = [];
    for (let j = i; j < i + 5; j++) {
      row.push(j < letters.length ? `\\textbf{${j + 1}} & (${letters[j]})` : ` & `);
    }
    lines.push(row.join(" & ") + ` \\\\`);
  }
  lines.push(`\\hline`, `\\end{longtable}`);
  return lines.join("\n");
}

function buildTex(paper: Paper): string {
  const solutionsGenerated = paper.questions[0]?.provenance?.steps?.includes("generated");
  const url = `${BASE_URL}/p/${paper.id}`;
  const out: string[] = [PREAMBLE];

  out.push(String.raw`\fancyhead[L]{\small\itshape ${T(paper.exam)}}`);
  out.push(String.raw`\fancyhead[R]{\small ${T(paper.subject)} · ${T(paper.date)}}`);
  out.push(String.raw`\fancyfoot[C]{\small\color{slate}\thepage}`);
  out.push(String.raw`\fancyfoot[L]{\small\color{slate}PW Twin}`);
  out.push(String.raw`\begin{document}`);

  // Title page
  out.push(String.raw`\begin{titlepage}\centering`);
  out.push(String.raw`\vspace*{1cm}`);
  out.push(`{\\large\\color{slate}${T(paper.exam)}}\\\\[0.9em]`);
  out.push(`{\\Huge\\bfseries\\color{ink}${T(paper.title)}}\\\\[0.7em]`);
  out.push(String.raw`{\color{lime}\rule{7cm}{4pt}}\\[1.4em]`);
  out.push(
    `{\\large ${T(paper.subject)} · Full marks ${paper.fullMarks} · ${paper.timeMinutes} minutes · ${paper.questions.length} questions}\\\\`
  );
  out.push(String.raw`\vfill`);
  out.push(String.raw`\includegraphics[width=6.5cm]{qr.png}\\[1.2em]`);
  out.push(String.raw`{\Large\bfseries\color{ink} Scan to open this paper's digital twin}\\[0.4em]`);
  out.push(
    `{\\color{slate}Every question, its stepwise solution, and a doubt chat locked to this paper.}\\\\[0.4em]`
  );
  out.push(`{\\small\\texttt{${T(url)}}}\\\\`);
  out.push(String.raw`\vfill`);
  out.push(`{\\small\\color{slate}PW Twin · digitized from \\texttt{${T(paper.sourcePdf)}}}\\\\`);
  if (paper.digitizationNote) out.push(`{\\footnotesize\\color{slate}${T(paper.digitizationNote)}}`);
  out.push(String.raw`\end{titlepage}`);

  // Instructions
  out.push(`\\papersection{Instructions}`);
  out.push(`\\begin{itemize}[nosep,leftmargin=1.6em]`);
  for (const line of paper.instructions) out.push(`  \\item ${T(line)}`);
  out.push(`\\end{itemize}`);

  // Questions, grouped by section when the paper defines sections
  const sections = paper.sections?.length
    ? paper.sections
    : [{ name: "Questions", marksPerQuestion: NaN, questionNumbers: paper.questions.map((q) => q.number) }];
  for (const s of sections) {
    const label = Number.isNaN(s.marksPerQuestion)
      ? T(s.name)
      : `${T(s.name)} — ${s.marksPerQuestion} mark${s.marksPerQuestion > 1 ? "s" : ""} each`;
    out.push(`\\papersection{${label}}`);
    for (const n of s.questionNumbers) {
      const q = paper.questions.find((x) => x.number === n);
      if (q) out.push(questionBlock(q));
    }
  }

  // Answer key (only when every answer reduces to an option letter)
  const key = answerKeyGrid(paper);
  if (key) {
    out.push(String.raw`\clearpage`);
    out.push(`\\papersection{Answer Key}`);
    out.push(key);
  }

  // Solutions
  out.push(String.raw`\clearpage`);
  out.push(`\\papersection{Solutions}`);
  out.push(
    solutionsGenerated
      ? `{\\itshape\\color{slate}Generated during digitization — the source paper ships without a key. Review before student-facing use.}\\par\\medskip`
      : `{\\itshape\\color{slate}Transcribed from the paper's own answer key and explanations.}\\par\\medskip`
  );
  for (const q of paper.questions) {
    out.push(`\\textbf{\\color{ink}${T(q.code)}.}\\par`);
    out.push(solutionBody(q));
    if (q.alternative) {
      out.push(`\\smallskip{\\itshape\\color{slate}Or — ${T(q.alternative.prompt ?? "")}}\\par`);
      out.push(solutionBody(q.alternative));
    }
    out.push(`\\medskip`);
  }

  out.push(String.raw`\end{document}`);
  return out.join("\n");
}

function compile(slug: string): void {
  const srcDir = join(PAPERS_DIR, slug);
  const paper = JSON.parse(readFileSync(join(srcDir, "paper.json"), "utf8")) as Paper;
  currentPaperDir = srcDir;
  const build = mkdtempSync(join(tmpdir(), `pwtwin-pdf-${slug}-`));
  try {
    writeFileSync(join(build, "paper.tex"), buildTex(paper));
    copyFileSync(join(srcDir, "qr.png"), join(build, "qr.png"));
    if (existsSync(join(srcDir, "figures"))) {
      cpSync(join(srcDir, "figures"), join(build, "figures"), { recursive: true });
    }
    for (let pass = 0; pass < 2; pass++) {
      execFileSync("xelatex", ["-interaction=nonstopmode", "-halt-on-error", "paper.tex"], {
        cwd: build,
        stdio: "pipe",
      });
    }
    mkdirSync(OUT_DIR, { recursive: true });
    copyFileSync(join(build, "paper.pdf"), join(OUT_DIR, `${slug}.pdf`));
    console.log(`${slug} -> docs/${slug}.pdf`);
  } catch (err) {
    const log = join(build, "paper.log");
    if (existsSync(log)) {
      const tail = readFileSync(log, "utf8").split("\n").slice(-40).join("\n");
      console.error(`--- xelatex log tail for ${slug} ---\n${tail}`);
    }
    throw err;
  } finally {
    rmSync(build, { recursive: true, force: true });
  }
}

for (const entry of readdirSync(PAPERS_DIR, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  if (!existsSync(join(PAPERS_DIR, entry.name, "paper.json"))) continue;
  if (!existsSync(join(PAPERS_DIR, entry.name, "qr.png"))) {
    console.error(`${entry.name}: qr.png missing — run \`npm run qr\` first`);
    process.exitCode = 1;
    continue;
  }
  compile(entry.name);
}
