#!/usr/bin/env node
'use strict';

/*
 * stratagem-ado MCP launcher shim (D15).
 *
 * WHY THIS EXISTS: a Claude Code plugin's .mcp.json does string substitution
 * only — it CANNOT read a file's contents into an `env` value. So the secret
 * cannot be injected by a bare `${CLAUDE_PLUGIN_DATA}` reference (that would
 * pass the PATH, not the token, and the server would 401).
 *
 * This shim bridges the gap: it reads the base64("email:PAT") the user placed
 * at ${CLAUDE_PLUGIN_DATA}/pat.b64, exports it as PERSONAL_ACCESS_TOKEN, and
 * execs the PINNED azure-devops MCP server with stdio inherited so the server
 * speaks MCP over stdin/stdout to the Claude Code host.
 *
 * IDENTITY (org) gets the SAME treatment as the secret: it is NOT hardcoded in
 * .mcp.json (which does string-substitution only and can't read a file — the same
 * AP-3 reason the secret can't be injected directly). The shim reads `org` from
 * ${CLAUDE_PLUGIN_DATA}/ado.config.json — the plugin's per-install, non-secret
 * identity home, sitting beside pat.b64 — and passes it to the server. A `--org`
 * CLI arg remains as an optional fallback when no config is present.
 *
 * It is a thin LAUNCHER, not a vendored server binary — the server still
 * installs from npm via `npx` at launch (D14 "registration, not binary" holds).
 *
 * Invoked by .mcp.json as:
 *   node ${CLAUDE_PLUGIN_ROOT}/bin/ado-mcp-launch.js \
 *        --package @azure-devops/mcp@2.7.0 --pat-dir ${CLAUDE_PLUGIN_DATA}
 *   (org resolved from ${CLAUDE_PLUGIN_DATA}/ado.config.json; --org optional fallback)
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

function fail(msg) {
  process.stderr.write('[stratagem-ado] ' + msg + '\n');
  process.exit(1);
}

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--package') out.pkg = argv[i += 1];
    else if (a === '--org') out.org = argv[i += 1];
    else if (a === '--pat-dir') out.patDir = argv[i += 1];
  }
  return out;
}

const args = parseArgs(process.argv.slice(2));
if (!args.pkg) fail('missing --package (e.g. @azure-devops/mcp@2.7.0)');
if (!args.patDir) fail('missing --pat-dir (expected ${CLAUDE_PLUGIN_DATA})');

const patFile = path.join(args.patDir, 'pat.b64');
let pat;
try {
  pat = fs.readFileSync(patFile, 'utf8').trim();
} catch (e) {
  fail(
    'PAT file not found at ' + patFile + '\n' +
    '  Create it: write base64("email:PAT") into that file (see INSTALL.md).'
  );
}
if (!pat) fail('PAT file ' + patFile + ' is empty.');

// Resolve the org (the plugin's per-install identity) the SAME way as the secret:
// from a file in the data dir, NOT a .mcp.json literal (AP-3: .mcp.json can't read
// files). ado.config.json is the non-secret identity home beside pat.b64; --org is
// an optional CLI fallback when no config is present.
const configFile = path.join(args.patDir, 'ado.config.json');
let config = {};
try {
  config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
} catch (e) {
  // Absent/unparseable config is non-fatal IF --org was supplied; the check below
  // fails loud only when neither source yields an org.
}
const org = (config && config.org) || args.org;
if (!org) {
  fail(
    'no org resolved. Set "org" in ' + configFile + '\n' +
    '  (see ado.config.example.json in the plugin root), or pass --org <org>.'
  );
}

// Spawn npx with shell:true. On Windows `npx` is a `.cmd` shim, and Node >=20
// throws EINVAL when spawning a .cmd WITHOUT a shell (CVE-2024-27980 mitigation) —
// so the shell is required, not optional. Args are static/trusted (the pinned
// package + org), so there is no injection surface. The OS shell resolves `npx`.
//
// PATH robustness: the Claude Code VSCode extension spawns plugin MCP servers with a
// minimal PATH that contains `node` but NOT `npx`, so the shell can't find npx and the
// server fails to connect (it works under the CLI, whose PATH is fuller). `npx` ships in
// the SAME directory as the `node` running this shim, so prepend that dir to the child's
// PATH. Windows env keys are case-insensitive — augment the actual key (`Path`/`PATH`),
// never add a duplicate.
const childEnv = Object.assign({}, process.env, { PERSONAL_ACCESS_TOKEN: pat });
const nodeDir = path.dirname(process.execPath);
const pathKey = Object.keys(childEnv).find(function (k) { return k.toLowerCase() === 'path'; }) || 'PATH';
childEnv[pathKey] = nodeDir + path.delimiter + (childEnv[pathKey] || '');
const child = spawn('npx', ['-y', args.pkg, org, '-a', 'pat'], {
  stdio: 'inherit',
  shell: true,
  env: childEnv,
});

const forward = function (sig) { if (!child.killed) child.kill(sig); };
process.on('SIGTERM', function () { forward('SIGTERM'); });
process.on('SIGINT', function () { forward('SIGINT'); });

child.on('error', function (err) { fail('failed to launch MCP server: ' + err.message); });
child.on('exit', function (code) { process.exit(code == null ? 0 : code); });
