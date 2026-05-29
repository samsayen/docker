# OWASP Top 10 for LLM Applications (2025) — Learn & Score

A single-page, dependency-free web app that **teaches** the OWASP Top 10 for LLM
Applications (2025) to a technical audience and **scores** them on it with an
interactive quiz. Runs fully offline.

## What it is

Two sections in one page:

1. **Learn** — an accordion of all 10 risks. Each card gives the official ID +
   name, a 1–2 sentence definition, a concrete attack scenario, an illustrative
   "What it looks like" snippet (a fake-but-realistic transcript/code/log), and
   2–3 key mitigations. Skimmable; expand only what you need.
2. **Quiz** — 20 technical questions (single-answer, multi-select, and
   scenario-matching) covering every risk. Immediate per-question feedback with
   an explanation, a running progress bar, a final score + percentage, a
   competency band, and a per-category breakdown that points you back to the
   cards you should review.

## Learning objective

After using this app, an engineer should be able to **identify which OWASP LLM
risk a given real-world scenario maps to**, distinguish closely related risks
(e.g. Prompt Injection vs. Improper Output Handling, Supply Chain vs. Data &
Model Poisoning), and name the primary mitigations for each.

## How to run

No build step, no install, no network. Either:

- **Double-click `index.html`**, or
- Serve it locally (recommended, avoids any `file://` quirks):

  ```bash
  cd path/to/OWASP_AI
  python3 -m http.server 8000
  # then open http://localhost:8000
  ```

Tested with modern evergreen browsers. System fonts only; no CDN assets.

## File structure

```
OWASP_AI/
├── index.html    # Semantic markup + ARIA: header, tablist, Learn/Quiz panels.
├── styles.css    # Dark theme, WCAG AA contrast, responsive, reduced-motion aware.
├── app.js        # Data layer + state + scoring + render logic (see below).
└── README.md     # This file.
```

### `app.js` is organized in clear layers

- **Data layer** — `RISKS` (the 10 risk objects) and `QUESTIONS` (the question
  bank) are plain data structures, fully decoupled from rendering. Edit content
  here without touching view code.
- **State** — `quizState` holds the current attempt (shuffled question order,
  per-question result records, current index). Best score persists in
  `localStorage` under key `owasp-llm-quiz-best-v1`.
- **Scoring** — `gradeQuestion` and `computeResult` (pure functions).
- **Render layer** — `renderLearn`, `renderQuestion`, `renderResults`, and the
  tab/view switching. These read DATA/STATE and write the DOM.

### Data model (schemas)

**Risk object**

```js
{
  id: 'LLM01:2025',          // official OWASP id — also the quiz category key
  name: 'Prompt Injection',
  definition: '…',           // 1–2 sentences
  example: '…',              // concrete attack scenario
  demo: '…',                 // illustrative "what it looks like" snippet (verbatim)
  mitigations: ['…', '…'],   // 2–3 controls
}
```

**Question object**

```js
{
  id: 'q1',
  type: 'single' | 'multi' | 'scenario',
  category: 'LLM01:2025',    // which risk this assesses (drives the breakdown)
  prompt: '…',
  options: [{ text: '…', correct: true|false }, …],
  explain: '…',              // shown after answering
}
```

- `single` — exactly one correct option (rendered as radio buttons).
- `multi` — one or more correct options (checkboxes).
- `scenario` — single-answer, but the options are OWASP risks and the prompt
  describes a situation to classify.

## Scoring rules

Implemented in `gradeQuestion()` and documented in code:

| Type              | Rule                                                                                   |
| ----------------- | -------------------------------------------------------------------------------------- |
| `single`          | 1 point if the single selected option is the correct one; otherwise 0.                 |
| `scenario`        | Same as `single`.                                                                      |
| `multi`           | **All-or-nothing.** 1 point only if the selected set *exactly* equals the correct set — no missing correct options and no extra wrong ones. Any partial or over-selection scores 0. |

All-or-nothing was chosen deliberately for multi-select because it is the
least ambiguous rule and avoids debates over partial-credit weighting. The UI
states this on the quiz intro and on each multi-select question.

- **Percentage** = `round(score / total * 100)`.
- **Per-category breakdown** tallies correct/total per OWASP id. Any category
  with at least one miss is flagged "Review" and surfaced as a clickable chip
  that jumps to (and expands) that risk's Learn card.

### Competency bands

| Band            | Percentage |
| --------------- | ---------- |
| Novice          | < 50%      |
| Practitioner    | 50–79%     |
| Expert          | ≥ 80%      |

## Behavior notes

- **Retake** reshuffles both question order and answer-option order
  (Fisher-Yates) on every attempt.
- **Best score** is stored per device in `localStorage` and shown on the intro
  and results screens. Storage failures (private mode / disabled) degrade
  gracefully — the app still works, it just won't remember the best score.
- **Accessibility** — semantic HTML, an ARIA tablist with arrow-key support,
  `aria-live` regions for progress and feedback, visible keyboard focus, a skip
  link, and `prefers-reduced-motion` support. All user-facing strings are
  HTML-escaped before insertion.

## Content source

All content is adapted from the **OWASP Top 10 for Large Language Model
Applications, 2025**. The 10 risks used (exactly): LLM01 Prompt Injection,
LLM02 Sensitive Information Disclosure, LLM03 Supply Chain, LLM04 Data and Model
Poisoning, LLM05 Improper Output Handling, LLM06 Excessive Agency, LLM07 System
Prompt Leakage, LLM08 Vector and Embedding Weaknesses, LLM09 Misinformation,
LLM10 Unbounded Consumption.

This is an educational tool, not official OWASP material.
```
