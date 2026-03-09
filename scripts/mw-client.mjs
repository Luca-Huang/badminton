import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

const DEFAULT_BASE_URL = 'https://api.musclewiki.com';

function getCacheFile(cacheDir, key) {
  const digest = crypto.createHash('sha1').update(key).digest('hex');
  return path.join(cacheDir, `${digest}.json`);
}

async function readCache(cacheFile, ttlMs) {
  try {
    const raw = await fs.readFile(cacheFile, 'utf8');
    const payload = JSON.parse(raw);
    const age = Date.now() - payload.timestamp;
    if (age < ttlMs) return payload.data;
    return null;
  } catch {
    return null;
  }
}

async function writeCache(cacheFile, data) {
  await fs.mkdir(path.dirname(cacheFile), { recursive: true });
  const payload = JSON.stringify({ timestamp: Date.now(), data });
  await fs.writeFile(cacheFile, payload, 'utf8');
}

export function createMwClient({
  apiKey = process.env.MW_API_KEY,
  baseUrl = DEFAULT_BASE_URL,
  cacheDir = path.resolve('.cache/mw-api'),
  fetchImpl = globalThis.fetch,
  ttlMs = 24 * 60 * 60 * 1000,
} = {}) {
  if (!apiKey) throw new Error('MW_API_KEY is required');
  if (!fetchImpl) throw new Error('fetch implementation is required');

  async function getJson(endpoint) {
    const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint}`;
    const cacheFile = getCacheFile(cacheDir, endpoint);

    const cached = await readCache(cacheFile, ttlMs);
    if (cached !== null) return cached;

    const res = await fetchImpl(url, {
      headers: {
        Accept: 'application/json',
        'X-API-Key': apiKey,
      },
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`MuscleWiki API request failed (${res.status}): ${body}`);
    }

    const data = await res.json();
    await writeCache(cacheFile, data);
    return data;
  }

  return { getJson };
}
