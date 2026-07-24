# PW Twin — scan the page, meet its twin

A QR-driven doubt-solving companion for printed **JEE / NEET** module pages. Each printed
page carries a QR code; a student scans it and instantly gets a page that shows **only that
page's** questions, mnemonics, shorthand, cheat sheet, and step-by-step solutions — plus a
doubt chat that is locked to that page's content.

> Scan a page → open its digital twin → tap **Ask why** on any question, or type a doubt.
> The tutor answers using that page's content and nothing else.

---

## Quick start

```bash
npm install
npm run dev
```

Open **http://localhost:3000**.

That's it — the app runs fully offline. No API keys, no external services.

### Try the whole flow in 30 seconds

1. On the landing screen, pick any **sample page** (or paste a page code).
2. On the companion, switch tabs (Questions · Mnemonics · Shorthand · Cheat sheet), tap
   **Show solution** on a question, then tap **Ask why** to open the page-scoped doubt chat.
3. To test real scanning, open **http://localhost:3000/publisher** on your laptop and scan any
   QR code with your phone's camera (both devices on the same Wi-Fi — use the Network URL that
   `npm run dev` prints, e.g. `http://192.168.x.x:3000/publisher`, so the phone can reach it).

---

## How it works

- A printed QR encodes `http://<host>/p/<pageId>`. Scanning it opens that page's companion.
- The companion is server-rendered from seeded content in [`lib/data/pages.ts`](lib/data/pages.ts)
  (Physics, Chemistry, Biology, Math). In production these rows would come from the publisher's CMS.
- The doubt chat posts to [`/api/chat`](app/api/chat/route.ts). Every answer is grounded in **only
  the scanned page's** content:
  - **Offline (default):** a deterministic engine matches the doubt to the page's questions,
    mnemonics, or cheat sheet and returns the relevant stepwise explanation — no network needed.
  - **Live (optional):** if `ANTHROPIC_API_KEY` is set, it calls Claude with a system prompt that
    embeds the page and forbids answering anything off-page.

### Optional: turn on live Claude answers

```bash
cp .env.local.example .env.local
# paste your key into ANTHROPIC_API_KEY, then restart `npm run dev`
```

Without a key, the doubt chat still works using the offline engine. Answers show a small
`page tutor` (offline) or `live tutor` (Claude) label.

---

## Design

- **Type:** Space Grotesk (UI), Newsreader (textbook-voice explanations), JetBrains Mono
  (formulas, codes, data).
- **Signature:** the highlighter — a highlighter-lime scan line reveals content on the scan
  screen, and key terms get a marker swipe.
- **Subject coding:** each page is colour-coded (Physics blue, Chemistry teal, Biology green,
  Math violet) on the spine, question chips, and demo/QR tiles.
- Mobile-first (scanning happens on phones); scales to a centred device column on desktop.

## Project structure

```
app/
  page.tsx              landing / scan screen
  p/[pageId]/page.tsx   companion (server-rendered per page)
  publisher/page.tsx    printable QR sheet
  api/chat/route.ts     page-scoped doubt endpoint
components/             Scanner, Companion, QuestionCard, ChatDock, QrTile, …
lib/
  data/pages.ts         seeded module-page content
  content.ts            content lookup
  ai.ts                 grounded answer engine (offline + Claude)
  types.ts              content model
```

## Scripts

```bash
npm run dev     # start on http://localhost:3000
npm run build   # production build
npm start       # serve the production build
npm test        # unit tests (content integrity + grounded answer engine)
```

## Tests

`npm test` runs the Node test runner over the content model and the grounded answer engine —
verifying every page meets the content contract and that doubts stay scoped to their page.
