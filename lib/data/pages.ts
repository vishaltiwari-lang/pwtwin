import type { PageContent } from "../types";

/**
 * Seeded module pages. In production these rows would come from the
 * publisher's CMS, keyed by the id encoded in each printed QR code.
 * Content here is syllabus-level and factually checked.
 */
export const PAGES: PageContent[] = [
  {
    id: "phy-rot-207",
    subject: "Physics",
    book: "Cengage Physics for JEE Advanced",
    chapter: "Rotational Motion",
    pageNumber: 207,
    title: "Moment of Inertia & Rolling",
    concept:
      "Moment of inertia (I) is the rotational analogue of mass: it measures how hard it is to change an object's spin. For rolling without slipping, the linear acceleration down an incline is a = g·sinθ / (1 + I/MR²), so bodies with a smaller I/MR² accelerate faster.",
    questions: [
      {
        id: "phy-rot-207-q1",
        code: "Q1",
        difficulty: "Medium",
        prompt:
          "A solid sphere and a thin hollow sphere have the same mass and radius. Both are released from rest and roll without slipping down the same incline. Which reaches the bottom first?",
        options: ["Solid sphere", "Hollow sphere", "They arrive together", "Depends on the mass"],
        answer: "Solid sphere",
        tags: ["rolling", "incline", "solid sphere", "hollow sphere", "moment of inertia", "acceleration", "which first", "roll down"],
        steps: [
          { label: "Rolling acceleration", detail: "For rolling without slipping, a = g·sinθ / (1 + I/MR²). A larger I/MR² means a smaller acceleration." },
          { label: "Plug in I values", detail: "Solid sphere: I = (2/5)MR² → I/MR² = 0.4. Hollow sphere: I = (2/3)MR² → I/MR² ≈ 0.67." },
          { label: "Compare", detail: "0.4 < 0.67, so the solid sphere has the larger acceleration a = g·sinθ/1.4 vs g·sinθ/1.67." },
          { label: "Conclusion", detail: "Greater acceleration over the same incline length ⇒ the solid sphere reaches the bottom first. Note the result is independent of mass and radius." },
        ],
        why: "The mass is spread farther from the axis in a hollow sphere, so more of the gravitational energy goes into rotation rather than translation. With less energy left for forward motion, the hollow sphere accelerates more slowly and loses the race.",
      },
      {
        id: "phy-rot-207-q2",
        code: "Q2",
        difficulty: "Easy",
        prompt:
          "What is the moment of inertia of a uniform thin rod of mass M and length L about an axis through its centre, perpendicular to its length?",
        options: ["ML²/12", "ML²/3", "ML²/2", "ML²/6"],
        answer: "ML²/12",
        tags: ["rod", "moment of inertia", "centre", "perpendicular axis", "ML2/12", "uniform rod"],
        steps: [
          { label: "Set up the integral", detail: "Take a mass element dm = (M/L)dx at distance x from the centre, with x running from −L/2 to +L/2." },
          { label: "Integrate", detail: "I = ∫ x² dm = (M/L) ∫_{−L/2}^{L/2} x² dx = (M/L)·[x³/3] from −L/2 to L/2." },
          { label: "Evaluate", detail: "= (M/L)·(2·(L/2)³/3) = (M/L)·(L³/12) = ML²/12." },
        ],
        why: "About the centre the rod's mass is symmetric and relatively close to the axis, giving ML²/12. Shift the axis to one end and the parallel-axis theorem adds M(L/2)², raising it to ML²/3.",
      },
    ],
    mnemonics: [
      { phrase: "\"Slow Hollow\"", expands: "Hollow bodies carry mass far from the axis, so they have a bigger moment of inertia and roll/spin up more slowly.", note: "Handy for every 'which reaches first' race." },
      { phrase: "Ring, Disc, Sphere → 1, ½, ⅖", expands: "I/MR² about the central axis: ring = 1, disc/solid cylinder = ½, solid sphere = ⅖. Smaller number ⇒ wins the roll." },
      { phrase: "\"Add M-d-squared\"", expands: "Parallel-axis theorem: I = I_cm + Md². Shift the axis by distance d and just add Md²." },
      { phrase: "\"Torque turns, Force pushes\"", expands: "τ = Iα is the rotational F = ma. Torque is to angular acceleration what force is to linear acceleration." },
    ],
    shorthand: [
      { term: "I", meaning: "Moment of inertia (kg·m²)" },
      { term: "τ", meaning: "Torque = I·α = r × F" },
      { term: "ω, α", meaning: "Angular velocity, angular acceleration" },
      { term: "L", meaning: "Angular momentum = I·ω" },
      { term: "I/MR²", meaning: "Shape factor that sets rolling speed" },
    ],
    cheatSheet: [
      { name: "Rolling accel.", value: "a = g·sinθ / (1 + I/MR²)" },
      { name: "Solid sphere", value: "I = (2/5)MR²" },
      { name: "Hollow sphere", value: "I = (2/3)MR²" },
      { name: "Disc / cylinder", value: "I = (1/2)MR²" },
      { name: "Ring / hoop", value: "I = MR²" },
      { name: "Rod (centre)", value: "I = ML²/12" },
      { name: "Rod (end)", value: "I = ML²/3" },
      { name: "Parallel axis", value: "I = I_cm + Md²" },
    ],
  },

  {
    id: "chem-per-112",
    subject: "Chemistry",
    book: "MTG NCERT at your Fingertips — Chemistry XI",
    chapter: "Classification of Elements & Periodicity",
    pageNumber: 112,
    title: "Periodic Trends",
    concept:
      "Across a period (left→right) effective nuclear charge rises while the shell stays the same, so atomic radius shrinks and ionization energy and electronegativity climb. Down a group a new shell is added each time, so radius grows and ionization energy falls.",
    questions: [
      {
        id: "chem-per-112-q1",
        code: "Q1",
        difficulty: "Easy",
        prompt: "Arrange Na, Mg, Al and Si in increasing order of atomic radius.",
        options: ["Si < Al < Mg < Na", "Na < Mg < Al < Si", "Al < Si < Na < Mg", "Mg < Na < Si < Al"],
        answer: "Si < Al < Mg < Na",
        tags: ["atomic radius", "period 3", "na mg al si", "increasing order", "size", "trend"],
        steps: [
          { label: "Same period", detail: "Na, Mg, Al, Si are all in period 3, so each step to the right adds one proton without adding a shell." },
          { label: "Effective nuclear charge", detail: "More protons pull the same outer shell inward, so effective nuclear charge increases and size decreases left→right." },
          { label: "Order by size", detail: "Radius: Na > Mg > Al > Si. Increasing means smallest first: Si < Al < Mg < Na." },
        ],
        why: "Going across a period, electrons enter the same principal shell while nuclear charge keeps rising. The stronger inward pull contracts the atom, so silicon (farthest right here) is the smallest and sodium the largest.",
      },
      {
        id: "chem-per-112-q2",
        code: "Q2",
        difficulty: "Medium",
        prompt: "Which has the higher first ionization energy: nitrogen (N) or oxygen (O)?",
        options: ["Nitrogen", "Oxygen", "Equal", "Cannot be predicted"],
        answer: "Nitrogen",
        tags: ["ionization energy", "nitrogen", "oxygen", "half filled", "exception", "n vs o", "2p3"],
        steps: [
          { label: "Write the configurations", detail: "N = 1s² 2s² 2p³ (half-filled 2p). O = 1s² 2s² 2p⁴." },
          { label: "Stability of half-filled", detail: "A half-filled 2p³ set is extra stable (exchange energy), so removing an electron from N costs more." },
          { label: "Oxygen's paired electron", detail: "In O, the 4th 2p electron pairs up in one orbital; electron–electron repulsion makes it easier to remove." },
          { label: "Conclusion", detail: "So IE₁(N) > IE₁(O), breaking the general left-to-right increase — a classic exception." },
        ],
        why: "The normal trend says IE rises across a period, but nitrogen's half-filled 2p³ is unusually stable while oxygen's paired 2p electron feels extra repulsion. That flips the order, so nitrogen holds its electron more tightly than oxygen.",
      },
    ],
    mnemonics: [
      { phrase: "\"Be beats B, N beats O\"", expands: "Ionization-energy exceptions: Be > B and N > O because of full 2s² and half-filled 2p³ stability.", note: "The two IE 'dips' every exam loves to test." },
      { phrase: "\"FONClBrISCH\"", expands: "Rough decreasing electronegativity order: F > O > N ≈ Cl > Br > I > S > C > H. Fluorine is the champion at 4.0." },
      { phrase: "\"Small, Eager, Right & Up\"", expands: "Atoms get Smaller and more Eager for electrons (higher EN/IE) as you go Right across a period and Up a group." },
      { phrase: "\"Down grows, Across shrinks\"", expands: "Atomic radius grows Down a group (new shells) and shrinks Across a period (rising nuclear charge)." },
    ],
    shorthand: [
      { term: "IE₁", meaning: "First ionization energy" },
      { term: "EN", meaning: "Electronegativity (Pauling)" },
      { term: "EA", meaning: "Electron affinity / gain enthalpy" },
      { term: "Z_eff", meaning: "Effective nuclear charge felt by valence e⁻" },
      { term: "r_atomic", meaning: "Atomic radius" },
    ],
    cheatSheet: [
      { name: "Radius across →", value: "Decreases" },
      { name: "Radius down ↓", value: "Increases" },
      { name: "IE across →", value: "Increases (dips at B, O)" },
      { name: "IE down ↓", value: "Decreases" },
      { name: "EN across →", value: "Increases" },
      { name: "Most electronegative", value: "F (4.0)" },
      { name: "Highest EA", value: "Cl (most negative)" },
    ],
  },

  {
    id: "bio-nep-318",
    subject: "Biology",
    book: "Trueman's Elementary Biology — Vol. 1 (XI)",
    chapter: "Excretory Products & their Elimination",
    pageNumber: 318,
    title: "The Nephron & Urine Formation",
    concept:
      "The nephron is the functional unit of the kidney. Urine forms in three steps: glomerular filtration in Bowman's capsule, selective reabsorption along the tubule, and tubular secretion. The loop of Henle's counter-current design lets the kidney produce concentrated urine.",
    questions: [
      {
        id: "bio-nep-318-q1",
        code: "Q1",
        difficulty: "Medium",
        prompt:
          "Which segment of the nephron is impermeable to water yet actively transports Na⁺ and Cl⁻ out of the filtrate?",
        options: [
          "Proximal convoluted tubule",
          "Descending limb of loop of Henle",
          "Ascending limb of loop of Henle",
          "Collecting duct",
        ],
        answer: "Ascending limb of loop of Henle",
        tags: ["ascending limb", "loop of henle", "impermeable to water", "sodium", "nacl", "counter current", "which segment"],
        steps: [
          { label: "Recall the loop", detail: "The descending limb is permeable to water (water leaves), while the ascending limb is impermeable to water." },
          { label: "Ion transport", detail: "The thick ascending limb actively pumps Na⁺ and Cl⁻ into the surrounding medulla without letting water follow." },
          { label: "Result", detail: "This makes the filtrate dilute and the medulla salty — the engine of the counter-current multiplier." },
        ],
        why: "Because the ascending limb moves salt out but keeps water in, it builds the salty medullary gradient without diluting it. That gradient is what later lets the collecting duct reabsorb water and concentrate the urine.",
      },
      {
        id: "bio-nep-318-q2",
        code: "Q2",
        difficulty: "Easy",
        prompt: "What is the approximate glomerular filtration rate (GFR) in a healthy adult?",
        options: ["25 mL/min", "125 mL/min", "500 mL/min", "1250 mL/min"],
        answer: "125 mL/min (≈180 L/day)",
        tags: ["gfr", "glomerular filtration rate", "125", "180 litres", "filtration", "normal value"],
        steps: [
          { label: "Define GFR", detail: "GFR is the volume of filtrate the glomeruli of both kidneys form per minute." },
          { label: "Standard value", detail: "In a healthy adult it is about 125 mL/min." },
          { label: "Scale to a day", detail: "125 mL/min × 60 × 24 ≈ 180 litres/day filtered, yet only ~1.5 L leaves as urine." },
        ],
        why: "Nearly all of the 180 litres filtered each day is reabsorbed — about 99% — which is why GFR (125 mL/min) is huge compared with the ~1.5 L of urine actually produced.",
      },
    ],
    mnemonics: [
      { phrase: "\"Filter, Reabsorb, Secrete\"", expands: "The three steps of urine formation in order: glomerular Filtration → tubular Reabsorption → tubular Secretion.", note: "F-R-S, top to bottom of the nephron." },
      { phrase: "\"Descending Drinks, Ascending Ain't\"", expands: "Descending limb is permeable to water (loses water); ascending limb is impermeable to water (loses salt instead)." },
      { phrase: "\"ADH → Add Water\"", expands: "Antidiuretic hormone acts on the DCT and collecting duct to reabsorb more water, concentrating the urine." },
      { phrase: "\"PCT does the most\"", expands: "The proximal convoluted tubule reabsorbs ~70–80% of the filtrate — the bulk of the work." },
    ],
    shorthand: [
      { term: "GFR", meaning: "Glomerular filtration rate (~125 mL/min)" },
      { term: "PCT / DCT", meaning: "Proximal / distal convoluted tubule" },
      { term: "ADH", meaning: "Antidiuretic hormone (vasopressin)" },
      { term: "JGA", meaning: "Juxtaglomerular apparatus (renin, BP control)" },
      { term: "Loop of Henle", meaning: "Counter-current concentrator" },
    ],
    cheatSheet: [
      { name: "GFR", value: "≈125 mL/min (180 L/day)" },
      { name: "Urine/day", value: "≈1.5 L" },
      { name: "PCT reabsorbs", value: "≈70–80% of filtrate" },
      { name: "Descending limb", value: "Permeable to water" },
      { name: "Ascending limb", value: "Impermeable to water" },
      { name: "ADH acts on", value: "DCT + collecting duct" },
      { name: "Filtration site", value: "Bowman's capsule / glomerulus" },
    ],
  },

  {
    id: "math-quad-045",
    subject: "Math",
    book: "Arihant Skills in Mathematics — Algebra",
    chapter: "Quadratic Equations",
    pageNumber: 45,
    title: "Discriminant & Vieta's Relations",
    concept:
      "For ax² + bx + c = 0 (a ≠ 0) the roots are x = (−b ± √D)/2a with discriminant D = b² − 4ac. The sign of D fixes the nature of the roots, and Vieta's relations tie the roots to the coefficients: sum = −b/a, product = c/a.",
    questions: [
      {
        id: "math-quad-045-q1",
        code: "Q1",
        difficulty: "Easy",
        prompt: "For what value(s) of k does x² − kx + 9 = 0 have equal roots?",
        options: ["k = ±6", "k = ±3", "k = 9", "k = ±9"],
        answer: "k = ±6",
        tags: ["equal roots", "discriminant zero", "k value", "x2-kx+9", "repeated root", "d=0"],
        steps: [
          { label: "Equal-roots condition", detail: "Roots are equal exactly when the discriminant D = b² − 4ac = 0." },
          { label: "Identify a, b, c", detail: "Here a = 1, b = −k, c = 9, so D = (−k)² − 4·1·9 = k² − 36." },
          { label: "Solve D = 0", detail: "k² − 36 = 0 ⇒ k² = 36 ⇒ k = ±6." },
        ],
        why: "Equal roots mean the parabola just touches the x-axis, which happens when the square-root term vanishes — that is, when D = 0. Solving k² − 36 = 0 gives the two values k = +6 and k = −6.",
      },
      {
        id: "math-quad-045-q2",
        code: "Q2",
        difficulty: "Easy",
        prompt: "If α and β are the roots of x² − 5x + 6 = 0, find α + β and αβ.",
        options: ["Sum 5, product 6", "Sum −5, product 6", "Sum 6, product 5", "Sum 5, product −6"],
        answer: "α + β = 5, αβ = 6",
        tags: ["sum of roots", "product of roots", "vieta", "x2-5x+6", "alpha beta", "-b/a", "c/a"],
        steps: [
          { label: "Vieta's relations", detail: "For ax² + bx + c = 0: α + β = −b/a and αβ = c/a." },
          { label: "Read coefficients", detail: "Here a = 1, b = −5, c = 6." },
          { label: "Compute", detail: "α + β = −(−5)/1 = 5 and αβ = 6/1 = 6. (Check: roots are 2 and 3.)" },
        ],
        why: "You don't need to solve the quadratic — Vieta's relations read the sum and product straight off the coefficients. Sum = −b/a = 5 and product = c/a = 6, which the roots 2 and 3 confirm.",
      },
    ],
    mnemonics: [
      { phrase: "\"Minus b for Sum, plain c for Product\"", expands: "Vieta: sum of roots = −b/a, product of roots = c/a (both divided by the leading coefficient a)." },
      { phrase: "\"D decides\"", expands: "D > 0 → two real distinct roots; D = 0 → real & equal; D < 0 → complex conjugate pair." },
      { phrase: "\"Perfect square ⇒ rational\"", expands: "If a, b, c are rational and D is a perfect square, the roots are rational; otherwise they are irrational conjugates." },
      { phrase: "\"Diff of roots = √D over a\"", expands: "|α − β| = √D / |a| — useful whenever a question hides the discriminant inside a difference of roots." },
    ],
    shorthand: [
      { term: "D", meaning: "Discriminant = b² − 4ac" },
      { term: "α, β", meaning: "The two roots" },
      { term: "−b/a", meaning: "Sum of roots" },
      { term: "c/a", meaning: "Product of roots" },
      { term: "a ≠ 0", meaning: "Required for it to be quadratic" },
    ],
    cheatSheet: [
      { name: "Roots", value: "x = (−b ± √D) / 2a" },
      { name: "Discriminant", value: "D = b² − 4ac" },
      { name: "D > 0", value: "Two real, distinct" },
      { name: "D = 0", value: "Real & equal" },
      { name: "D < 0", value: "Complex conjugates" },
      { name: "Sum of roots", value: "α + β = −b/a" },
      { name: "Product of roots", value: "αβ = c/a" },
      { name: "|α − β|", value: "√D / |a|" },
    ],
  },
];
