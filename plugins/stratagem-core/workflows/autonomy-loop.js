export const meta = {
  name: 'autonomy-loop',
  description: 'Unattended Stratagem feature loop: per task, invoke the REAL skills /px -> /ax -> verifier (P1 gate) -> advance; on FAIL, bounded /ex -> /fx auto-recovery (up to maxRecovery attempts, default 3) within the token budget; then a plan-level final integration gate (## Integration-Verify:) before declaring the feature complete. Phases 1-4.',
  phases: [{ title: 'Task loop', detail: 'per task: build -> verify/confirm -> (recover on fail)' }],
}

// args = { planPath: string, taskNumbers: number[] }
// The script itself has NO shell/fs access. Every real action — reading the plan, invoking
// /px /ax /ex /fx via the Skill tool, running each task's Verify: command — happens INSIDE agents.
// (Skill-tool reachability inside a Workflow subagent was confirmed by the spike, run wf_313e6515-f95.)

const VERDICT = {
  type: 'object',
  properties: {
    pass: { type: 'boolean' },
    exitCode: { type: 'number' },
    reason: { type: 'string' },
  },
  required: ['pass', 'exitCode', 'reason'],
}

// The Workflow harness may deliver `args` as a JSON-encoded STRING (background runs) rather
// than a parsed object. Normalize both shapes so the loop is launch-mechanism agnostic.
let opts = args
if (typeof opts === 'string') {
  try { opts = JSON.parse(opts) } catch (e) { opts = null }
}

const planPath = opts && opts.planPath
const taskNumbers = (opts && opts.taskNumbers) || []

// --- Phase 5 (Task 2): run-ledger path. Nullable — the /if launcher passes it, or null when the
// logs/ dir couldn't be created (D6 skip-loud). The SCRIPT never writes the ledger (no fs/shell/clock);
// it only threads ledgerPath + the loop-relative spend into the Bash-having verifier agents, which append.
const ledgerPath = (opts && opts.ledgerPath) || null

// Build the conditional "append one ledger row" instruction for a verifier agent. Empty string when
// ledgerPath is null, so the loop runs ledger-less and never fails on telemetry (D6). The agent stamps
// the time itself (date via Bash) — the script has no clock (Date.now() throws inside a Workflow).
function ledgerAppend(taskLabel, stage, spent, note) {
  if (!ledgerPath) return ''
  return '\nAFTER returning your verdict, append ONE markdown row to the ledger at "' + ledgerPath + '" via Bash ' +
    '(use: printf "%s\\n" "| $(date +%H:%M) | ' + taskLabel + ' | ' + stage + ' | <pass|fail> | <exitCode> | ' +
    (spent != null ? Math.round(spent / 1000) + 'k' : '—') + ' | ' + (note || '—') + ' |" >> "' + ledgerPath + '"). ' +
    'Substitute <pass|fail> and <exitCode> from your actual verdict. This is durable run-telemetry; never fail the task if the append errors.'
}

// --- board-sync seam (Task 5): nullable NEUTRAL board adapter. The /if launcher passes the adapter's skill
// name when a board adapter is configured (e.g. a board plugin is installed+enabled), or null when absent —
// so core stays board-blind: the script names no board vendor, it only threads a skill name it was handed.
// Folded into the EXISTING verifier agents exactly like ledgerAppend — ZERO new agent() calls. No-op (empty
// suffix) when null, so a board-less run is byte-for-byte the same loop. (D2 neutral seam; reuses the
// Phase-5 ledger delegation shape.)
const boardSync = (opts && opts.boardSync) || null

// Build the conditional "notify the board adapter" instruction appended to a verifier agent's prompt. Empty
// string when boardSync is null. The adapter is invoked by the NEUTRAL name the launcher supplied; the
// instruction self-gates on a pass verdict + a "Sync-Id:" marker on the task line, so it no-ops for unsynced
// tasks. Best-effort telemetry (skip-loud) — it must NEVER change or fail the task verdict (Phase-5 posture).
function boardNotify(taskNum) {
  if (!boardSync) return ''
  return '\nAFTER returning your verdict, IF your verdict is pass AND task ' + taskNum + '\'s line in the plan ' +
    'carries a "Sync-Id:" marker, notify the configured board adapter by invoking the skill "' + boardSync + '" ' +
    'with { event: "verified", syncId: <that Sync-Id>, task: ' + taskNum + ' }. This is best-effort board ' +
    'telemetry (skip-loud): if the adapter is absent or errors, log it and move on — NEVER change or fail the task verdict.'
}

