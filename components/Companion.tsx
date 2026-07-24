"use client";

import { useState } from "react";
import type { PageContent, Question } from "@/lib/types";
import PageHeader from "./PageHeader";
import QuestionCard from "./QuestionCard";
import MnemonicList from "./MnemonicList";
import Shorthand from "./Shorthand";
import CheatSheet from "./CheatSheet";
import ChatDock from "./ChatDock";

type TabId = "questions" | "mnemonics" | "shorthand" | "cheat";

export default function Companion({ page }: { page: PageContent }) {
  const [tab, setTab] = useState<TabId>("questions");
  const [chatOpen, setChatOpen] = useState(false);
  const [seed, setSeed] = useState<string | null>(null);

  const tabs: { id: TabId; label: string; count: number }[] = [
    { id: "questions", label: "Questions", count: page.questions.length },
    { id: "mnemonics", label: "Mnemonics", count: page.mnemonics.length },
    { id: "shorthand", label: "Shorthand", count: page.shorthand.length },
    { id: "cheat", label: "Cheat sheet", count: page.cheatSheet.length },
  ];

  const askAbout = (q: Question) => {
    setChatOpen(true);
    setSeed(`Explain ${q.code} — "${q.prompt}" — and why the answer is what it is.`);
  };

  return (
    <main className="desk">
      <div className="device companion" data-subject={page.subject}>
        <PageHeader page={page} />

        <nav className="tabs" role="tablist" aria-label="Page sections">
          {tabs.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              className="tab"
              onClick={() => setTab(t.id)}
            >
              {t.label}
              <span className="tab__count">{t.count}</span>
            </button>
          ))}
        </nav>

        <section className="panel" role="tabpanel">
          {tab === "questions" && (
            <>
              <p className="panel__lead">Questions on this page · tap “Ask why” for a walkthrough</p>
              {page.questions.map((q) => (
                <QuestionCard key={q.id} question={q} onAsk={askAbout} />
              ))}
            </>
          )}

          {tab === "mnemonics" && (
            <>
              <div className="introCard">
                <p className="introCard__label">Memory aids</p>
                <p className="introCard__text">
                  Quick hooks to lock in the ideas on this page.
                </p>
              </div>
              <MnemonicList mnemonics={page.mnemonics} />
            </>
          )}

          {tab === "shorthand" && (
            <>
              <p className="panel__lead">Symbols &amp; shorthand used here</p>
              <Shorthand rows={page.shorthand} />
            </>
          )}

          {tab === "cheat" && (
            <>
              <p className="panel__lead">Formula &amp; fact sheet for this page</p>
              <CheatSheet rows={page.cheatSheet} />
            </>
          )}
        </section>

        <ChatDock
          pageId={page.id}
          open={chatOpen}
          onOpenChange={setChatOpen}
          seed={seed}
          onSeedConsumed={() => setSeed(null)}
        />
      </div>
    </main>
  );
}
