import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { createMwClient } from '../scripts/mw-client.mjs';

async function makeTempDir() {
  return fs.mkdtemp(path.join(os.tmpdir(), 'mw-client-test-'));
}

test('createMwClient throws when api key is missing', async () => {
  const dir = await makeTempDir();
  assert.throws(() => createMwClient({ cacheDir: dir }), /MW_API_KEY/);
});

test('client caches fresh responses and skips duplicate API calls', async () => {
  const dir = await makeTempDir();
  let calls = 0;

  const fetchImpl = async () => {
    calls += 1;
    return new Response(
      JSON.stringify({ total: 1, results: [{ id: 1, name: 'Forearm Plank' }] }),
      { status: 200, headers: { 'content-type': 'application/json' } }
    );
  };

  const client = createMwClient({
    apiKey: 'test_key',
    cacheDir: dir,
    fetchImpl,
    ttlMs: 10 * 60 * 1000,
  });

  const a = await client.getJson('/search?q=plank&limit=1');
  const b = await client.getJson('/search?q=plank&limit=1');

  assert.equal(calls, 1);
  assert.deepEqual(a, b);

  const files = await fs.readdir(dir);
  assert.ok(files.length >= 1);
});

test('expired cache triggers refetch', async () => {
  const dir = await makeTempDir();
  let calls = 0;

  const fetchImpl = async () => {
    calls += 1;
    return new Response(
      JSON.stringify({ total: 1, results: [{ id: calls, name: 'Dynamic' }] }),
      { status: 200, headers: { 'content-type': 'application/json' } }
    );
  };

  const client = createMwClient({
    apiKey: 'test_key',
    cacheDir: dir,
    fetchImpl,
    ttlMs: 0,
  });

  await client.getJson('/search?q=plank&limit=1');
  await client.getJson('/search?q=plank&limit=1');

  assert.equal(calls, 2);
});
