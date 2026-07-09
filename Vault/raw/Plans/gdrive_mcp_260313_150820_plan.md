# Feature: Google Drive stdio MCP Setup
## Created: 2026-03-13 15:08
## Status: In Progress
## Source PF: (in-session PF, no file)
## Tracer Bullet: NO

---

### Strategic Context

#### Problem Statement & Solution
The `claude.ai Google Drive` cloud connector works on claude.ai web but is NOT exposed to the Claude Code VSCode extension (product gap — only Gmail is currently served). To get Drive access in CC/VSCode, we need a local stdio MCP server that talks to Google Drive API directly.

**Chosen approach:** `benjamine/gdrive-mcp` (community package)
- Stores OAuth tokens in **Windows Credential Manager** (secure, no plaintext JSON)
- Simple auth: one `bunx` command with Client ID + Secret
- Run via `bunx --bun gdrive-mcp` (no global install required)

**Alternative considered:** Official `@modelcontextprotocol/server-gdrive`
- Stores credentials as JSON file on disk (less secure)
- Rejected in favor of Windows Credential Manager approach

#### What's Already Built
| Component | Status | Location |
|---|---|---|
| context7 MCP | Active | `~/.claude.json` mcpServers |
| tavily MCP | Active | `~/.claude.json` mcpServers |
| claude.ai Gmail | Active (cloud) | `claudeAiMcpEverConnected` |
| claude.ai Google Drive | Connected (web only) | `claudeAiMcpEverConnected` |
| gdrive stdio MCP | Not started | — |

#### Architecture Decisions
- **Why stdio over cloud connector:** Cloud connector not exposed to CC extension (product gap)
- **Why `benjamine/gdrive-mcp` over official:** Windows Credential Manager storage > plaintext JSON
- **Why `cmd /c bunx --bun gdrive-mcp`:** Matches Windows convention used for context7/tavily (`cmd /c npx ...`)
- **Scope:** User-level (`~/.claude.json`) — Drive access belongs globally, not per-project

#### Dependencies
- Node.js 18+ (already present)
- `bun` runtime OR `bunx` (may need install — check first)
- Google Cloud project with:
  - Google Drive API enabled
  - OAuth 2.0 Desktop App credentials (Client ID + Client Secret)
- Browser access for one-time OAuth consent flow

#### Risk Assessment
| Risk | Mitigation |
|---|---|
| `bun` not installed on Windows | Check first; fallback to official npx-based package |
| GCP project creation overhead | ~15 min one-time; user walks through browser UI |
| OAuth consent screen "External" vs "Internal" | Use "Internal" (no verification needed for personal use) |
| Windows Credential Manager not accessible | Fallback to official package with JSON file |

#### Success Criteria
- Drive MCP tools appear in `available-deferred-tools` in new CC session
- Can search Drive files and read content from VSCode CC extension
- Config persists across VSCode restarts

---

### Task List

- [ ] **Task 1: Check bun availability + decide package**
  - Run `bun --version` in terminal
  - If bun available: proceed with `benjamine/gdrive-mcp`
  - If not: decide whether to install bun or fall back to official `@modelcontextprotocol/server-gdrive`
  - Acceptance: clear decision on which package to use

- [ ] **Task 2: GCP OAuth credentials setup (manual browser task)**
  - Navigate to Google Cloud Console
  - Create/select project → Enable Google Drive API
  - OAuth consent screen: Internal, app name "gdrive-mcp"
  - Create OAuth 2.0 Desktop App credential
  - Download JSON → extract Client ID + Client Secret
  - Acceptance: have Client ID and Client Secret ready

- [ ] **Task 3: Run one-time auth flow**
  - Execute auth command with Client ID + Client Secret
  - Complete browser OAuth consent
  - Verify credentials stored (Windows Credential Manager or JSON file)
  - Acceptance: auth command exits successfully, no errors

- [ ] **Task 4: Register in `~/.claude.json` + verify**
  - Add `gdrive` entry to `mcpServers` in `~/.claude.json`
  - Restart VSCode
  - Test: search for a known Drive file
  - Acceptance: Drive tools appear and return results

---

### Completed Tasks

---

### Error Log