// --- notify seam (T11): nullable NEUTRAL notifier adapter — the OUTBOUND twin of boardSync (mirrors its arch
// exactly). The /if launcher passes the adapter's skill name when a notifier/chat plugin is installed+enabled,
// or null when absent — so core stays notifier-blind: the script names no chat vendor/channel, it only threads
// a skill name it was handed. Folded into the EXISTING verifier agents exactly like boardNotify — ZERO new
// agent() calls. No-op (empty suffix) when null, so a notifier-less run is byte-for-byte the same loop.
const notifier = (opts && opts.notifier) || null

// Build the conditional "notify the notifier adapter" instruction appended to a verifier agent's prompt. Empty
// string when notifier is null. The adapter is invoked by the NEUTRAL name the launcher supplied; it self-gates
// on a pass verdict, carrying a human-readable summary (not a board id — notify is an outbound status push).
// Best-effort telemetry (skip-loud) — it must NEVER change or fail the task verdict (mirrors boardNotify).
function notify(taskNum) {
  if (!notifier) return ''
  return '\nAFTER returning your verdict, IF your verdict is pass, notify the configured notifier adapter by ' +
    'invoking the skill "' + notifier + '" with { event: "verified", summary: "task ' + taskNum + ' verified", ' +
    'task: ' + taskNum + ' }. This is best-effort notify telemetry (skip-loud): if the adapter is absent or ' +
    'errors, log it and move on — NEVER change or fail the task verdict.'
}

if (!planPath || taskNumbers.length === 0) {
  log('autonomy-loop: missing args.planPath or args.taskNumbers — nothing to do')
  return { error: 'missing planPath/taskNumbers', results: [] }
}

const results = []

// --- Phase 2 budget guard (Task 4): plan-sourced ceiling, 80% warn, reserve-floor hard halt ---
const CEILING = (opts && opts.budget) || 750000   // plugin default 750k; per-plan "## Budget:" override via opts.budget
const RESERVE = (opts && opts.reserve) || 75000    // halt with this headroom so the escalation summary never overruns
const WARN_AT = 0.8                                // surface a Decisions-Made warning at 80% of ceiling
let warned = false

// --- Phase 3 bounded recovery (Task 2): N /ex->/fx attempts after a verifier fail, then converge or escalate ---
const MAX_RECOVERY = (opts && opts.maxRecovery) || 3   // plugin default 3 (D1); per-plan "## Recovery-Attempts:" override via opts.maxRecovery (D6)

// --- Phase 4 final integration gate (Task 2): plan-level build/test after ALL per-task gates pass ---
const INTEGRATION_TIMEOUT = (opts && opts.integrationTimeout) || 1800   // seconds; a full-solution build is minutes, not 300s (D6)

// budget.spent() is the SHARED cumulative turn spend (main loop + all workflows), not this loop's.
// Baseline it once so the ceiling measures THIS run's spend — launch-time-independent (smoketest finding).
const startSpent = budget.spent()

function escalation(atTask, spent) {
  const completed = results.filter(function (r) { return r.pass }).map(function (r) { return r.task })
  // No silent caps: every halt is logged + surfaced, /ex-style.
  log('BUDGET HALT before task ' + atTask + ': spent ' + spent + ' / ceiling ' + CEILING +
      ' — under the ' + RESERVE + '-token reserve floor.')
  log('Escalation summary: completed ' + JSON.stringify(completed) + ' | spent ' + spent + '/' + CEILING +
      ' | stopped before task ' + atTask + ' | raise "## Budget:" then resume via resumeFromRunId.')
  log('STATUS · HALT(budget) · resumable · stopped before task ' + atTask)   // greppable terminal marker (no-silent-caps)
  return { halted: true, reason: 'budget', atTask: atTask, spent: spent, ceiling: CEILING, completed: completed, results: results }
}

