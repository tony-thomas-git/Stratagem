---
name: ps
description: Plan Seed - bridge raw ideas into an actionable seed document (input to /pf) via deep codebase exploration
argument-hint: "raw idea or topic"
---

# PS (Plan Seed)

**Purpose:** Bridge a raw idea into a structured **seed document** that becomes the input to `/pf`. The seed captures the thinking, the problem, the evidence, and the open questions — so `/pf` starts from a reasoned brief, not a cold prompt.

**Task:** $ARGUMENTS

**IMMEDIATELY display this banner:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 ⚡ PS (Plan Seed) MODE ACTIVE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Task: [show $ARGUMENTS or "awaiting input"]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Instructions:**

1. **Always begin with clarifying questions.** A seed is only as good as the intent behind it. Surface the decisions that shape scope before exploring. Do not assume.

2. **Deep codebase exploration:** Investigate the relevant code, docs, and prior plans to ground the seed in reality — not speculation. Prefer reading the actual source over describing from memory. Capture measured facts (counts, file paths, diffs) where they sharpen the case.

3. **Seed authoring:** Produce a seed document that captures:
   - **Problem / why this exists** — the need it addresses, what prompted it, the intended outcome
   - **Evidence** — measured ground truth that motivates the change (not assertion)
   - **The shape of the idea** — the model, the proposed direction, drawn where a drawing beats prose
   - **Open questions for `/pf`** — the decisions left to resolve, so `/pf` knows what is settled vs. open
   - **Non-negotiables** — constraints carried from the architect

4. **Output format — HTML.** The seed is a human-reasoned, read-once thinking surface (consumed by `/pf`). Author it as `.html`:
   - **HTML chassis** for layout — its box/flow engine is bulletproof and won't let objects overlap. Use it for everything structural (sections, tables, side-by-side).
   - **SVG only for free geometry** — crossing connectors, arrows over objects, spatial diagrams. The one thing HTML's layout cannot do.
   - Prefer simplicity. HTML earns its place only where layout or a diagram beats prose; everywhere else, plain text.

5. **Save** to the plans directory as `{topic}_{YYMMDD}_seed.html` (or the project's plans dir per the vault convention). Leave uncommitted for manual review.

**Next:** the seed can flow two ways —
- `/ss <seed-file>` — **Sync Seed**: drop the seed onto the Azure DevOps board as a spike Story (in `Spike / Waiting on Delivery`) with the seed file attached, for grooming/triage.
- `/pf` — turn the seed's open questions into a feature plan.
