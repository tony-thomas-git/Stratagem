---
type: concept
sources:
  - raw/research/karpathy-llm-wiki-index-first-retrieval.md
updated: 2026-06-15
tags:
  - status/active
  - scope/workflow
---

# Index-First Retrieval (LLM-Wiki, not RAG)

> **Summary.** The corpus-query mechanism for the Stratagem read-side: the LLM reads a curated `index.md` first, drills into whole pages, and walks the wiki-links — explicitly **not** vector/RAG retrieval. Below ~50k–100k tokens this is simpler and more reliable than RAG.

## The read-path

1. **Index-first** — open `<vault>/wiki/index.md`, the curated routing surface.
2. **Drill** — open the relevant linked pages *whole*; no chunking.
3. **Link-walk** — follow wiki-links + Obsidian backlinks across the mesh.
4. **Grep fallback** — ripgrep over `wiki/**/*.md` only when the index doesn't route cleanly.
5. **No embeddings** — qmd/BM25 is optional future infra for a much larger vault, not foundational.

## Why not RAG

Karpathy's gist (source: `raw/research/karpathy-llm-wiki-index-first-retrieval.md`): *"my `index.md` isn't RAG. It does no vector matching and no chunking; it just lets the agent open fewer whole files."* Below the ~50k–100k-token magnitude threshold, the index approach is *both* simpler and more reliable than RAG — which matches the Stratagem non-negotiables of simplicity and net-token-reduction.

## Applicability

- **Stratagem + ISCI vaults are well under the threshold** → index-first is the right mechanism.
- Above it: a local hybrid search engine (BM25 + vector over markdown) is optional augmentation — still not chunked RAG.

## Related

- [[index]] — the entry point this read-path consumes
- [[counterpart-model]] — the transformed-view nodes the read-path drills into
- [[research-tool-routing-ladder]] — the web/context7 fallback this sits *above* (corpus-first, web on miss)
