import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const readJson = async (name) => JSON.parse(await readFile(new URL(name, root), 'utf8'));
const manifest = await readJson('manifest.json');
const pkg = await readJson('package.json');
const versions = await readJson('versions.json');
const semver = /^\d+\.\d+\.\d+$/;
for (const field of ['name', 'author', 'version', 'minAppVersion']) {
  assert.equal(typeof manifest[field], 'string', `manifest.${field} must be a string`);
  assert.ok(manifest[field].trim(), `manifest.${field} must not be empty`);
}
assert.ok(semver.test(manifest.version), 'Invalid theme version');
assert.ok(semver.test(manifest.minAppVersion), 'Invalid minimum app version');
assert.equal(pkg.version, manifest.version, 'Package and manifest versions differ');
assert.equal(versions[manifest.version], manifest.minAppVersion, 'Compatibility entry differs');
assert.ok((await readFile(new URL('theme.css', root), 'utf8')).trim(), 'Empty theme');
console.log(`Validated ${manifest.name} ${manifest.version} (Obsidian ${manifest.minAppVersion}+)`);