// Phase 3 (Task 3): TERMINAL recovery-exhausted halt — the counterpart to escalation() (budget).
// Distinct `reason` so /if keys its (non-)resume guidance off it; the rich `attempts` ledger is the
// D5 sink for a future messaging service that contacts the dev for gate resolution.
function recoveryEscalation(atTask, priorReasons, lastCheck) {
  const completed = results.filter(function (r) { return r.pass }).map(function (r) { return r.task })
  // No silent caps: the terminal exhaustion halt + the full attempt ledger are logged + surfaced.
  log('RECOVERY EXHAUSTED at task ' + atTask + ': ' + MAX_RECOVERY + ' /ex->/fx attempts did not pass the verifier.')
  log('Attempt ledger (oldest first): ' + JSON.stringify(priorReasons))
  log('Escalation summary: completed ' + JSON.stringify(completed) + ' | task ' + atTask +
      ' TERMINAL (recovery-exhausted, NOT budget — needs human; raising "## Budget:" will not help).')
  log('STATUS · HALT(recovery-exhausted) · terminal · task ' + atTask)   // greppable terminal marker (no-silent-caps)
  return { halted: true, reason: 'recovery-exhausted', atTask: atTask, attempts: priorReasons,
           lastCheck: lastCheck, completed: completed, results: results }
}

// Phase 4 (Task 3): TERMINAL integration halt — the third counterpart to escalation() (budget) and
// recoveryEscalation() (per-task exhaustion). The whole feature passed its per-task gates but does not
// build/pass as one — a cross-task fault for a human, NOT a budget problem (raising "## Budget:" won't help).
function integrationEscalation(lastCheck) {
  const completed = results.filter(function (r) { return r.pass }).map(function (r) { return r.task })
  // No silent caps: the terminal integration halt + the executed-command verdict are logged + surfaced.
  log('INTEGRATION GATE FAILED: plan-level "## Integration-Verify:" did not pass (exit ' +
      (lastCheck && lastCheck.exitCode) + ': ' + (lastCheck && lastCheck.reason) + ').')
  log('Escalation summary: completed ' + JSON.stringify(completed) + ' | all per-task gates passed but the ' +
      'feature does not build/pass as a whole | TERMINAL (integration, NOT budget — needs human).')
  log('STATUS · HALT(integration) · terminal · plan-level gate')   // greppable terminal marker (no-silent-caps)
  return { halted: true, reason: 'integration', lastCheck: lastCheck, completed: completed, results: results }
}

// --- Phase 5 (Task 3): the live STATUS surface. A /goal-style line the SCRIPT log()s at each boundary
// (it alone knows budget.spent()). Pure observability — no control-flow effect. Elapsed time is NOT here
// (the script has no wall-clock); it lives in the agent-stamped ledger rows instead.
function statusLine(spent, where) {
  const done = results.length
  const last = results.length ? (results[results.length - 1].pass ? 'pass' : 'fail') : '—'
  const rec = results.filter(function (r) { return r.recovered }).length
  return 'STATUS · ' + where + ' · done ' + done + '/' + taskNumbers.length +
         ' · spent ' + Math.round(spent / 1000) + 'k/' + Math.round(CEILING / 1000) + 'k (' +
         Math.round((100 * spent) / CEILING) + '%) · last:' + last + ' · recovered:' + rec
}

