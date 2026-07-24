"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export interface ChatMessage {
  role: "user" | "assistant";
  text: string;
  source?: "claude" | "offline";
}

/** Parse a single line's inline **bold** and `code` into React nodes (no HTML injection). */
function renderInline(line: string, keyBase: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let i = 0;
  while ((match = regex.exec(line)) !== null) {
    if (match.index > last) nodes.push(line.slice(last, match.index));
    const token = match[0];
    if (token.startsWith("**")) {
      nodes.push(<strong key={`${keyBase}-b${i}`}>{token.slice(2, -2)}</strong>);
    } else {
      nodes.push(<code key={`${keyBase}-c${i}`}>{token.slice(1, -1)}</code>);
    }
    last = match.index + token.length;
    i += 1;
  }
  if (last < line.length) nodes.push(line.slice(last));
  return nodes;
}

/** Lightweight, safe markdown-ish renderer for bot replies. */
function RichText({ text }: { text: string }) {
  const lines = text.split("\n");
  const out: ReactNode[] = [];
  let para: string[] = [];

  const flushPara = (key: string) => {
    if (para.length) {
      const joined = para.join(" ");
      out.push(<p key={key}>{renderInline(joined, key)}</p>);
      para = [];
    }
  };

  lines.forEach((raw, idx) => {
    const line = raw.trimEnd();
    const listMatch = line.match(/^\s*(?:[-*]|\d+\.)\s+(.*)$/);
    if (listMatch) {
      flushPara(`p${idx}`);
      out.push(
        <span className="msg__li" key={`li${idx}`}>
          <span className="msg__li-marker" aria-hidden>
            •
          </span>
          <span>{renderInline(listMatch[1], `li${idx}`)}</span>
        </span>,
      );
    } else if (line.trim() === "") {
      flushPara(`p${idx}`);
    } else {
      para.push(line);
    }
  });
  flushPara("pEnd");
  return <>{out}</>;
}

const SUGGESTIONS = [
  "Explain this page simply",
  "Give me the mnemonics",
  "Show the cheat sheet",
];

export default function ChatDock({
  pageId,
  open,
  onOpenChange,
  seed,
  onSeedConsumed,
}: {
  pageId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  seed?: string | null;
  onSeedConsumed: () => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const history = messages.map((m) => ({ role: m.role, text: m.text }));
    setMessages((prev) => [...prev, { role: "user", text: trimmed }]);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageId, message: trimmed, history }),
      });
      if (!res.ok) throw new Error("bad status");
      const data: { reply: string; source: "claude" | "offline" } = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: data.reply, source: data.source },
      ]);
    } catch {
      setError("Couldn't reach the tutor just now. Try again in a moment.");
    } finally {
      setLoading(false);
    }
  };

  // Fire a seeded question (from a "Ask why" button) once.
  useEffect(() => {
    if (seed) {
      void send(seed);
      onSeedConsumed();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed]);

  // Autoscroll to the newest message.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!open) onOpenChange(true);
    void send(input);
  };

  return (
    <>
      {open && <div className="scrim" onClick={() => onOpenChange(false)} />}
      <div className={`dock${open ? " dock--open" : ""}`}>
        {open && (
          <div className="dock__panel" role="dialog" aria-label="Doubt chat for this page">
            <div className="dock__head">
              <span className="dock__title">
                Doubt chat
                <span className="dock__scope">Only this page</span>
              </span>
              <button className="dock__close" aria-label="Close chat" onClick={() => onOpenChange(false)}>
                ×
              </button>
            </div>

            <div className="dock__scroll" ref={scrollRef}>
              {messages.length === 0 && !loading && (
                <div className="dock__empty">
                  Ask anything about this page — a question, a step you don&apos;t follow, or
                  &ldquo;explain it simply.&rdquo;
                  <div className="dock__suggests">
                    {SUGGESTIONS.map((s) => (
                      <button key={s} className="suggest" onClick={() => send(s)}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((m, i) => (
                <div className={`msg msg--${m.role === "user" ? "user" : "bot"}`} key={i}>
                  <div className="msg__bubble">
                    {m.role === "assistant" ? <RichText text={m.text} /> : m.text}
                  </div>
                  {m.role === "assistant" && (
                    <span className="msg__meta">
                      {m.source === "claude" ? "live tutor" : "page tutor"}
                    </span>
                  )}
                </div>
              ))}

              {loading && (
                <div className="msg msg--bot">
                  <div className="msg__bubble">
                    <span className="typing" aria-label="Tutor is typing">
                      <span />
                      <span />
                      <span />
                    </span>
                  </div>
                </div>
              )}

              {error && <p className="dock__error">{error}</p>}
            </div>
          </div>
        )}

        <form className="dock__bar" onSubmit={onSubmit}>
          <textarea
            ref={inputRef}
            className="dock__input"
            rows={1}
            placeholder="Ask a doubt about this page…"
            value={input}
            onFocus={() => !open && onOpenChange(true)}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSubmit(e);
              }
            }}
          />
          <button
            className="dock__send"
            type="submit"
            aria-label="Send"
            disabled={loading || !input.trim()}
          >
            ↑
          </button>
        </form>
      </div>
    </>
  );
}
