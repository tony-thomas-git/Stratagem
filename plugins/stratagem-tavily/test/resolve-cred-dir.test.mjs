/*
 * Tests for the stratagem-tavily newest-wins credential resolver.
 *
 * WHY THESE EXIST: stratagem-ado's INSTALL.md advertises a "newest-wins glob"
 * over its `stratagem-ado-<star>` data dirs that its launcher NEVER
 * implemented (ado-mcp-launch.js:57 is a bare path.join). A documented-but-absent
 * behaviour survives precisely because nothing exercises it. This Add-On builds the
 * glob for real, so it gets a test that would fail if it silently regressed to a
 * path.join.
 *
 * Run: node --test stratagem-addons/plugins/stratagem-tavily/test/*.test.mjs
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { resolveCredFile } = require('../bin/tavily-mcp-launch.js');

/** Build a throwaway `plugins/data`-shaped tree. Returns its path. */
function makeDataRoot() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'sg-tavily-'));
}

/** Write a config into <root>/<dir>, stamped with an explicit mtime. */
function writeConfig(root, dir, apiKey, mtimeMs) {
  const d = path.join(root, dir);
  fs.mkdirSync(d, { recursive: true });
  const f = path.join(d, 'tavily.config.json');
  fs.writeFileSync(f, JSON.stringify({ apiKey }));
  if (mtimeMs !== undefined) fs.utimesSync(f, mtimeMs / 1000, mtimeMs / 1000);
  return d;
}

test('resolves the config from the canonical data dir', () => {
  const root = makeDataRoot();
  const dir = writeConfig(root, 'stratagem-tavily-addons', 'key-canonical');

  const got = resolveCredFile(dir);
  assert.equal(got.dir, fs.realpathSync(dir));
  assert.equal(JSON.parse(fs.readFileSync(got.file, 'utf8')).apiKey, 'key-canonical');
});

test('newest-wins across re-homed dirs — the NEWER config wins even when it is NOT the canonical dir', () => {
  // The marketplace-move scenario: the Add-On moved `stratagem` -> `addons`, so
  // ${CLAUDE_PLUGIN_DATA} now points at -addons, but the user updated the key in
  // the OLD dir. Newest-wins must follow the credential, not the canonical path.
  const root = makeDataRoot();
  const canonical = writeConfig(root, 'stratagem-tavily-addons', 'key-stale', 1_000_000_000_000);
  writeConfig(root, 'stratagem-tavily-stratagem', 'key-fresh', 2_000_000_000_000);

  const got = resolveCredFile(canonical);
  assert.equal(JSON.parse(fs.readFileSync(got.file, 'utf8')).apiKey, 'key-fresh');
  assert.equal(got.candidates.length, 2, 'both racing dirs must be reported, so the shim can warn');
});

test('a stale dir does NOT silently win — ordering is by config mtime, and both are surfaced', () => {
  const root = makeDataRoot();
  const canonical = writeConfig(root, 'stratagem-tavily-addons', 'key-fresh', 2_000_000_000_000);
  writeConfig(root, 'stratagem-tavily-stratagem', 'key-stale', 1_000_000_000_000);

  const got = resolveCredFile(canonical);
  assert.equal(JSON.parse(fs.readFileSync(got.file, 'utf8')).apiKey, 'key-fresh');
  assert.equal(got.candidates.length, 2);
  assert.ok(got.candidates[0].endsWith('stratagem-tavily-addons'), 'newest must rank first');
});

test('keys on the CONFIG mtime, not the directory mtime', () => {
  // Regression guard for a naive `ls -dt <glob>` implementation: touching an
  // unrelated file makes the LOSING dir the newest DIRECTORY, but its config is
  // still older, so it must still lose.
  const root = makeDataRoot();
  const canonical = writeConfig(root, 'stratagem-tavily-addons', 'key-fresh', 2_000_000_000_000);
  const other = writeConfig(root, 'stratagem-tavily-stratagem', 'key-stale', 1_000_000_000_000);
  fs.writeFileSync(path.join(other, 'unrelated.txt'), 'x'); // bumps `other`'s DIR mtime to now

  const got = resolveCredFile(canonical);
  assert.equal(JSON.parse(fs.readFileSync(got.file, 'utf8')).apiKey, 'key-fresh');
});

test('a dir with no config can never win', () => {
  const root = makeDataRoot();
  const canonical = writeConfig(root, 'stratagem-tavily-addons', 'key-only');
  fs.mkdirSync(path.join(root, 'stratagem-tavily-empty'), { recursive: true }); // newer, but empty

  const got = resolveCredFile(canonical);
  assert.equal(got.candidates.length, 1, 'an empty leftover dir must not be a candidate');
  assert.equal(JSON.parse(fs.readFileSync(got.file, 'utf8')).apiKey, 'key-only');
});

test('finds a config in the BARE dir — INSTALL.md calls this the common first-install mistake', () => {
  // `stratagem-tavily-*` cannot match a bare `stratagem-tavily/`. The prefix glob
  // can, so a misplaced key is found and reported rather than silently ignored.
  const root = makeDataRoot();
  const canonical = path.join(root, 'stratagem-tavily-addons');
  fs.mkdirSync(canonical, { recursive: true }); // canonical exists but is EMPTY
  writeConfig(root, 'stratagem-tavily', 'key-misplaced');

  const got = resolveCredFile(canonical);
  assert.ok(got, 'a key in the bare dir must still be found');
  assert.equal(JSON.parse(fs.readFileSync(got.file, 'utf8')).apiKey, 'key-misplaced');
});

test('ignores unrelated sibling plugins', () => {
  const root = makeDataRoot();
  const canonical = writeConfig(root, 'stratagem-tavily-addons', 'key-mine');
  writeConfig(root, 'stratagem-ado-addons', 'key-not-mine', 9_000_000_000_000); // newest, wrong plugin

  const got = resolveCredFile(canonical);
  assert.equal(got.candidates.length, 1);
  assert.equal(JSON.parse(fs.readFileSync(got.file, 'utf8')).apiKey, 'key-mine');
});

test('returns null when no config exists anywhere — the caller fails loud', () => {
  const root = makeDataRoot();
  const canonical = path.join(root, 'stratagem-tavily-addons');
  fs.mkdirSync(canonical, { recursive: true });

  assert.equal(resolveCredFile(canonical), null);
});

test('survives an absent data dir rather than throwing', () => {
  // First run before the user has created anything: must return null (-> fail loud
  // with the INSTALL.md pointer), not crash with ENOENT.
  const root = makeDataRoot();
  assert.equal(resolveCredFile(path.join(root, 'does-not-exist')), null);
});
