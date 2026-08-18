/** A piece of mixed prose/LaTeX text: plain text, $inline$ math, or $$block$$ math. */
export interface MathSegment {
  type: "text" | "inline" | "block";
  value: string;
}

const MATH_SEGMENT = /(\$\$[\s\S]+?\$\$|\$[^$\n]+\$)/g;

/** Splits digitized-paper text (plain text with embedded $…$/$$…$$ LaTeX) into segments. */
export function splitMath(text: string): MathSegment[] {
  const segments: MathSegment[] = [];
  let last = 0;
  for (const m of text.matchAll(MATH_SEGMENT)) {
    if (m.index > last) segments.push({ type: "text", value: text.slice(last, m.index) });
    const token = m[0];
    if (token.startsWith("$$")) {
      segments.push({ type: "block", value: token.slice(2, -2).trim() });
    } else {
      segments.push({ type: "inline", value: token.slice(1, -1).trim() });
    }
    last = m.index + token.length;
  }
  if (last < text.length) segments.push({ type: "text", value: text.slice(last) });
  return segments;
}
