import fs from 'node:fs/promises';
import path from 'node:path';

import { createMwClient } from './mw-client.mjs';
import { MW_LIBRARY_BLUEPRINT, WARMUP_BLUEPRINT, COOLDOWN_BLUEPRINT } from './mw-library-blueprint.mjs';
import { normalizePublicVideoUrl, pickVideo, toExerciseId } from './mw-library-utils.mjs';

const DEFAULT_OUTPUT = path.resolve('data/exercises.mw.json');
const MODULES = ['core', 'legs', 'agility', 'cardio', 'upper'];

function parseArgs(argv) {
  const args = { out: DEFAULT_OUTPUT, jsOut: null };
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === '--out' && argv[i + 1]) args.out = path.resolve(argv[i + 1]);
    if (token === '--js-out' && argv[i + 1]) args.jsOut = path.resolve(argv[i + 1]);
  }
  return args;
}

function pickBestMatch(results, query) {
  if (!Array.isArray(results) || results.length === 0) return null;
  const q = query.trim().toLowerCase();
  const exact = results.find(item => item.name?.toLowerCase() === q);
  if (exact) return exact;

  const includes = results.find(item => item.name?.toLowerCase().includes(q));
  return includes || results[0];
}

function toTips(steps) {
  const list = Array.isArray(steps) ? steps.filter(Boolean) : [];
  return list.slice(0, 3);
}

function toFallbackMistakes(module) {
  const map = {
    core: ['动作过程中保持核心收紧', '避免借力摆动代偿'],
    legs: ['膝盖方向与脚尖一致', '避免塌腰或重心前冲'],
    agility: ['落地先稳再起动', '避免触地时间过长'],
    cardio: ['保持呼吸节奏', '动作幅度优先于盲目提速'],
    upper: ['肩胛先稳定再发力', '避免耸肩和代偿'],
  };
  return map[module] || ['保持动作质量', '避免明显代偿'];
}

const matchCache = new Map();

async function resolveMatch(client, query) {
  if (matchCache.has(query)) return matchCache.get(query);
  const endpoint = `/search?q=${encodeURIComponent(query)}&limit=8`;
  const data = await client.getJson(endpoint);
  const results = Array.isArray(data) ? data : data.results || [];
  const match = pickBestMatch(results, query);
  if (!match) {
    throw new Error(`No exercise matched query: ${query}`);
  }
  matchCache.set(query, match);
  return match;
}

async function resolveExercise(client, item) {
  const match = await resolveMatch(client, item.query);

  const side = pickVideo(match.videos, 'side');
  const front = pickVideo(match.videos, 'front');

  return {
    id: toExerciseId(match.name),
    module: item.module,
    name: item.name,
    why: item.why,
    sets: item.sets,
    reps: item.reps,
    rest: item.rest,
    tips: toTips(match.steps),
    mistakes: toFallbackMistakes(item.module),
    videoSide: normalizePublicVideoUrl(side?.url || front?.url || ''),
    videoFront: normalizePublicVideoUrl(front?.url || side?.url || ''),
    fallbackImageSide: '',
    fallbackImageFront: '',
    source: {
      id: match.id,
      name: match.name,
      category: match.category || null,
      difficulty: match.difficulty || null,
      primary_muscles: match.primary_muscles || [],
    },
  };
}

async function resolveStep(client, item) {
  const match = await resolveMatch(client, item.query);
  const side = pickVideo(match.videos, 'side');
  const front = pickVideo(match.videos, 'front');

  return {
    id: toExerciseId(match.name),
    stepType: item.stepType,
    focus: item.focus,
    name: item.name,
    duration: item.duration,
    tips: toTips(match.steps),
    mistakes: [],
    videoSide: normalizePublicVideoUrl(side?.url || front?.url || ''),
    videoFront: normalizePublicVideoUrl(front?.url || side?.url || ''),
    fallbackImageSide: '',
    fallbackImageFront: '',
    source: {
      id: match.id,
      name: match.name,
      category: match.category || null,
      difficulty: match.difficulty || null,
      primary_muscles: match.primary_muscles || [],
    },
  };
}

async function main() {
  const { out, jsOut } = parseArgs(process.argv.slice(2));
  const ttlDays = Number(process.env.MW_CACHE_DAYS || 30);
  const ttlMs = Math.max(0, ttlDays) * 24 * 60 * 60 * 1000;

  const client = createMwClient({
    apiKey: process.env.MW_API_KEY,
    ttlMs,
    cacheDir: path.resolve('.cache/mw-api'),
  });

  const grouped = Object.fromEntries(MODULES.map(m => [m, []]));
  const resolved = [];

  for (const item of MW_LIBRARY_BLUEPRINT) {
    if (!grouped[item.module]) {
      throw new Error(`Unknown module: ${item.module}`);
    }
    const exercise = await resolveExercise(client, item);
    grouped[item.module].push(exercise);
    resolved.push({ module: item.module, query: item.query, matched: exercise.source.name });
  }

  const warmup = [];
  for (const item of WARMUP_BLUEPRINT) {
    const step = await resolveStep(client, item);
    warmup.push(step);
    resolved.push({ module: 'warmup', query: item.query, matched: step.source.name });
  }

  const cooldown = [];
  for (const item of COOLDOWN_BLUEPRINT) {
    const step = await resolveStep(client, item);
    cooldown.push(step);
    resolved.push({ module: 'cooldown', query: item.query, matched: step.source.name });
  }

  const payload = {
    generatedAt: new Date().toISOString(),
    note: 'Generated from MuscleWiki API. Runtime app should read local data to avoid API quota usage.',
    modules: grouped,
    warmup,
    cooldown,
    mapping: resolved,
  };

  await fs.mkdir(path.dirname(out), { recursive: true });
  await fs.writeFile(out, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');

  const jsTarget = jsOut || path.resolve(path.dirname(out), 'exercises.mw.js');
  const jsModule = `// Auto-generated by scripts/sync-mw-library.mjs\n` +
    `export const EXERCISES_MW = ${JSON.stringify(grouped, null, 2)};\n` +
    `export const WARMUP_MW = ${JSON.stringify(warmup, null, 2)};\n` +
    `export const COOLDOWN_MW = ${JSON.stringify(cooldown, null, 2)};\n`;
  await fs.writeFile(jsTarget, jsModule, 'utf8');

  const total = MW_LIBRARY_BLUEPRINT.length;
  console.log(`Synced ${total} exercises to ${out}`);
  console.log(`Generated JS module at ${jsTarget}`);
}

main().catch(err => {
  console.error(err.message || err);
  process.exit(1);
});
