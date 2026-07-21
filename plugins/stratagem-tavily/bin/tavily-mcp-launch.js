#!/usr/bin/env node
'use strict';

/*
 * stratagem-tavily MCP launcher shim.
 *
 * WHY THIS EXISTS: a Claude Code plugin's .mcp.json does string substitution
 * only — it CANNOT read a file's contents into an `env` value. So the Tavily
 * API key cannot be injected by a bare `${CLAUDE_PLUGIN_DATA}` reference (that
 * would pass the PATH, not the key, and the server would 401). This is the same
 * constraint that forces every bundled-MCP launcher shim — the pattern any
 * detachable adapter uses to feed its own credentialed MCP a per-install secret.
 *
 * The alternative — "env": { "TAVILY_API_KEY": "${TAVILY_API_KEY}" } — would
 * demand a machine-level env var, and is structurally incapable of the
 * newest-wins glob below. The glob requirement alone forces this shim.
 *
 * NEWEST-WINS CRED RESOLUTION (the reason this file is not a one-liner):
 * Claude Code homes plugin data at `<plugin>-<marketplace>`, so an Add-On that
 * moves between marketplaces RE-HOMES its credentials and leaves the old dir
 * behind. Both dirs then hold a config and race. This shim resolves the config
 * across every `stratagem-tavily*` sibling, newest-wins — and, unlike a naive
 * dir-mtime glob, it:
 *   1. keys on the CONFIG FILE's mtime, not the directory's (a dir's mtime moves
 *      when anything inside it is touched; the credential's recency is what the
 *      user actually intends by "the one I just updated"), and
 *   2. only considers dirs that actually CONTAIN a readable config, so an empty
 *      stale dir can never win, and
 *   3. WARNS LOUDLY when more than one dir holds a config — the marketplace
 *      README notes the glob is mtime-keyed and "a stale dir can silently win".
 *      A silent win is the bug; this makes it audible.
 *
 * STDOUT IS THE MCP WIRE. The child inherits stdio, so stdout carries the MCP
 * protocol. Every diagnostic in this file MUST go to stderr. Never console.log.
 *
 * It is a thin LAUNCHER, not a vendored server binary — the server still
 * installs from npm via `npx` at launch ("registration, not binary", D14).
 *
 * Invoked by .mcp.json as:
 *   node ${CLAUDE_PLUGIN_ROOT}/bin/tavily-mcp-launch.js \
 *        --package tavily-mcp@0.2.21 --data-dir ${CLAUDE_PLUGIN_DATA}
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const CONFIG_NAME = 'tavily.config.json';
const SIBLING_PREFIX = 'stratagem-tavily';

function warn(msg) {
  // stderr ONLY — stdout is the MCP protocol stream.
  process.stderr.write('[stratagem-tavily] ' + msg + '\n');
}

function fail(msg) {
  warn(msg);
  process.exit(1);
}

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--package') out.pkg = argv[i += 1];
    else if (a === '--data-dir') out.dataDir = argv[i += 1];
  }
  return out;
}

/**
 * Resolve the credential config newest-wins across `stratagem-tavily*` data dirs.
 *
 * Pure and exported so it is testable without spawning a server — the
 * cred-resolution logic is deliberately decoupled from the launch path so it
 * can be exercised in a unit test (see test/resolve-cred-dir.test.mjs).
 *
 * @param {string} dataDir  the canonical ${CLAUDE_PLUGIN_DATA} for this plugin
 * @returns {{file: string, dir: string, candidates: string[]}|null}
 */
