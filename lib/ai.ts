import type { PageContent, Question } from "./types.ts";

export type AnswerSource = "claude" | "offline";

export interface ChatTurn {
  role: "user" | "assistant";
  text: string;
}

const STOP_WORDS = new Set([
  "the", "a", "an", "of", "to", "in", "on", "for", "and", "or", "is", "are",
  "this", "that", "it", "why", "how", "what", "does", "do", "please", "explain",
  "me", "my", "i", "we", "can", "you", "about", "give", "tell", "help", "with",
  "question", "doubt", "page", "here", "there", "which", "when", "where", "get",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9²/\-\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w));
}

/** Detect an explicit reference like "q2", "question 2", "second question". */
function referencedQuestion(page: PageContent, userText: string): Question | undefined {
  const t = userText.toLowerCase();
  const codeMatch = t.match(/\bq(?:uestion)?\s*([0-9]+)\b/);
  if (codeMatch) {
    const n = Number(codeMatch[1]);
    const byCode = page.questions.find((q) => q.code.toLowerCase() === `q${n}`);
    if (byCode) return byCode;
    if (page.questions[n - 1]) return page.questions[n - 1];
  }
  const ordinals: Record<string, number> = { first: 1, second: 2, third: 3, fourth: 4 };
  for (const [word, n] of Object.entries(ordinals)) {
    if (t.includes(word)) return page.questions[n - 1];
  }
  return undefined;
}

function scoreQuestion(q: Question, tokens: string[]): number {
  const haystack = [q.prompt, q.answer, ...q.tags, ...q.steps.map((s) => s.detail)]
    .join(" ")
    .toLowerCase();
  let score = 0;
  for (const tok of tokens) {
    if (q.tags.some((tag) => tag.includes(tok))) score += 3;
    else if (haystack.includes(tok)) score += 1;
  }
  return score;
}

function formatQuestionAnswer(q: Question): string {
  const steps = q.steps.map((s, i) => `${i + 1}. **${s.label}** — ${s.detail}`).join("\n");
  return [
    `**${q.code}. ${q.prompt}**`,
    "",
    `**Answer:** ${q.answer}`,
    "",
    q.why,
    "",
    "**Step by step:**",
    steps,
  ].join("\n");
}

/**
 * Deterministic, page-scoped answer engine used when no live model is
 * configured. Matches the doubt to the nearest question, then falls back to
 * mnemonics/cheat sheet, then to a scoped "this page covers…" reply.
 */
export function groundedFallbackAnswer(
  page: PageContent,
  userText: string,
): { text: string; usedQuestionId?: string } {
  const tokens = tokenize(userText);

  const explicit = referencedQuestion(page, userText);
  if (explicit) {
    return { text: formatQuestionAnswer(explicit), usedQuestionId: explicit.id };
  }

  let best: Question | undefined;
  let bestScore = 0;
  for (const q of page.questions) {
    const s = scoreQuestion(q, tokens);
    if (s > bestScore) {
      bestScore = s;
      best = q;
    }
  }
  if (best && bestScore >= 2) {
    return { text: formatQuestionAnswer(best), usedQuestionId: best.id };
  }

  const wantsMnemonic = /mnemonic|remember|trick|memor|shortcut|short-?hand/i.test(userText);
  if (wantsMnemonic && page.mnemonics.length) {
    const lines = page.mnemonics
      .map((m) => `- ${m.phrase} — ${m.expands}`)
      .join("\n");
    return { text: `Here are the memory aids for **${page.title}**:\n\n${lines}` };
  }

  const wantsCheat = /cheat|formula|values?|summary|revise|revision/i.test(userText);
  if (wantsCheat && page.cheatSheet.length) {
    const rows = page.cheatSheet.map((r) => `- ${r.name}: \`${r.value}\``).join("\n");
    return { text: `Cheat sheet for **${page.title}**:\n\n${rows}` };
  }

  const topics = page.questions.map((q) => `- ${q.code}: ${q.prompt}`).join("\n");
  return {
    text:
      `I can only help with this page — **${page.title}** ` +
      `(${page.book}, ${page.chapter}, p.${page.pageNumber}). ` +
      `It covers:\n\n${topics}\n\nAsk me about one of these, or tap "Why this answer?" on a question.`,
  };
}

export function buildSystemPrompt(page: PageContent): string {
  const questions = page.questions
    .map((q) => {
      const steps = q.steps.map((s, i) => `    ${i + 1}. ${s.label}: ${s.detail}`).join("\n");
      const opts = q.options ? `\n  Options: ${q.options.join(" | ")}` : "";
      return `- ${q.code} (${q.difficulty}): ${q.prompt}${opts}\n  Answer: ${q.answer}\n  Why: ${q.why}\n  Steps:\n${steps}`;
    })
    .join("\n\n");

  const mnemonics = page.mnemonics.map((m) => `- ${m.phrase}: ${m.expands}`).join("\n");
  const shorthand = page.shorthand.map((s) => `- ${s.term} = ${s.meaning}`).join("\n");
  const cheat = page.cheatSheet.map((r) => `- ${r.name}: ${r.value}`).join("\n");

  return [
    `You are PW Twin, a warm, encouraging JEE/NEET study companion embedded next to a single printed module page.`,
    `You are STRICTLY scoped to THIS page only. Do not answer questions about other pages, chapters, or unrelated topics.`,
    `If a student asks something outside this page's scope, gently say it's beyond this page and point them to what this page does cover.`,
    `Explain like a patient tutor: short steps, plain language, and the intuition behind the "why". Use the page's own mnemonics and shorthand when helpful.`,
    ``,
    `=== THIS PAGE ===`,
    `Subject: ${page.subject}`,
    `Book: ${page.book}`,
    `Chapter: ${page.chapter} (page ${page.pageNumber})`,
    `Title: ${page.title}`,
    `Concept: ${page.concept}`,
    ``,
    `Questions on this page:`,
    questions,
    ``,
    `Mnemonics:\n${mnemonics}`,
    ``,
    `Shorthand:\n${shorthand}`,
    ``,
    `Cheat sheet:\n${cheat}`,
  ].join("\n");
}

/**
 * Answers a page-scoped doubt. Uses Claude when ANTHROPIC_API_KEY is set,
 * otherwise returns the deterministic grounded fallback.
 */
export async function answerDoubt(
  page: PageContent,
  userText: string,
  history: ChatTurn[] = [],
): Promise<{ text: string; source: AnswerSource }> {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) {
    return { text: groundedFallbackAnswer(page, userText).text, source: "offline" };
  }

  try {
    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    const client = new Anthropic({ apiKey });
    const model = process.env.ANTHROPIC_MODEL?.trim() || "claude-sonnet-5";

    const messages = [
      ...history.slice(-8).map((t) => ({
        role: t.role,
        content: t.text,
      })),
      { role: "user" as const, content: userText },
    ];

    const response = await client.messages.create({
      model,
      max_tokens: 1200,
      system: buildSystemPrompt(page),
      messages,
    });

    if (response.stop_reason === "refusal") {
      return { text: groundedFallbackAnswer(page, userText).text, source: "offline" };
    }

    const text = response.content
      .filter((b): b is { type: "text"; text: string } => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();

    if (!text) {
      return { text: groundedFallbackAnswer(page, userText).text, source: "offline" };
    }
    return { text, source: "claude" };
  } catch {
    // Network/key/model error — never break the student's flow.
    return { text: groundedFallbackAnswer(page, userText).text, source: "offline" };
  }
}
