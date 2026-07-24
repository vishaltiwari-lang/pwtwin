# PW Twin — QR Page-Companion Chatbot Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A student scans a QR code printed on a JEE/NEET module page and instantly gets a page-scoped companion — that page's questions, mnemonics, shorthand, cheat sheet, and stepwise solutions — plus a doubt chat locked to that page's content.

**Architecture:** Next.js 15 App Router full-stack app on a single localhost port. A printed QR encodes `http://<host>/p/<pageId>`. The server component for `/p/[pageId]` loads that page's seeded content and renders the companion UI. The doubt chat posts to `/api/chat`, which grounds every answer in only that page's content: it calls Claude when `ANTHROPIC_API_KEY` is set, and otherwise falls back to a deterministic, content-grounded answer engine so the app is fully functional offline. A `/publisher` route renders scannable QR codes for every seeded page so the scan flow can be tested end-to-end.

**Tech Stack:** Next.js 15, React 19, TypeScript, `html5-qrcode` (camera scanning), `qrcode` (QR generation), `@anthropic-ai/sdk` (optional live chat), `next/font` (self-hosted Google Fonts). Styling: hand-authored CSS with a design-token system (no UI framework).

## Global Constraints

- Node 24, npm. Windows dev host; all commands must work in PowerShell/Git Bash.
- Single command to run: `npm run dev` serves everything on `http://localhost:3000`.
- No external network required at runtime for core features. Live Claude chat is strictly opt-in via `.env.local`.
- Chat scope is **page-only**: the model/engine is given only the scanned page's content and must not answer as if it has the whole chapter.
- Science content must be factually correct (well-established, syllabus-level facts only).
- Mobile-first: the scan-and-study flow must be excellent at 390px width; scale up gracefully.
- Accessibility floor: visible keyboard focus, `prefers-reduced-motion` respected, semantic landmarks, color contrast AA for text.

## Design Tokens (derived from the brief, not defaults)

**Concept:** "The page's digital twin." Signature = the highlighter — a highlighter-lime scan line reveals content, and key terms get a marker-swipe on reveal. Subject-coded spine encodes the real structure of exam modules.

**Color**
- `--ink: #141B2E` (deep ink navy — text, focus surfaces)
- `--paper: #EEF0F4` (cool study paper — app background)
- `--surface: #FAFBFC` (raised card)
- `--highlighter: #E9FF5A` (signature marker accent; used sparingly)
- Subject accents (functional coding, one per page): Physics `#3D7DFF`, Chemistry `#12A5B8`, Biology `#48B961`, Math `#8B5CF6`.
- Support: `--ink-60: #4A5169`, `--line: #DDE1E9`, `--ok: #2FB35A`, `--warn: #E9A23B`.

**Type**
- Display / UI: **Space Grotesk** (technical, characterful, restrained).
- Reading / explanations (textbook voice): **Newsreader** (serif) — solution prose reads like a textbook.
- Utility / data / formulas / codes: **JetBrains Mono**.

**Layout**
- Phone-native single column; on desktop, center a ~440px "device" column over an ambient graph-paper backdrop (a phone on a study desk).
- Companion: sticky page header (subject spine + book + chapter + page N) → segmented tabs (Questions · Mnemonics · Shorthand · Cheat Sheet · Solutions) → content cards → docked "Ask a doubt" bar expanding into chat.

**Signature**
- Scan reveal: highlighter-lime scan line sweeps the captured page; content "develops" in.
- Marker-swipe: key mnemonic terms get a highlighter swipe on first reveal.

---

## File Structure

- `package.json`, `next.config.mjs`, `tsconfig.json`, `.gitignore`, `.env.local.example`, `README.md`
- `app/layout.tsx` — root layout, fonts, `<html>` shell.
- `app/globals.css` — tokens + base + component styles.
- `app/page.tsx` — landing / scan screen (client scanner + demo list).
- `app/p/[pageId]/page.tsx` — server component; loads content, renders `Companion`.
- `app/p/[pageId]/not-found.tsx` — unknown page id.
- `app/publisher/page.tsx` — QR codes for all seeded pages.
- `app/api/chat/route.ts` — POST doubt → grounded answer (Claude or fallback).
- `components/Scanner.tsx` — camera QR scan + manual code entry + demo picker.
- `components/Companion.tsx` — client shell: tabs state + chat state + reveal.
- `components/PageHeader.tsx`, `QuestionCard.tsx`, `MnemonicList.tsx`, `Shorthand.tsx`, `CheatSheet.tsx`, `StepwiseSolution.tsx`, `ChatDock.tsx`, `ScanReveal.tsx`, `QrTile.tsx`.
- `lib/types.ts` — `PageContent`, `Question`, `Step`, etc.
- `lib/content.ts` — `getPage(id)`, `getAllPages()`, `listPageSummaries()`.
- `lib/data/pages.ts` — seeded page content (Physics, Chemistry, Biology, Math).
- `lib/ai.ts` — `buildSystemPrompt(page)`, `groundedFallbackAnswer(page, question)`, `answerDoubt(...)`.
- `lib/ai.test.ts`, `lib/content.test.ts` — unit tests (node:test).

