---
name: handoff
description: Handoff - Slice the current session's context for one out-of-scope task into a durable, self-sufficient markdown brief a fresh (or different) agent session can execute from alone
argument-hint: "PURPOSE: what the next session will do (required) — e.g. 'refactor auth into a separate API'"
---

# HANDOFF (Session Handoff)

**Purpose:** Take the *relevant slice* of the current session's context for one specific out-of-scope task and compress it into a durable, self-sufficient markdown brief. A fresh session — or a different agent (Codex, Copilot CLI) — can pick up that task and run it independently, while the current session continues unchanged and "pure." This is compaction's missing sibling: instead of summarizing the whole session in place, it branches one task into a parallel session.

**Task:** $ARGUMENTS

**IMMEDIATELY display this banner:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 ⚡ HANDOFF (Session Handoff) MODE ACTIVE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Purpose: [show $ARGUMENTS or "⚠ no PURPOSE given — required"]
 Ready: Instructions loaded
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Instructions:**

0. **PURPOSE gate (hard requirement):**
   - `$ARGUMENTS` IS the next session's focus. A good handoff is impossible to write without it.
   - If `$ARGUMENTS` is empty, STOP and ask: *"What will the next session do? State the purpose/reason for this handoff — that's what the doc is built around."* Do not proceed until answered.

1. **Identify the slice (not the whole session):**
   - From the current conversation, extract ONLY the context relevant to the stated purpose. Ignore everything tied to the current session's own ongoing goal.
   - The receiving session must NOT need to read this session's full history. If you're tempted to dump the whole context, you're not slicing.

2. **Resolve the output location (durable, plan-tracked — our convention):**
   - Handoff docs are **durable, lineage-tracked artifacts**, NOT disposable temp files. (This is our deliberate divergence from the common "OS temp dir" rule — see Design Notes.)
   - Default location: `docs/plans/` under the current project root. If `docs/plans/` does not exist, create it.
   - Filename: `{YYMMDD_HHMMSS}_handoff_{slug}.md` where `slug` is a short kebab-case of the purpose. Get the timestamp from a terminal `date` command — never invent one.
   - If the project has no obvious root or the user named a target, honor that instead.
   - State the resolved path before writing.

3. **Write the handoff doc (self-sufficient — this is the contract):**
   The doc MUST stand alone. A cold reader executes from it without re-reading any heavy upstream artifact. Required sections, in order:

   ```markdown
   # Handoff — {Purpose, one line}

   ## PURPOSE (mandatory)
   {Why we're handing off + what the next session will accomplish — verbatim intent from $ARGUMENTS, expanded to 2-3 sentences.}

   ## Receiving session focus
   {The concrete task(s), INLINED — do not force the reader to open a pointer to learn what to build. State the exact target file/dir/location if the work creates or edits artifacts. Inline the immediate steps; deeper detail may live behind a pointer.}

   ## Suggested Skills (next session should invoke)
   - {/skill — why}
   {So the next session self-configures from the doc alone. Omit only if genuinely none apply.}

   ## Locked decisions (carry — do not re-litigate)
   1. {Decision + one-line rationale}
   {Anything already settled in this session that the receiver must honor.}

   ## Pointers (reference — do NOT duplicate)
   - [name](relative/path) — what it contains and when to open it
   {Point to existing artifacts (issues, plans, docs) instead of re-pasting them. Keeps the doc lean.}

   ## Reconciled contradictions (if any)
   {If a pointer file contradicts a locked decision, state the override explicitly here so the reader trusts THIS doc, not the stale source. Omit if none.}

   ## Acceptance criteria
   - {How the next session knows the handed-off task is done.}

   ## Redaction check
   {Confirm: no API keys, passwords, or PII present. ✓}
   ```

4. **Apply the doc rules (quality bar):**
   - **Inline the receiving task** — never make the reader open a pointer just to learn *what to do*. Pointers are for depth, not the core instruction. (Learned from a cold-read spike where a by-reference task failed self-sufficiency.)
   - **State every location explicitly** — install/output/edit paths. Ambiguity ("our skills dir") forces the reader to guess.
   - **Reconcile, don't dangle** — if a referenced artifact conflicts with a locked decision, say which wins.
   - **Pointers over duplication** — reference existing artifacts; don't re-paste their content.
   - **Redact secrets/PII** — API keys, passwords, personal data never go in the doc.

5. **Sharpen the current session (the side benefit):**
   - Declaring the handoff marks the task out-of-scope HERE. Briefly note in your reply that the current session can now treat it as deferred — this is the point where the out-of-scope question "collapses" and the current session stays focused.

6. **Completion report:**
   ```
   HANDOFF WRITTEN
   Purpose: [one line]
   Output:  [full path — durable, plan-tracked]
   Slice:   [what context was carried | what was deliberately left behind]
   Redaction: clean
   Hand to: [fresh session | Codex | Copilot CLI | etc.]
   ```

**Design Notes (why this skill diverges from the common pattern):**
- The widely-shared "handoff" pattern saves docs to the OS **temp dir** as disposable throwaways. **We deliberately override that** — our handoffs are durable, lineage-tracked plan artifacts (`docs/plans/`), consistent with our `/cp`→`/px`→`/ax` workflow. Rationale: in our system a handoff often seeds a tracked plan, so it earns a place in the lineage rather than evaporating.
- Portability is a feature: the artifact is plain markdown with no native agent state, so it hands cleanly to other agents for adversarial review.
- Context-budget context: a handoff is most valuable when the current session approaches its usable "smart zone" (~120k tokens) or when an out-of-scope task would otherwise dilute it. Trigger early, not at the dumb-zone wall.

**Next:** Hand the written doc to a fresh session (or `/cp` to formalize it into a tracked plan, or another agent for adversarial review). The current session continues, unburdened.
