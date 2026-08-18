import type { Question } from "./types";

export interface TopicCount {
  topic: string;
  count: number;
}

/** Unique topics across the questions' tags, most frequent first, ties alphabetical. */
export function extractTopics(questions: Question[]): TopicCount[] {
  const counts = new Map<string, number>();
  for (const q of questions) {
    for (const tag of q.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([topic, count]) => ({ topic, count }))
    .sort((a, b) => b.count - a.count || a.topic.localeCompare(b.topic));
}

/** Questions tagged with `topic`; null means no filter (all questions). */
export function filterByTopic(questions: Question[], topic: string | null): Question[] {
  if (topic === null) return questions;
  return questions.filter((q) => q.tags.includes(topic));
}
