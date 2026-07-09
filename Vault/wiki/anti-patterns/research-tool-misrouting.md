---
type: anti-pattern
sources:
  - c:\code\CLAUDE.md
  - C:\Users\steep\.claude\hooks\tool-metrics.log
updated: 2026-07-01
tags:
  - status/active
  - scope/workflow
---

# Research Tool Misrouting

> **Summary.** Five failure modes observed when no routing rule was in
> place: research-as-default, library questions bypassing context7,
> burst-firing searches, silently unreachable endpoints, and
> config-vs-session staleness. All are prevented (or made visible) by
> [[research-tool-routing-ladder]].

## AP-WF-4: Research as default first-strike

**Pattern:** Reaching for `tavily_research` (deep multi-source synthesis, 30–120 s, quota-heavy) for a question that `tavily_search` would answer in one call. Often self-justified as "thorough."

**Symptom:** Plan-limit error mid-conversation. Forced fallback to `tavily_search` after burning the heavy call. Net: paid the premium AND did the cheap call anyway.

**Real instance:** `client-zip vs JSZip vs fflate` comparison — `tavily_research` called first, hit plan limit, fell back to two searches. A single `tavily_search` would have surfaced the benchmark articles in seconds.

**Correct pattern:** `tavily_research` is **last resort**. Justify inline before invoking. See [[research-tool-routing-ladder]] for the ladder.

## AP-WF-5: Library questions bypassing context7

**Pattern:** Routing well-documented library/framework/SDK questions through Tavily instead of context7. Common with mature libraries — Tavily returns secondhand Stack Overflow fragments when canonical docs are one `resolve-library-id` away.

**Symptom:** Tavily search log full of queries like *"PrimeVue Steps activeIndex readonly v-model usage"*, *"MSAL.js monitor_window_timeout acquireTokenSilent..."* — exactly what context7 is designed to answer.

**Real instance:** Tool-metrics-log audit revealed ~40 % of `tavily_search` calls in a two-week window were library/SDK questions that should never have left context7.

**Correct pattern:** **context7 first, always, for any library or SDK question.** Tavily is for non-library queries (error messages, news, comparisons, current state).

## AP-WF-6: Burst-firing parallel searches

**Pattern:** Firing 3–5 `tavily_search` calls within 20 seconds, often with slightly varied phrasings of the same question.

**Symptom:** Quota burns 3–5× faster than needed. Results often overlap. No improvement in answer quality vs. one well-crafted query.

**Real instance:** A 22:23 IndexedDB session and a 19:30 PrimeVue session each fired 5 searches within 21 seconds.

**Correct pattern:** **One search at a time.** If the first answers, stop. If a useful URL appears, switch to `tavily_extract` — do not fire more searches. If the first search is ambiguous, refine the query, don't shotgun.

## AP-WF-7: MCP allow-list silently masks cheap endpoints

**Pattern:** An MCP server exposes a family of tools, but only a subset is in the harness allow-list. The unlisted ones are silently unreachable — no prompt, no error, just absent. The agent reaches for what's available, which may force it up the cost ladder.

**Symptom:** Heavy endpoints get used because lighter ones can't fire. The cause is invisible — the agent sees no error.

**Real instance:** `mcp__tavily__tavily_map` and `mcp__tavily__tavily_crawl` were exposed by `tavily-mcp@latest` but absent from `~/.claude/settings.json` permissions. The Tavily-recommended `map → extract` pattern was unreachable for an unknown duration. Diagnosed only while writing the routing rule.

**Correct pattern:** When adding a routing rule that depends on specific endpoints, **verify each endpoint is allow-listed in the same change**. Audit existing allow-lists against MCP-server-exposed tools periodically — exposed-but-unlisted tools are a silent capability gap. Cousin pattern to [[audit-glob-self-blindness]].

## AP-WF-10: "Connected" mistaken for "tools loaded"

**Pattern:** Adding an MCP server mid-session and assuming its tools are
immediately usable. `claude mcp list` reports the server `✔ Connected`
(CLI-level registration), but MCP tools are bound at **session start** —
the session that added the server still cannot call them.

**Symptom:** Agent keeps falling back to `WebSearch` (or the previously
available tool) right after a "successful" install, with no error. The
config is correct; only the session is stale.

**Real instance:** Tavily added via `claude mcp add` showed Connected, but
`tavily_search` was absent from the running session's tool registry until
a fresh session was started. Verified working only after restart.

**Correct pattern:** Treat MCP install as a two-phase operation — **register,
then reload.** Verify with an actual tool *call* in a fresh session, not with
`mcp list` output. "Connected ≠ callable here." Cousin to AP-WF-7 (both are
silent capability gaps between config state and session state).

## Related

- [[research-tool-routing-ladder]] — the positive rule these prevent
- [[audit-glob-self-blindness]] — same family: silent invisibility from a hidden contract
- [[multi-stage-migration-pitfalls]] — related silent-failure modes
