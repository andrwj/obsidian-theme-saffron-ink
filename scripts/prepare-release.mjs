import assert from 'node:assert/strict';
import { copyFile, mkdir, readFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
const manifest = JSON.parse(await readFile(new URL('manifest.json', root), 'utf8'));
const tag = process.env.RELEASE_TAG;
if (tag) assert.equal(tag, manifest.version, 'Release tag must equal manifest.version, without a v prefix');
const destination = new URL(`artifacts/release/${manifest.version}/`, root);
await mkdir(destination, { recursive: true });
const assets = ['manifest.json', 'theme.css'];
const existing = await readdir(destination);
assert.ok(existing.every(name => assets.includes(name)), 'Unexpected files in release directory; inspect before proceeding');
for (const name of assets) await copyFile(new URL(name, root), new URL(name, destination));
assert.deepEqual((await readdir(destination)).sort(), assets);
console.log(`Prepared upload assets: ${fileURLToPath(destination)}`);
