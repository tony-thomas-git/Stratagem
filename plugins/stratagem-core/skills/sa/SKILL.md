---
name: sa
description: Skill Audit - Check all skills for conformance with the canonical layout
argument-hint: "optional: skill name to audit a single skill"
---

# SA (Skill Audit)

**Purpose:** Audit all skills against the canonical layout defined in SKILL-TEMPLATE.md and report violations.

**Task:** $ARGUMENTS

**Display this banner on activation:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 ⚡ SA (Skill Audit) MODE ACTIVE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Task: [show $ARGUMENTS or "all skills"]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Instructions:**

1. **Setup:**
   - Read `~/.claude/skills/SKILL-TEMPLATE.md` (home-relative) — specifically the Conformance Checklist section. **If it does not exist, fall back to the embedded checklist in step 2 below** (self-contained; no template required).
   - If $ARGUMENTS specifies a skill name, audit only that skill's `SKILL.md`
   - Otherwise, glob all `SKILL.md` files under `~/.claude/skills/` (exclude `SKILL-TEMPLATE.md` itself)

2. **Audit Each Skill:**
   Read each `SKILL.md` and check every item in this conformance checklist:

   - **[FM]** Frontmatter block present with `name`, `description`, and `argument-hint` fields
   - **[TI]** Title line matches `# SHORTNAME (Full Name)` format (all-caps short name)
   - **[PU]** `**Purpose:**` present as a single line immediately after title block
   - **[TA]** `**Task:** $ARGUMENTS` line present
   - **[BN]** Activation banner uses `━━━` bordered format with `⚡` emoji and `MODE ACTIVE` title
   - **[IN]** `**Instructions:**` uses numbered list — not H2/H3 headers (exception: `phx` is exempt)
   - **[NX]** `**Next:**` line is the last line of the file

3. **Build Report:**
   Output this conformance table:

   ```
   SKILL AUDIT REPORT
   ══════════════════
   Audited : [N] skills
   Passing : [N]
   Violations: [N]

   | Skill     | FM | TI | PU | TA | BN | IN | NX | Issues |
   |-----------|----|----|----|----|----|----|-----|--------|
   | ax        | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 0      |
   | px        | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | 1      |
   ...
   ```

   After the table, list each failing skill with specific violations:
   ```
   VIOLATIONS
   ══════════
   px — [BN] Activation banner contains ━━━ characters (line 15)
   mAX — [BN] Activation banner contains ━━━ characters (line 15)
   ```

**Next:** fix identified violations manually and re-run `/sa [skill-name]` to verify, or `/sa` to re-audit all