---
name: help
description: Lifecycle Map - print the Stratagem skill flow as an ASCII reference card; --html writes a swimlane page
argument-hint: "[--html [path]]"
---

# HELP (Lifecycle Map)

**Purpose:** Print the Stratagem skill lifecycle as a single at-a-glance reference — the `ps → pf → cp → px → ax → cf → rs` spine, the `ex → fx` recovery loop, the variant lanes, and a grouped legend giving every skill its name and one-liner. A static, deterministic reference card: it prints (or writes) pre-authored content, it never generates.

**Task:** $ARGUMENTS

**IMMEDIATELY display this banner:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 ⚡ HELP (Lifecycle Map) MODE ACTIVE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Task: [show $ARGUMENTS or "printing map"]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Instructions:**

1. **Parse `$ARGUMENTS`.**
   - If it contains `--html` → **HTML mode** (step 3).
   - Otherwise → **ASCII mode** (step 2, the default).

2. **ASCII mode (default).** Print the card below **verbatim**, exactly as written — do not regenerate, reflow, re-align, annotate, or explain it. Emit the block and stop.

```
 ═══════════════════════════════════════════════════════════════════════════════
                            STRATAGEM · lifecycle map
 ═══════════════════════════════════════════════════════════════════════════════

    seed    plan    break   pick    build   close   learn
   ┌────┐  ┌────┐  ┌────┐  ┌────┐  ┌────┐  ┌────┐  ┌────┐
   │/ps │─▶│/pf │─▶│/cp │─▶│/px │─▶│/ax │─▶│/cf │─▶│/rs │
   └────┘  └────┘  └────┘  └────┘  └─┬──┘  └────┘  └────┘
                     recovery ↺  on /ax fail: /ex ▶ /fx 

   PLANNING     /ps  Plan Seed              seed a raw idea into a reasoned brief
                /pf  Plan Features          turn open questions into a feature plan
                /cp  Create Plan            break the plan into atomic, verifiable tasks
   EXECUTION    /px  Plan Execute           select + analyze one task
                /ax  Authorize Execution    implement the task as specified (PICA here)
   RECOVERY     /ex  Error Executing        document a failure + create a fix plan
                /fx  Fix Execution          implement the fix /ex logged
   CLOSE·LEARN  /cf  Complete Feature       finish remaining tasks + exec summary
                /rs  Retrospective Summary  extract learnings into the wiki / gold docs

   VARIANT LANES
    quick  (<5 files)    /mpx Memory Plan Execute ▶ /max Memory Authorize Execute
    phase  (a range)     /phx Phase Execute        chain /px▶/ax across a task range
    auto   (unattended)  /if  Implement Feature     budget-guarded autonomy loop

   SUPPORTING
    /rp Read Plan · /um UpdateMe · /pica Compliance Audit · /crs Conv Retro
```

