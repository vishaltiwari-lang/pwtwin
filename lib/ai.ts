import type { PageContent, Question } from "./types";
import { buildMentorSystemPrompt } from "./mentor-prompt";

export type AnswerSource = "live" | "offline";

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

/** The elite mentor prompt (lib/mentor-prompt.ts) with this page's data injected. */
export function buildSystemPrompt(page: PageContent): string {
  return buildMentorSystemPrompt(page);
}

/**
 * Deterministic scope gate: a fresh doubt with enough content words but zero
 * overlap with the page's material is off-page — refuse before spending an
 * LLM call. Conservative on purpose: ongoing conversations and very short
 * messages ("why?", "aur simple batao") always pass through to the model,
 * whose prompt guardrail handles the rest.
 */
function isPageRelated(page: PageContent, userText: string, history: ChatTurn[]): boolean {
  if (history.length > 0) return true;
  const tokens = tokenize(userText);
  if (tokens.length < 3) return true;
  const haystack = [
    page.title,
    page.concept,
    page.chapter,
    ...page.questions.flatMap((q) => [q.prompt, q.answer, ...q.tags, ...q.steps.map((s) => s.detail)]),
    ...page.mnemonics.map((m) => `${m.phrase} ${m.expands}`),
    ...page.shorthand.map((s) => `${s.term} ${s.meaning}`),
    ...page.cheatSheet.map((r) => `${r.name} ${r.value}`),
  ]
    .join(" ")
    .toLowerCase();
  return tokens.some((t) => haystack.includes(t));
}

/**
 * Answers a page-scoped doubt. Uses OpenRouter (GPT-5.6 Terra by default,
 * OPENROUTER_MODEL to override) when OPENROUTER_API_KEY is set, otherwise
 * returns the deterministic grounded fallback. Off-page doubts never reach
 * the model at all.
 */
export async function answerDoubt(
  page: PageContent,
  userText: string,
  history: ChatTurn[] = [],
): Promise<{ text: string; source: AnswerSource }> {
  const apiKey = process.env.OPENROUTER_API_KEY?.trim();
  if (!apiKey || !isPageRelated(page, userText, history)) {
    return { text: groundedFallbackAnswer(page, userText).text, source: "offline" };
  }

  try {
    const model = process.env.OPENROUTER_MODEL?.trim() || "openai/gpt-5.6-terra";

    const messages = [
      { role: "system" as const, content: buildSystemPrompt(page) },
      ...history.slice(-8).map((t) => ({ role: t.role, content: t.text })),
      { role: "user" as const, content: userText },
    ];

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "X-Title": "PW Twin",
      },
      body: JSON.stringify({ model, max_tokens: 1200, messages }),
    });
    if (!response.ok) {
      return { text: groundedFallbackAnswer(page, userText).text, source: "offline" };
    }

    const data = (await response.json()) as {
      choices?: { message?: { content?: string | null } }[];
    };
    const text = data.choices?.[0]?.message?.content?.trim();

    if (!text) {
      return { text: groundedFallbackAnswer(page, userText).text, source: "offline" };
    }
    return { text, source: "live" };
  } catch {
    // Network/key/model error — never break the student's flow.
    return { text: groundedFallbackAnswer(page, userText).text, source: "offline" };
  }
}