---

### Task 1: Project scaffold and design-token base

**Files:**
- Create: `package.json`, `next.config.mjs`, `tsconfig.json`, `.gitignore`, `.env.local.example`, `app/layout.tsx`, `app/globals.css`, `app/page.tsx` (placeholder).

**Interfaces:**
- Produces: a running Next.js app at `http://localhost:3000` with fonts + tokens loaded.

- [ ] Init git repo (`git init`), add `.gitignore` (node_modules, .next, .env.local).
- [ ] Write `package.json` with scripts `dev`/`build`/`start`/`test`, deps: next, react, react-dom, `@anthropic-ai/sdk`, `html5-qrcode`, `qrcode`; devDeps: typescript, `@types/*`, `@types/qrcode`.
- [ ] `npm install`.
- [ ] Write `app/globals.css` with the full token block and base element styles.
- [ ] Write `app/layout.tsx` loading Space Grotesk, Newsreader, JetBrains Mono via `next/font/google`, exposing them as CSS variables; set metadata.
- [ ] Placeholder `app/page.tsx` renders a title using the tokens.
- [ ] Run `npm run dev`; verify `http://localhost:3000` renders with fonts/tokens. Commit.

### Task 2: Content model + seeded pages + content lib (TDD)

**Files:**
- Create: `lib/types.ts`, `lib/data/pages.ts`, `lib/content.ts`, `lib/content.test.ts`.

**Interfaces:**
- Produces:
  - `type Subject = 'Physics'|'Chemistry'|'Biology'|'Math'`.
  - `interface PageContent { id, subject, book, chapter, pageNumber, title, concept, questions: Question[], mnemonics: Mnemonic[], shorthand: Shorthand[], cheatSheet: CheatRow[] }`.
  - `interface Question { id, code, prompt, options?: string[], answer, difficulty, steps: Step[], why: string }`.
  - `interface Step { label, detail }`, `interface Mnemonic { phrase, expands, note? }`, `interface Shorthand { term, meaning }`, `interface CheatRow { name, value }`.
  - `getPage(id: string): PageContent | undefined`, `getAllPages(): PageContent[]`, `listPageSummaries(): {id,subject,book,chapter,pageNumber,title}[]`.

- [ ] Write `lib/content.test.ts`: asserts every page has ≥2 questions each with ≥2 steps, ≥3 mnemonics, non-empty cheat sheet; `getPage('unknown')` is undefined; all ids unique.
- [ ] Run tests → FAIL (module missing).
- [ ] Write `lib/types.ts`, `lib/data/pages.ts` (4 correct, syllabus-level pages), `lib/content.ts`.
- [ ] Run tests → PASS. Commit.

### Task 3: Grounded answer engine (TDD)

**Files:**
- Create: `lib/ai.ts`, `lib/ai.test.ts`.

**Interfaces:**
- Produces:
  - `buildSystemPrompt(page: PageContent): string` — instructs the model it may ONLY use this page's content and must decline chapter-wide questions.
  - `groundedFallbackAnswer(page: PageContent, userText: string): { text: string; usedQuestionId?: string }` — deterministic: matches the doubt to the nearest question/mnemonic/cheat row by keyword overlap and returns its steps/why, or a scoped "this page covers …" reply.
  - `answerDoubt(page, userText, history): Promise<{ text, source: 'claude'|'offline' }>` — uses Claude if `ANTHROPIC_API_KEY` set, else fallback.

- [ ] Write `lib/ai.test.ts`: `buildSystemPrompt` includes page title + a refusal instruction; `groundedFallbackAnswer` returns a question's stepwise `why` when the doubt keywords match that question; returns a scoped fallback naming the page title when nothing matches.
- [ ] Run → FAIL.
- [ ] Implement `lib/ai.ts` (fallback pure/deterministic; Claude path guarded by env).
- [ ] Run → PASS. Commit.

### Task 4: Chat API route

**Files:**
- Create: `app/api/chat/route.ts`.

**Interfaces:**
- Consumes: `getPage`, `answerDoubt`.
- Produces: `POST /api/chat { pageId, message, history } → { reply, source }`; 400 on bad input; 404 on unknown page.

