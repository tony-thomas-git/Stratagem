---
type: pattern
sources:
  - plugins/stratagem-ado/owner-identity-resolver.md
  - plugins/stratagem-ado/skills/sp/SKILL.md
  - plugins/stratagem-ado/skills/ss/SKILL.md
updated: 2026-07-10
tags:
  - status/active
  - scope/ado
---

# Owner-Identity Resolver

> **Summary.** The single shared convention that turns the per-install config `owner` into a valid, assignable Azure DevOps identity before any skill writes `System.AssignedTo`. It validates via `core_get_identity_ids`, self-heals to the PAT identity on a miss with a **visible warning** (never silent), and is validation-only — the calling skill still owns the actual assignment. `sp` and `ss` both reference this one file so the rule can't drift.

## Why it exists

`owner` in `ado.config.json` is **not necessarily** the account that authenticated the PAT. Per `INSTALL.md §2c`, an MS-account email (e.g. `you@gmail.com`) can authenticate the PAT yet not be an assignable org identity, so a verbatim `System.AssignedTo = owner` fails with "…is an unknown identity." (source: `owner-identity-resolver.md`; code: `plugins/stratagem-ado/owner-identity-resolver.md:9-14`). The resolver catches that at skill time and self-heals.

## Inputs

| Input | Source |
|---|---|
| `owner` | the `owner` field of the newest `~/.claude/plugins/data/stratagem-ado-*/ado.config.json` (the plugin's per-install identity home) |
| PAT email | the authenticating account — decode `pat.b64` and take the part before the first `:` (`base64 -d < "$PATFILE" \| cut -d: -f1`; `pat.b64` is `base64("email:PAT")`, never echoed) |

(code: `plugins/stratagem-ado/owner-identity-resolver.md:16-22`)

## Algorithm

1. **Validate the config owner.** Call `mcp__plugin_stratagem-ado_azure-devops__core_get_identity_ids` with `searchFilter = <owner>`. Resolves to an assignable identity → use `owner` verbatim, no warning (the common, correctly-configured path) (code: `plugins/stratagem-ado/owner-identity-resolver.md:25-28`).
2. **Self-heal on miss.** If step 1 returns no assignable identity, call `core_get_identity_ids` again with `searchFilter = <PAT email>`. Resolves → use the PAT identity for this run and emit a **visible** warning — do not silently swap (code: `plugins/stratagem-ado/owner-identity-resolver.md:29-37`):
   ```
   ⚠️ owner self-heal: config owner '<owner>' is not an assignable ADO identity;
      using PAT identity '<pat-email>' for System.AssignedTo. Fix `owner` in ado.config.json.
   ```
3. **Skip-loud on double-miss.** If neither resolves, do **not** hard-abort: warn loudly and proceed with the config `owner` as-authored so the downstream assignment surfaces the real ADO error rather than masking it here (code: `plugins/stratagem-ado/owner-identity-resolver.md:38-44`):
   ```
   ⚠️ owner resolve failed: neither config owner '<owner>' nor PAT identity '<pat-email>'
      resolved via core_get_identity_ids; proceeding with '<owner>' (assignment may fail).
   ```

This is resolved decision #3 — "validate → self-correct + warn, never silent replace." (code: `plugins/stratagem-ado/owner-identity-resolver.md:14`).

## Contract notes

- **Validation only, no writes.** The resolver never sets `System.AssignedTo`; it returns the identity string and the caller assigns it (code: `plugins/stratagem-ado/owner-identity-resolver.md:48-49`).
- **Idempotent + read-only against the board.** `core_get_identity_ids` is a lookup; re-running changes and creates nothing (code: `plugins/stratagem-ado/owner-identity-resolver.md:50-51`).
- **Skip-loud, never silent.** Every self-correction or miss is surfaced; the resolver degrades to the config value with a warning rather than failing the caller — matching the plugin's board-blind / skip-loud invariants (code: `plugins/stratagem-ado/owner-identity-resolver.md:52-54`). See [[idempotency-and-skip-loud]].
- **Token hygiene.** The PAT email is derived from `pat.b64` in a shell variable only; the decoded token is never printed or passed outside the decode step (code: `plugins/stratagem-ado/owner-identity-resolver.md:55-56`).

## Single source of truth — referenced, never re-inlined

Both writing skills point here instead of copying the algorithm, so the identity rule can't drift:

- **`/sp`:** "Owner resolution follows the shared convention `${CLAUDE_PLUGIN_ROOT}/owner-identity-resolver.md` (validate the resolved owner via `core_get_identity_ids` → self-heal to the PAT identity + warn on mismatch; validation only, never silent replace). Do not re-inline the algorithm — this is its single source of truth, shared with `ss`." (code: `plugins/stratagem-ado/skills/sp/SKILL.md:53`). Applied Owner is validated, then written to the Feature via `fields` and to each Story via a follow-up `wit_update_work_item` (code: `plugins/stratagem-ado/skills/sp/SKILL.md:130`).
- **`/ss`:** "Owner resolution follows the shared convention … the same single source of truth `sp` uses; do not re-inline it." (code: `plugins/stratagem-ado/skills/ss/SKILL.md:37`).

## Related

- [[idempotency-and-skip-loud]] — the skip-loud posture this resolver embodies.
- [[neutral-board-seam]] — the board-blind boundary these skills sit behind.
- [[sp-field-contract]] — the caller that validates `owner` before assigning it (Feature + Stories).
- [[ado-bridge]] — the plugin that references this file as its single owner-resolution source of truth.
- [[hardcoded-home-paths]] — the sibling anti-pattern; the owner mismatch surfaced in the same install pass.
- [[install-and-skill-test-pass]] — the retro where the owner-identity mismatch was found and fixed.
