#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# stratagem-core · SessionStart hook: auto-install the /sg:if autonomy-loop workflow.
#
# WHY: Claude Code plugins cannot register a Workflow script directly — the Workflow
# tool only discovers scripts in <project>/.claude/workflows/ or ~/.claude/workflows/.
# So we ship the workflow inside the plugin bundle and copy it into the active
# project's .claude/workflows/ on every session start. This keeps the workflow
# CURRENT (it re-syncs from the bundle on each session, so plugin updates flow
# through automatically) with zero manual steps.
#
# CONTRACT: best-effort / skip-loud. Never fails the session — always exits 0.
#   $1 (or $CLAUDE_PROJECT_DIR) = the active project dir. Workflow source is found
#   relative to this script, so no reliance on ${CLAUDE_PLUGIN_ROOT} inside the body.
# ─────────────────────────────────────────────────────────────────────────────
set -u

PROJECT_DIR="${1:-${CLAUDE_PROJECT_DIR:-}}"
[ -z "$PROJECT_DIR" ] && exit 0
[ -d "$PROJECT_DIR" ] || exit 0

# Only touch real workspaces (a git repo or an existing .claude/), never a random cwd.
[ -d "$PROJECT_DIR/.git" ] || [ -d "$PROJECT_DIR/.claude" ] || exit 0

# The bundled workflow lives beside this script's parent (…/stratagem-core/workflows/).
SRC="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." 2>/dev/null && pwd)/workflows/autonomy-loop.js"
[ -f "$SRC" ] || exit 0

DEST_DIR="$PROJECT_DIR/.claude/workflows"
DEST="$DEST_DIR/autonomy-loop.js"

mkdir -p "$DEST_DIR" 2>/dev/null || exit 0

# Idempotent: copy only when missing or changed, so it always tracks the bundled version.
if [ ! -f "$DEST" ] || ! cmp -s "$SRC" "$DEST" 2>/dev/null; then
  cp "$SRC" "$DEST" 2>/dev/null || exit 0
fi

exit 0