- [ ] Implement route: validate body, load page, call `answerDoubt`, return JSON. Guard errors → 500 with safe message.
- [ ] Manual check with `curl`/Invoke-RestMethod against a seeded page id → returns grounded reply. Commit.

### Task 5: Companion UI — header, tabs, content cards

**Files:**
- Create: `components/PageHeader.tsx`, `QuestionCard.tsx`, `MnemonicList.tsx`, `Shorthand.tsx`, `CheatSheet.tsx`, `StepwiseSolution.tsx`, `Companion.tsx`; `app/p/[pageId]/page.tsx`, `app/p/[pageId]/not-found.tsx`; extend `globals.css`.

**Interfaces:**
- Consumes: `getPage`, `PageContent`.
- Produces: `/p/<pageId>` renders full page-scoped companion; unknown id → not-found.

- [ ] Server page loads content via `getPage`, calls `notFound()` if missing, renders `<Companion page={page} />`.
- [ ] `Companion` (client) holds active tab; renders header + segmented tabs + the active section. Subject spine color from `page.subject`.
- [ ] `QuestionCard` shows code, prompt, options, difficulty, and a "Why this answer?" action + expandable `StepwiseSolution`.
- [ ] Mnemonics with marker-swipe reveal; Shorthand as term/meaning rows; CheatSheet as mono data rows.
- [ ] Verify at `/p/<firstPageId>` on desktop + 390px. Commit.

### Task 6: Doubt chat dock wired to API

**Files:**
- Create: `components/ChatDock.tsx`; modify `components/Companion.tsx`, `QuestionCard.tsx`.

**Interfaces:**
- Consumes: `POST /api/chat`.
- Produces: docked chat that posts `{pageId, message, history}`, streams messages into the transcript; "Why this answer?" seeds a chat message for that question.

- [ ] `ChatDock`: message list, input, send; loading + error states; shows a "Only this page" scope chip and the answer `source` (offline/live) subtly.
- [ ] Clicking a question's "Why this answer?" opens the dock pre-filled/sent for that question.
- [ ] Verify a doubt round-trip on localhost. Commit.

### Task 7: Scan screen + signature reveal

**Files:**
- Create: `components/Scanner.tsx`, `components/ScanReveal.tsx`; rewrite `app/page.tsx`; extend `globals.css`.

**Interfaces:**
- Consumes: `listPageSummaries`.
- Produces: landing with live camera QR scan (routes to `/p/<id>` on decode), manual code entry, and a demo-page picker; highlighter scan-line animation.

- [ ] `Scanner` (client, dynamic import, no SSR): starts `html5-qrcode`, parses decoded URL/id → `router.push('/p/'+id)`; graceful message if no camera → manual entry + demo list always available.
- [ ] `ScanReveal` scan-line animation; respects reduced motion.
- [ ] Landing renders hero + scanner + demo list from `listPageSummaries`.
- [ ] Verify decode-to-page and demo navigation. Commit.

### Task 8: Publisher QR view

**Files:**
- Create: `components/QrTile.tsx`, `app/publisher/page.tsx`.

**Interfaces:**
- Consumes: `getAllPages`, `qrcode`.
- Produces: `/publisher` renders a printable QR per page encoding `<origin>/p/<id>`, with the page label — usable to test scanning from a phone.

- [ ] `QrTile` (client) renders QR to a canvas/data-URL for `${origin}/p/${id}`.
- [ ] `/publisher` grid of tiles with book/chapter/page labels; print-friendly.
- [ ] Verify QR scans to the right page. Commit.

### Task 9: Polish, README, final verification

**Files:**
- Modify: `globals.css`, `README.md`.

- [ ] Responsive/reduced-motion/focus pass; empty and error states have direction.
- [ ] `README.md`: what it is, `npm install` + `npm run dev`, the `.env.local` Claude upgrade, how to demo via `/publisher`.
- [ ] `npm run build` succeeds; `npm test` passes. Final commit.

---

## Self-Review

- **Spec coverage:** QR → page load (Tasks 5,7,8); page-scoped questions/mnemonics/shorthand/cheat sheet/stepwise (Tasks 2,5); click-a-question "why" explanation (Tasks 5,6); free-form doubt chat scoped to page (Tasks 3,4,6); impressive UI (Tasks 1,5,7 design tokens + signature); runs on localhost (Task 1, single `npm run dev`). Covered.
- **Placeholders:** none — content and interfaces are concrete; UI micro-steps are verified by running on localhost (design work is validated visually, not via brittle DOM unit tests), while pure logic (content integrity, grounded answers, API) is TDD-tested.
- **Type consistency:** `getPage`/`getAllPages`/`listPageSummaries`, `PageContent`, `answerDoubt`, `buildSystemPrompt`, `groundedFallbackAnswer` names are used consistently across Tasks 2–8.
