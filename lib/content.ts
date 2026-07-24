import type { PageContent, PageSummary } from "./types.ts";
import { PAGES } from "./data/pages.ts";

const BY_ID = new Map<string, PageContent>(PAGES.map((p) => [p.id, p]));

export function getAllPages(): PageContent[] {
  return PAGES;
}

export function getPage(id: string): PageContent | undefined {
  return BY_ID.get(id);
}

export function listPageSummaries(): PageSummary[] {
  return PAGES.map(({ id, subject, book, chapter, pageNumber, title }) => ({
    id,
    subject,
    book,
    chapter,
    pageNumber,
    title,
  }));
}