for (const n of taskNumbers) {
  // budget check BETWEEN tasks — halt before starting a task we cannot afford (clean resume boundary).
  // Tighter of: plan-sourced ceiling (D7) and the harness hard cap (only if a +Nk directive set budget.total).
  const spent = budget.spent() - startSpent   // loop-relative spend (baselined above)
  const remaining = Math.min(CEILING - spent, budget.total ? budget.remaining() : Infinity)
  if (!warned && spent >= WARN_AT * CEILING) {
    warned = true
    log('BUDGET WARN: ' + spent + '/' + CEILING + ' tokens (' + Math.round((100 * spent) / CEILING) +
        '%) before task ' + n + ' — Decisions Made: budget at threshold.')
  }
  if (remaining < RESERVE) {
    return escalation(n, spent)
  }

  log(statusLine(spent, 'task ' + n))
  log('--- Task ' + n + ': starting ---')

  // Stage 1 — BUILDER: the REAL /px then /ax, in ONE subagent so the /px->/ax handoff is preserved
  // in-context. Literal skill invocation, not improv. PICA fires inside /ax.
  const build = await agent(
    'You are the BUILDER for task ' + n + ' of the plan at "' + planPath + '".\n' +
    'Honor LITERAL SKILL INVOCATION — do NOT inline or improvise the skills:\n' +
    '1) Print "--- Task ' + n + ': PX Analysis ---", then invoke the /px skill (Skill tool, skill="px") on task ' + n + ' of this plan.\n' +
    '2) Print "--- Task ' + n + ': AX Implementation ---", then invoke the /ax skill (Skill tool, skill="ax") to implement task ' + n + ' EXACTLY per the /px analysis. PICA runs inside /ax.\n' +
    'Leave all changes uncommitted. Return a short summary of the files you created/modified.',
    { label: 'build:' + n, phase: 'Task loop' }
  )

  // Stage 2 — VERIFIER + CONFIRMER: a SEPARATE instance from the builder (builder != checker, the P1
  // C.3 contract — structurally honored by being a distinct agent() call).
  const gate = await agent(
    'You are the VERIFIER for task ' + n + ' of the plan at "' + planPath + '" — a FRESH instance, NOT the builder.\n' +
    '1) Read the plan, find task ' + n + '\'s "Verify:" command. Run it via Bash; capture exit code + output.\n' +
    '2) Read the actual files/diff the builder changed and the task\'s stated intent/acceptance.\n' +
    '3) Judge: did the change satisfy the task intent AND did the check pass for its scope?\n' +
    'The EXECUTED EXIT CODE is PRIMARY (P1 ODD-8): you may only withhold a pass ON TOP of an exit-0; a ' +
    'non-zero/timeout exit is ALWAYS pass=false and can never be flipped to pass. Return { pass, exitCode, reason }.' +
    ledgerAppend(n, 'verify', spent, '—') +
    boardNotify(n) +
    notify(n),
    { label: 'verify:' + n, phase: 'Task loop', schema: VERDICT }
  )

  // Stage 3 — bounded /ex->/fx auto-recovery on FAIL (P3). Up to MAX_RECOVERY attempts, each
  // re-verified by a FRESH instance; converge (advance) or escalate + HALT. Budget is checked
  // FIRST each attempt so a reserve breach mid-recovery halts as `budget` (resumable, via the
  // shared escalation()), never reclassified as exhaustion (D2 precedence).
  if (!gate || !gate.pass) {
    let recovered = false
    let lastCheck = gate
    // Anti-self-agreement (D4): every attempt's /ex sees ALL prior failure reasons so fixes diverge.
    const priorReasons = [(gate && gate.reason) || ('exit ' + (gate && gate.exitCode))]
    for (let k = 1; k <= MAX_RECOVERY; k++) {
      // budget precedes exhaustion — same reserve-floor guard as the between-tasks check.
      const spentK = budget.spent() - startSpent
      const remainingK = Math.min(CEILING - spentK, budget.total ? budget.remaining() : Infinity)
      if (remainingK < RESERVE) {
        return escalation(n, spentK)
      }
      log(statusLine(spentK, 'task ' + n + ' recover#' + k))
      log('--- Task ' + n + ': recovery attempt ' + k + '/' + MAX_RECOVERY + ' (exit ' + (lastCheck && lastCheck.exitCode) + ') -> /ex -> /fx ---')
      await agent(
        'Task ' + n + ' of "' + planPath + '" failed its verifier (exit ' + (lastCheck && lastCheck.exitCode) + ': ' + (lastCheck && lastCheck.reason) + ').\n' +
        'Prior failed attempts for this task (DO NOT repeat these fixes — diverge):\n' +
        priorReasons.map(function (r, i) { return '  [' + i + '] ' + r }).join('\n') + '\n' +
        'Print "--- Task ' + n + ': Skill ex ---" and invoke the /ex skill to document the failure, then ' +
        'print "--- Task ' + n + ': Skill fx ---" and invoke the /fx skill to fix it. SINGLE pass only.',
        { label: 'recover:' + n + ':' + k, phase: 'Task loop' }
      )
      lastCheck = await agent(
        'FRESH verifier for task ' + n + ' of "' + planPath + '" after /fx attempt ' + k + '. Re-run task ' + n + '\'s Verify: command via Bash; ' +
        'judge intent-vs-diff. Return { pass, exitCode, reason }.' +
        ledgerAppend(n, 'recover#' + k, spentK, 'recovery attempt ' + k) +
        boardNotify(n) +
        notify(n),
        { label: 'reverify:' + n + ':' + k, phase: 'Task loop', schema: VERDICT }
      )
      if (lastCheck && lastCheck.pass) { recovered = true; break }
      priorReasons.push((lastCheck && lastCheck.reason) || ('exit ' + (lastCheck && lastCheck.exitCode)))
    }
    results.push({ task: n, pass: recovered, exitCode: lastCheck && lastCheck.exitCode, reason: lastCheck && lastCheck.reason, recovered: true })
    if (!recovered) {
      return recoveryEscalation(n, priorReasons, lastCheck)
    }
    log('Task ' + n + ' complete (after recovery)')
    continue
  }

  results.push({ task: n, pass: true, exitCode: gate.exitCode, reason: gate.reason })
  log('Task ' + n + ' complete')
}