3. **HTML mode (`--html [path]`).** Resolve the destination: the path token after `--html` if the user gave one, else the default `docs/lifecycle-map.html`. Create the parent directory if needed, then write the HTML document below **verbatim** to that path — copy the exact bytes, do **not** generate, restyle, or regenerate markup. Then echo one line: `wrote <path>` — and stop.

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>STRATAGEM · lifecycle map</title>
<style>
  :root{--ink:#1a2733;--mut:#5b6b7a;--line:#e1e7ee;
    --plan:#90EE90;--planE:#228B22;--exec:#87CEEB;--execE:#4682B4;
    --rec:#FFA07A;--recE:#DC143C;--done:#DDA0DD;--doneE:#8B008B;--var:#eef1f5;--varE:#c4ccd6;}
  *{box-sizing:border-box}
  body{font:15px/1.5 -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:var(--ink);
    margin:0;padding:28px 24px 56px;background:#fbfcfd;max-width:1040px;margin:0 auto}
  h1{font-size:22px;margin:0 0 2px;letter-spacing:.02em}
  .sub{color:var(--mut);margin:0 0 22px;font-size:13px}
  h2{font-size:12px;text-transform:uppercase;letter-spacing:.09em;color:var(--mut);margin:26px 0 10px}
  /* spine */
  .spine{display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin:6px 0 4px}
  .node{border-radius:9px;padding:9px 12px;min-width:64px;text-align:center;border:2px solid}
  .node .cmd{font:600 14px ui-monospace,Consolas,monospace}
  .node .role{display:block;font-size:10.5px;color:#3a4a58;margin-bottom:2px;letter-spacing:.03em}
  .p{background:var(--plan);border-color:var(--planE)}
  .e{background:var(--exec);border-color:var(--execE)}
  .d{background:var(--done);border-color:var(--doneE)}
  .arrow{color:var(--mut);font-size:16px}
  .recov{margin:8px 0 0;color:var(--recE);font:13px ui-monospace,Consolas,monospace}
  /* swimlanes */
  .lanes{display:grid;grid-template-columns:132px 1fr;gap:8px;align-items:stretch}
  .lane-h{display:flex;align-items:center;font:600 12px sans-serif;letter-spacing:.04em;
    padding:10px 12px;border-radius:8px;color:#1a2733}
  .lh-p{background:var(--plan)}.lh-e{background:var(--exec)}.lh-r{background:var(--rec)}.lh-d{background:var(--done)}
  .lane-c{display:flex;flex-wrap:wrap;gap:8px}
  .card{border:1px solid var(--line);border-left:4px solid;border-radius:8px;padding:8px 11px;
    background:#fff;min-width:210px;flex:1 1 210px}
  .card .top{font:600 13px ui-monospace,Consolas,monospace;margin-bottom:2px}
  .card .desc{font-size:12px;color:var(--mut)}
  .b-p{border-left-color:var(--planE)}.b-e{border-left-color:var(--execE)}
  .b-r{border-left-color:var(--recE)}.b-d{border-left-color:var(--doneE)}
  .band{margin-top:22px}
  .pills{display:flex;flex-wrap:wrap;gap:8px}
  .pill{background:var(--var);border:1px solid var(--varE);border-radius:7px;padding:7px 11px;font-size:12.5px}
  .pill b{font:600 12.5px ui-monospace,Consolas,monospace}
  .pill .d{color:var(--mut)}
  footer{margin-top:30px;color:var(--mut);font-size:11.5px;border-top:1px solid var(--line);padding-top:10px}
</style>
</head>
<body>
  <h1>STRATAGEM · lifecycle map</h1>
  <p class="sub">seed → plan → decompose → execute → recover → close → learn</p>

  <h2>Flow</h2>
  <div class="spine">
    <div class="node p"><span class="role">seed</span><span class="cmd">/ps</span></div><span class="arrow">▶</span>
    <div class="node p"><span class="role">plan</span><span class="cmd">/pf</span></div><span class="arrow">▶</span>
    <div class="node p"><span class="role">break</span><span class="cmd">/cp</span></div><span class="arrow">▶</span>
    <div class="node e"><span class="role">pick</span><span class="cmd">/px</span></div><span class="arrow">▶</span>
    <div class="node e"><span class="role">build</span><span class="cmd">/ax</span></div><span class="arrow">▶</span>
    <div class="node d"><span class="role">close</span><span class="cmd">/cf</span></div><span class="arrow">▶</span>
    <div class="node d"><span class="role">learn</span><span class="cmd">/rs</span></div>
  </div>
  <p class="recov">recovery ↺ &nbsp; on /ax fail: &nbsp; /ax ▶ /ex ▶ /fx ▶ /ax &nbsp; (≤3×)</p>

  <h2>Skills</h2>
  <div class="lanes">
    <div class="lane-h lh-p">📋 PLANNING</div>
    <div class="lane-c">
      <div class="card b-p"><div class="top">🌱 /ps · Plan Seed</div><div class="desc">seed a raw idea into a reasoned brief</div></div>
      <div class="card b-p"><div class="top">📋 /pf · Plan Features</div><div class="desc">turn open questions into a feature plan</div></div>
      <div class="card b-p"><div class="top">📝 /cp · Create Plan</div><div class="desc">break the plan into atomic, verifiable tasks</div></div>
    </div>

    <div class="lane-h lh-e">🚀 EXECUTION</div>
    <div class="lane-c">
      <div class="card b-e"><div class="top">🔍 /px · Plan Execute</div><div class="desc">select + analyze one task</div></div>
      <div class="card b-e"><div class="top">🚀 /ax · Authorize Execution</div><div class="desc">implement the task as specified (PICA audits here)</div></div>
    </div>

    <div class="lane-h lh-r">⚠️ RECOVERY</div>
    <div class="lane-c">
      <div class="card b-r"><div class="top">⚠️ /ex · Error Executing</div><div class="desc">document a failure + create a fix plan</div></div>
      <div class="card b-r"><div class="top">🔧 /fx · Fix Execution</div><div class="desc">implement the fix /ex logged</div></div>
    </div>

    <div class="lane-h lh-d">✅ CLOSE · LEARN</div>
    <div class="lane-c">
      <div class="card b-d"><div class="top">✅ /cf · Complete Feature</div><div class="desc">finish remaining tasks + executive summary</div></div>
      <div class="card b-d"><div class="top">📚 /rs · Retrospective Summary</div><div class="desc">extract learnings into the wiki / gold docs</div></div>
    </div>
  </div>

  <div class="band">
    <h2>Variant lanes</h2>
    <div class="pills">
      <div class="pill"><b>/mpx ▶ /max</b> <span class="d">— quick (&lt;5 files): plan + execute small work in memory</span></div>
      <div class="pill"><b>/phx</b> <span class="d">— phase / range: chain /px▶/ax across a task range</span></div>
      <div class="pill"><b>/if</b> <span class="d">— unattended: budget-guarded autonomy loop</span></div>
    </div>
  </div>

  <div class="band">
    <h2>Supporting</h2>
    <div class="pills">
      <div class="pill"><b>/rp</b> <span class="d">— Read Plan: resume + restore context</span></div>
      <div class="pill"><b>/um</b> <span class="d">— UpdateMe: instant status snapshot</span></div>
      <div class="pill"><b>/pica</b> <span class="d">— Compliance Audit: pattern consistency</span></div>
      <div class="pill"><b>/crs</b> <span class="d">— Conversation Retrospective</span></div>
    </div>
  </div>

  <footer>STRATAGEM · lifecycle map — a static reference. Regenerate with <code>/help --html</code>.</footer>
</body>
</html>
```

**Key Principles:**
- **Static + deterministic** — the ASCII card and the HTML page are pre-authored literals. Print or copy them verbatim; never regenerate, reflow, or "improve" them.
- **Silent** — emit the map (or `wrote <path>`) and stop. Never explain the output, add commentary, or narrate the flow.
- **No repo reads** — the map is fixed reference content; it does not inspect the project, git, or any plan.

**Next:** `/ps` to start a new feature from the top of the flow, or `/um` for live status on an in-flight plan.
