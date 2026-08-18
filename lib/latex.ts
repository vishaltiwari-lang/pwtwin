/**
 * Converts digitized-paper text (plain text with embedded $...$ / $$...$$ LaTeX
 * math) into LaTeX-safe source: math segments pass through untouched apart from
 * unicode normalisation; everything else gets specials escaped and unicode
 * symbols mapped to math commands.
 */

const MATH_SEGMENT = /(\$\$[\s\S]+?\$\$|\$[^$]+\$)/g;

const TEXT_ESCAPES: Record<string, string> = {
  "\\": "\\textbackslash{}",
  "{": "\\{",
  "}": "\\}",
  $: "\\$",
  "&": "\\&",
  "%": "\\%",
  "#": "\\#",
  _: "\\_",
  "~": "\\textasciitilde{}",
  "^": "\\textasciicircum{}",
};

const SUPERSCRIPTS: Record<string, string> = {
  "⁰": "0", "¹": "1", "²": "2", "³": "3", "⁴": "4",
  "⁵": "5", "⁶": "6", "⁷": "7", "⁸": "8", "⁹": "9",
  "⁻": "-", "⁺": "+", "ʳ": "r", "ᵀ": "T", "′": "\\prime",
};

const SUBSCRIPTS: Record<string, string> = {
  "₀": "0", "₁": "1", "₂": "2", "₃": "3", "₄": "4",
  "₅": "5", "₆": "6", "₇": "7", "₈": "8", "₉": "9",
};

/** Unicode → math-mode command (no trailing space). */
const SYMBOLS: Record<string, string> = {
  "°": "^\\circ", "·": "\\cdot", "×": "\\times",
  "α": "\\alpha", "β": "\\beta", "γ": "\\gamma", "δ": "\\delta",
  "ε": "\\varepsilon", "ζ": "\\zeta", "η": "\\eta", "θ": "\\theta",
  "κ": "\\kappa", "λ": "\\lambda", "μ": "\\mu", "ν": "\\nu",
  "ξ": "\\xi", "π": "\\pi", "ρ": "\\rho", "σ": "\\sigma",
  "τ": "\\tau", "χ": "\\chi", "ω": "\\omega",
  "Δ": "\\Delta", "Φ": "\\Phi", "Ω": "\\Omega",
  "→": "\\rightarrow", "⇒": "\\Rightarrow", "∎": "\\blacksquare",
  "√": "\\surd", "∝": "\\propto", "∞": "\\infty", "∥": "\\parallel",
  "∩": "\\cap", "∫": "\\int", "≈": "\\approx", "≪": "\\ll",
  "≤": "\\le", "≥": "\\ge", "✔": "\\checkmark", "✓": "\\checkmark",
};

const SUP_RUN = new RegExp(`[${Object.keys(SUPERSCRIPTS).join("")}]+`, "g");
const SUB_RUN = new RegExp(`[${Object.keys(SUBSCRIPTS).join("")}]+`, "g");
const SYMBOL_CHAR = new RegExp(`[${Object.keys(SYMBOLS).join("")}]`, "g");

function mapRun(run: string, table: Record<string, string>): string {
  return [...run].map((c) => table[c] ?? c).join("");
}

function convertText(segment: string): string {
  return segment
    .replace(/[\\{}$&%#_~^]/g, (ch) => TEXT_ESCAPES[ch])
    .replace(SUP_RUN, (run) => `$^{${mapRun(run, SUPERSCRIPTS)}}$`)
    .replace(SUB_RUN, (run) => `$_{${mapRun(run, SUBSCRIPTS)}}$`)
    .replace(SYMBOL_CHAR, (ch) => `$${SYMBOLS[ch]}$`)
    .replace(/−/g, "-");
}

function convertMath(segment: string): string {
  return segment
    .replace(SUP_RUN, (run) => `^{${mapRun(run, SUPERSCRIPTS)}}`)
    .replace(SUB_RUN, (run) => `_{${mapRun(run, SUBSCRIPTS)}}`)
    .replace(SYMBOL_CHAR, (ch) => `${SYMBOLS[ch]} `)
    .replace(/[−–—]/g, "-");
}

export function latexFromText(input: string): string {
  return input
    .split(MATH_SEGMENT)
    .map((seg, i) => (i % 2 === 1 ? convertMath(seg) : convertText(seg)))
    .join("");
}