// --- Phase 4 (Task 2): plan-level FINAL INTEGRATION GATE — runs ONCE after every per-task verifier
// has passed. The local stand-in for "external CI/board green": a FRESH instance (builder != checker, P1 C.3
// at plan scope) runs the executed build/test command, exit-code primary. /if-only path (D4).
const integrationVerify = opts && opts.integrationVerify
if (!integrationVerify) {
  // D1 — absent header: skip LOUD, never fabricate a build command (no silent caps).
  log('INTEGRATION GATE SKIPPED: plan declares no "## Integration-Verify:" — feature marked complete on ' +
      'per-task gates ONLY. Add the header for a full build/test gate.')
  return { halted: false, integration: { skipped: true }, completed: results.map(function (r) { return r.task }), results: results }
}

// Budget check FIRST (same reserve-floor guard as the between-tasks + recovery checks); a breach here
// halts as `budget` (resumable), precedence over the integration verdict.
const spentI = budget.spent() - startSpent
const remainingI = Math.min(CEILING - spentI, budget.total ? budget.remaining() : Infinity)
if (remainingI < RESERVE) {
  return escalation('the integration gate', spentI)
}

log(statusLine(spentI, 'integration gate'))
log('--- Integration gate: running plan-level "## Integration-Verify:" (timeout ' + INTEGRATION_TIMEOUT + 's) ---')
const integ = await agent(
  'You are the INTEGRATION VERIFIER for the WHOLE plan at "' + planPath + '" — a FRESH instance, NOT any task builder.\n' +
  'Run this exact command via Bash with a ' + INTEGRATION_TIMEOUT + '-second timeout; capture exit code + output:\n' +
  '  ' + integrationVerify + '\n' +
  'The EXECUTED EXIT CODE is PRIMARY: exit 0 = pass; any non-zero or timeout = fail (never flip a non-zero to pass). ' +
  'Return { pass, exitCode, reason }.' +
  ledgerAppend('—', 'integration', spentI, 'plan-level final gate'),
  { label: 'integration-gate', phase: 'Task loop', schema: VERDICT }
)
if (!integ || !integ.pass) {
  return integrationEscalation(integ)
}
log('Integration gate PASSED (exit 0) — feature complete.')
return { halted: false, integration: { passed: true, exitCode: 0 }, completed: results.map(function (r) { return r.task }), results: results }
