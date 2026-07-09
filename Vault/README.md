# Stratagem-Wiki

An LLM Wiki (Karpathy pattern, forked from [LLM-WIKI](https://github.com/tony-thomas-git/LLM-WIKI)) repurposed as the knowledge base for the **Stratagem AI coding workflow system**.

## What's here

- `vault/CLAUDE.md` — the schema and operating rules Claude follows when working in this vault
- `vault/raw/` — read-only original sources (workflow docs, retrospectives, CLAUDE.md files)
- `vault/wiki/` — Claude-authored, interlinked markdown pages synthesizing the raw sources
- `vault/logs/` — `CHANGELOG.md` + `ingest-log.md` tracking every source ingested

## Scope

This wiki is **about how we work** (operating modes, configuration hierarchy, tracer-bullet discipline, skill catalog, cross-project patterns), never about **what we work on**. Domain knowledge for specific projects belongs in their own wikis (Portal-Wiki, SAAS-Wiki, FogBOM-Wiki — to be created in later phases).

## Workflow

1. Drop a new source in `vault/raw/`
2. Say "I added a new source" in a Claude Code session opened to this vault
3. Claude reads the source, proposes a page plan, waits for approval, then creates/updates pages, updates the index, flags contradictions, and logs the ingest

See `vault/CLAUDE.md` §3 for the binding ingest workflow.
