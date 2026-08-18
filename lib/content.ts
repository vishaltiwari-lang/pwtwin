import type { PageContent, PageSummary } from "./types";
import { PAGES } from "./data/pages";
import { loadPaperPages } from "./papers";

const ALL_PAGES: PageContent[] = [...PAGES, ...loadPaperPages()];
const BY_ID = new Map<string, PageContent>(ALL_PAGES.map((p) => [p.id, p]));

export function getAllPages(): PageContent[] {
  return ALL_PAGES;
}

export function getPage(id: string): PageContent | undefined {
  return BY_ID.get(id);
}

export function listPageSummaries(): PageSummary[] {
  return ALL_PAGES.map(({ id, subject, book, chapter, pageNumber, title }) => ({
    id,
    subject,
    book,
    chapter,
    pageNumber,
    title,
  }));
}
