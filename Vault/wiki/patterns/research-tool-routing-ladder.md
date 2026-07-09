---
type: pattern
sources:
  - c:\code\CLAUDE.md
  - https://docs.tavily.com/documentation/agent-skills
updated: 2026-07-01
tags:
  - status/active
  - scope/workflow
---

# Research Tool Routing Ladder

> **Summary.** When a question requires consulting external sources,
> always pick the cheapest tool that can answer. Library/framework/SDK
> docs go to context7 first; everything else climbs a Tavily ladder
> ordered cheapest-up. The principle generalizes to any tool family with
> a cost ladder.

## The principle

The most expensive endpoint is rarely the right default. Cost ladders
are real and visible in plan-limit responses, log volume, and latency.
Defaulting to the heaviest tool because it "sounds most thorough" wastes
quota, fragments attention, and often produces worse answers than the
right lightweight tool.

**The rule:** start at the bottom of the ladder, climb only when the
cheaper option provably falls short.

## The ladder (canonical form)

1. **Library / framework / SDK / CLI / cloud-service docs → context7. Always. Never Tavily.**
   (React, Next.js, Prisma, PrimeVue, MSAL, AG Grid, Tailwind, AWS/Azure SDKs, etc.)

2. **Everything else → climb the Tavily ladder cheapest-up:**

| Endpoint | When to use |
|---|---|
| `tavily_search` | Single keyword-style query for an error message, news, or current state |
| `tavily_extract` | Known URL, want clean content (use after a search returns a good link) |
| `tavily_map` | Known doc site, find which pages are relevant |
| `tavily_map → tavily_extract` | Preferred pattern for mining a known doc site |
| `tavily_crawl` | Whole-site offline reference (rare) |
| `tavily_research` | Multi-source synthesis with citations — **quota-heavy, last resort, never the default**, requires one-line justification |

## Operational rules

- **Keyword queries**, not natural-language sentences. `"PrimeVue Steps activeIndex"` not `"How does PrimeVue's Steps component handle the activeIndex prop?"`.
- **One search at a time.** If the first answers, stop. Do not fire 3–5 in parallel.
- **After a useful URL appears**, switch to `tavily_extract` — do not search again.
- **If you reach for `tavily_research`,** justify it inline first.

## Where the rule lives

- Canonical: `c:\code\CLAUDE.md` § Research & Web Lookup Routing (above Critical Operation Rules).
- Wired into all eight corpus-read skills (`/pf /cp /px /ax /ex /fx /mpx /max`) via the synced CORPUS-READ-FIRST step-6, which names the Tavily rungs inline; `/fx` and `/ex` additionally carry a full error-research block. (Was `/fx`-only before 2026-07-01.)
- Tavily is installed as a hybrid: Claude Code → remote HTTP (`mcp.tavily.com`, user scope); Claude Desktop → local `npx` stdio (Desktop can't do remote MCP). Key rotation is a **two-place** update (CC config + Desktop config). Setup runbook: `Steward/TAVILY-MCP-SETUP.md`.
- Tavily endpoint permissions (`mcp__tavily__tavily_map`, `mcp__tavily__tavily_crawl`) added to `~/.claude/settings.json` allow-list — without that step the cheaper rungs were silently unreachable. See [[research-tool-misrouting]] AP-WF-7.
- **Don't flatten it downstream.** Derived docs (completed-reports, diagrams) must not collapse the routed fallback to a single "web/context7" label — that erases the ladder and mis-represents the investment. Name both branches (context7 for libs → `raw/library-docs/`; Tavily ladder for everything else → `raw/research/`) and link this page. *Real instance:* the one-corpus completed-report loop diagram flattened the fallback to "web/context7"; corrected 2026-06-16 to name both branches.

## Why it generalizes

The same shape — *cheapest tool first, climb only on need* — applies
wherever a tool family has a cost ladder: model selection
(Haiku → Sonnet → Opus), search depth (basic → advanced), MCP server
choice. Recognizing a cost ladder is the cue to apply the pattern.

## Related

- [[research-tool-misrouting]] — the anti-patterns this rule prevents
- [[operating-modes]] — the ladder is wired into all eight corpus-read skills; `/fx` and `/ex` carry the full error-research block
- [[configuration-hierarchy]] — global `CLAUDE.md` is where universal routing rules live
