# Digital Documents

Scanned question papers / books (`papersraw/`) ke digitized, structured versions. Yeh PW Twin
content pipeline ka **intermediate, human-reviewable stage** hai:

```
papersraw/ (scanned PDFs)  →  digital-documents/ (Markdown + JSON)  →  app content (lib/data)
```

## Convention

Har source (question paper ya book) ka apna folder, stable kebab-case slug ke saath:

```
digital-documents/
  <source-slug>/
    meta.md          # source metadata: exam/board, year, subject, marks, time, instructions,
                     # source PDF filename, digitization notes
    paper.md         # question papers: poora transcribed paper (human-review ke liye)
    paper.json       # machine-readable version (schema neeche)
    qr.png           # is document ka QR (npm run qr se generate hota hai)
    figures/         # source PDF se crop kiye hue diagrams/graphs (agar hain)
      crops.json     #   crop spec: source PDF + per-figure page & rect (points mein)
      qNN[-x].png    #   300 DPI renders (npm run figures se generate hote hain)
    pages/           # (sirf books ke liye) per printed page ek file: page-001.md ...
```

Diagrams-wale questions `paper.json` mein `figureImages: ["figures/qNN.png"]` carry karte
hain (text wala `figure` description bhi rehta hai — app/doubt-chat grounding ke liye).
`npm run pdf` production PDF mein in crops ko unke original print size pe embed karta hai.

- Slug format: `<board/exam>-<class/subject>-<year/date>` — e.g. `cuet-physics-2024-05-29`.
  Yehi slug aage app mein page IDs ka prefix banega (QR codes per-page hote hain).
- Original PDF page numbers har question ke saath preserve hote hain (`pdfPage`), taki baad
  mein per-page split mechanical ho.
- Math LaTeX notation mein likha jata hai (`$...$`).

## Provenance rules (important)

Scanned papers se deal karte waqt fidelity sabse zaroori hai:

- **`transcribed`** — content jo source PDF mein likha hai, faithfully copy kiya gaya.
- **`generated`** — content jo humne add kiya (e.g. solutions jab paper mein answer key nahi
  hai, difficulty ratings, tags). Markdown mein aise sections clearly marked hote hain.
- Scanned pages mein jo text kata/unclear hai, use `[unclear: best-guess]` mark karte hain —
  silently guess nahi karte. Review ke waqt inhe search karke fix karo.

## paper.json schema

Question-level fields app ke `lib/types.ts` `Question` model se aligned hain, taki
`PageContent` mein conversion mechanical rahe:

```jsonc
{
  "id": "<source-slug>",
  "kind": "question-paper",
  "exam": "...",              // e.g. "NTA CUET (UG)"
  "subject": "Physics",       // app ka Subject type: Physics | Chemistry | Biology | Math
  "title": "...",
  "date": "YYYY-MM-DD",       // ya sirf "YYYY" agar exact date na ho
  "fullMarks": 200,
  "timeMinutes": 60,
  "instructions": ["..."],
  "sourcePdf": "papersraw/....pdf",
  "concept": "...",           // 1-2 line paper summary (app companion ke top pe dikhta hai)
  "studyAids": {              // generated: app content contract ke liye (>=3 har array mein)
    "provenance": "generated",
    "mnemonics": [{ "phrase": "...", "expands": "...", "note": "..." }],
    "shorthand": [{ "term": "...", "meaning": "..." }],
    "cheatSheet": [{ "name": "...", "value": "..." }]
  },
  "sections": [               // agar paper sections mein bata ho; warna ek default section
    { "name": "Section-A", "marksPerQuestion": 1, "questionNumbers": [1, 2] }
  ],
  "questions": [
    {
      "id": "<source-slug>-q01",
      "code": "Q1",           // human-facing label (app Question.code)
      "number": 1,
      "pdfPage": 1,           // source PDF ka page number
      "marks": 5,
      "prompt": "...",        // LaTeX allowed
      "options": ["..."],     // MCQ ke liye; warna omit
      "answer": "...",
      "difficulty": "Easy",   // Easy | Medium | Hard (generated)
      "steps": [{ "label": "...", "detail": "..." }],
      "why": "...",           // ek short paragraph
      "tags": ["..."],        // doubt-matching keywords (generated)
      "figure": "...",        // figure ka text description, agar hai
      "alternative": {        // board-paper internal "Or" choice ke liye (optional)
        "prompt": "...", "answer": "...", "steps": [], "why": "..."
      },
      "provenance": { "answer": "transcribed", "steps": "transcribed" }
                              // har derived field transcribed hai ya generated
    }
  ]
}
```

## Naya source add karne ka process

1. PDF ko `papersraw/` mein rakho.
2. Folder banao slug convention se, `meta.md` likho.
3. Har page ko padh ke transcribe karo (`paper.md` ya `pages/`), provenance rules follow karte hue.
4. `paper.json` banao, question fields app model se aligned.
5. Review: `[unclear:` search karo, answers spot-check karo.
