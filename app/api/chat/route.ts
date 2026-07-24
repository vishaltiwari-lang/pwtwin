import { NextResponse } from "next/server";
import { getPage } from "@/lib/content";
import { answerDoubt, type ChatTurn } from "@/lib/ai";

export const runtime = "nodejs";

interface ChatBody {
  pageId?: unknown;
  message?: unknown;
  history?: unknown;
}

function sanitizeHistory(raw: unknown): ChatTurn[] {
  if (!Array.isArray(raw)) return [];
  const turns: ChatTurn[] = [];
  for (const item of raw) {
    if (
      item &&
      typeof item === "object" &&
      (item as ChatTurn).role &&
      typeof (item as ChatTurn).text === "string"
    ) {
      const role = (item as ChatTurn).role === "assistant" ? "assistant" : "user";
      turns.push({ role, text: String((item as ChatTurn).text).slice(0, 4000) });
    }
  }
  return turns.slice(-12);
}

export async function POST(request: Request) {
  let body: ChatBody;
  try {
    body = (await request.json()) as ChatBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const pageId = typeof body.pageId === "string" ? body.pageId : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";

  if (!pageId || !message) {
    return NextResponse.json(
      { error: "Both pageId and a non-empty message are required." },
      { status: 400 },
    );
  }

  const page = getPage(pageId);
  if (!page) {
    return NextResponse.json({ error: "Unknown page." }, { status: 404 });
  }

  try {
    const { text, source } = await answerDoubt(
      page,
      message.slice(0, 2000),
      sanitizeHistory(body.history),
    );
    return NextResponse.json({ reply: text, source });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong answering that. Please try again." },
      { status: 500 },
    );
  }
}
