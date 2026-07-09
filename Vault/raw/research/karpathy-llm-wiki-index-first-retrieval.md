# Karpathy LLM-Wiki — index-first retrieval (not RAG)

**Source:** https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f
**Captured:** 2026-06-15
**Why cached:** Settles the corpus-query mechanism for the Stratagem read-side (one-corpus-ai-first plan). Verified against the source gist this session. This is the kind of external research the capture path exists to deposit once and never re-fetch.

## The finding

The LLM-Wiki pattern retrieves knowledge by **reading a curated index first, then drilling into whole pages** — explicitly NOT vector/RAG retrieval.

Key quotes from the gist:

> "When answering a query, the LLM reads the index first to find relevant pages, then drills into them."

> "my `index.md` isn't RAG. It does no vector matching and no chunking; it just lets the agent open fewer _whole_ files."

> "below that magnitude threshold, the LLM Wiki approach is both simpler _and_ more reliable than RAG"

## The read-path (as applied to Stratagem vaults)

1. **Index-first** — open `<vault>/wiki/index.md` (the curated routing surface).
2. **Drill** — open the relevant `[[linked]]` pages *whole*; no chunking.
3. **Link-walk** — follow `[[links]]` + Obsidian backlinks across the mesh.
4. **Grep fallback** — ripgrep over `wiki/**/*.md` only when the index doesn't route cleanly.
5. **No embeddings** — below the ~50k–100k-token magnitude where RAG would beat the index approach; qmd/BM25 is optional future infra, not foundational.

## Applicability threshold

- **Below ~50k–100k tokens of corpus:** index-first is simpler and more reliable than RAG. (Stratagem + ISCI vaults are well under this.)
- **Above it:** consider a local hybrid search engine (qmd: BM25 + vector over markdown) as optional augmentation — still not chunked RAG.

## Relation to Stratagem

This is the mechanism the `CORPUS-READ-FIRST` routine (one-corpus-ai-first plan, Feature A) wires into `/pf`, `/cp`, `/px`, `/ax`. The Counterpart Model + feature↔pattern mesh are the graph this read-path traverses.