function resolveCredFile(dataDir) {
  const candidates = new Map(); // dir -> config path (Map de-dupes)

  const consider = function (dir) {
    const file = path.join(dir, CONFIG_NAME);
    try {
      const st = fs.statSync(file);
      if (st.isFile()) candidates.set(path.resolve(dir), file);
    } catch (e) {
      // No config here — this dir simply cannot win. Not an error: an empty
      // leftover dir is the common case after a marketplace move.
    }
  };

  // The canonical dir is always a candidate, even if it is not a `-*` sibling
  // (and even if the glob below cannot see it, e.g. an unreadable parent).
  consider(dataDir);

  // Siblings: every `stratagem-tavily*` dir beside the canonical one. The
  // prefix is deliberately NOT `stratagem-tavily-*`: that pattern cannot match a
  // bare `stratagem-tavily/`, which INSTALL.md calls the most common first-install
  // mistake. Matching it means a misplaced key is FOUND (and reported) rather
  // than silently ignored.
  const parent = path.dirname(path.resolve(dataDir));
  let entries = [];
  try {
    entries = fs.readdirSync(parent, { withFileTypes: true });
  } catch (e) {
    entries = []; // parent unreadable/absent — the canonical dir stands alone.
  }
  for (const ent of entries) {
    if (!ent.isDirectory()) continue;
    if (!ent.name.startsWith(SIBLING_PREFIX)) continue;
    consider(path.join(parent, ent.name));
  }

  if (candidates.size === 0) return null;

  // Newest-wins, keyed on the CONFIG's mtime — not the directory's.
  const ranked = Array.from(candidates.values())
    .map(function (file) {
      return { file: file, dir: path.dirname(file), mtime: fs.statSync(file).mtimeMs };
    })
    .sort(function (a, b) { return b.mtime - a.mtime; });

  return {
    file: ranked[0].file,
    dir: ranked[0].dir,
    candidates: ranked.map(function (r) { return r.dir; }),
  };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.pkg) fail('missing --package (e.g. tavily-mcp@0.2.21)');
  if (!args.dataDir) fail('missing --data-dir (expected ${CLAUDE_PLUGIN_DATA})');

  const resolved = resolveCredFile(args.dataDir);
  if (!resolved) {
    fail(
      'no ' + CONFIG_NAME + ' found in ' + args.dataDir + '\n' +
      '  Create it: copy tavily.config.example.json there and add your key.\n' +
      '  See INSTALL.md. Without it, skills fall back to built-in WebSearch.'
    );
  }

  // Make the race audible. The marketplace README warns a stale dir can silently
  // win; "silently" is the defect, so name the winner and the losers.
  if (resolved.candidates.length > 1) {
    warn(
      'WARNING: ' + resolved.candidates.length + ' data dirs hold a ' + CONFIG_NAME + '.\n' +
      '  Using (newest): ' + resolved.dir + '\n' +
      '  Also found:     ' + resolved.candidates.slice(1).join('\n                  ') + '\n' +
      '  These race by mtime — consolidate to one dir to make this deterministic.'
    );
  } else {
    warn('config resolved from ' + resolved.dir);
  }

  let config;
  try {
    config = JSON.parse(fs.readFileSync(resolved.file, 'utf8'));
  } catch (e) {
    fail(resolved.file + ' is not valid JSON: ' + e.message);
  }

  const apiKey = config && typeof config.apiKey === 'string' ? config.apiKey.trim() : '';
  if (!apiKey) {
    fail('no "apiKey" in ' + resolved.file + ' (see tavily.config.example.json).');
  }
  if (apiKey.indexOf('<') !== -1) {
    fail(
      'the "apiKey" in ' + resolved.file + ' is still the example placeholder.\n' +
      '  Replace it with your key from https://app.tavily.com.'
    );
  }

  // Spawn npx with shell:true. On Windows `npx` is a `.cmd` shim, and Node >=20
  // throws EINVAL when spawning a .cmd WITHOUT a shell (CVE-2024-27980 mitigation) —
  // so the shell is required, not optional. Args are static/trusted (the pinned
  // package), and the KEY is passed via env, never argv — an argv secret is visible
  // in the process table. The OS shell resolves `npx`.
  //
  // PATH robustness: the Claude Code VSCode extension spawns plugin MCP servers with a
  // minimal PATH that contains `node` but NOT `npx`, so the shell can't find npx and the
  // server fails to connect (it works under the CLI, whose PATH is fuller). `npx` ships in
  // the SAME directory as the `node` running this shim, so prepend that dir to the child's
  // PATH. Windows env keys are case-insensitive — augment the actual key (`Path`/`PATH`),
  // never add a duplicate.
  const childEnv = Object.assign({}, process.env, { TAVILY_API_KEY: apiKey });
  const nodeDir = path.dirname(process.execPath);
  const pathKey = Object.keys(childEnv).find(function (k) { return k.toLowerCase() === 'path'; }) || 'PATH';
  childEnv[pathKey] = nodeDir + path.delimiter + (childEnv[pathKey] || '');

  const child = spawn('npx', ['-y', args.pkg], {
    stdio: 'inherit',
    shell: true,
    env: childEnv,
  });

  const forward = function (sig) { if (!child.killed) child.kill(sig); };
  process.on('SIGTERM', function () { forward('SIGTERM'); });
  process.on('SIGINT', function () { forward('SIGINT'); });

  child.on('error', function (err) { fail('failed to launch MCP server: ' + err.message); });
  child.on('exit', function (code) { process.exit(code == null ? 0 : code); });
}

if (require.main === module) main();

module.exports = { resolveCredFile, parseArgs };
