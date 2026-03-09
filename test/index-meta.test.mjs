import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const indexHtml = readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

test('index.html defines an explicit favicon under repo path', () => {
  assert.match(
    indexHtml,
    /<link[^>]+rel="icon"[^>]+href="\.\/*icons\/icon-192\.png"/i
  );
});

test('index.html includes modern mobile web app capability meta tag', () => {
  assert.match(
    indexHtml,
    /<meta[^>]+name="mobile-web-app-capable"[^>]+content="yes"/i
  );
});
