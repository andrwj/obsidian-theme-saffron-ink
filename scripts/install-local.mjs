import { copyFile, lstat, mkdir, readFile, realpath } from 'node:fs/promises';
import { homedir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const args = process.argv.slice(2);
if (args.length > 1) throw new Error('Usage: npm run install:local -- /path/to/vault');
const vault = await realpath(path.resolve(args[0] ?? path.join(homedir(), 'ObsidianVault')));
const config = path.join(vault, '.obsidian');
if (!(await lstat(config)).isDirectory()) throw new Error('Vault must have a .obsidian directory');
const sourceManifest = JSON.parse(await readFile(path.join(root, 'manifest.json'), 'utf8'));
const themes = path.join(config, 'themes');
await mkdir(themes, { recursive: true });
if ((await lstat(themes)).isSymbolicLink()) throw new Error('Refusing a symlinked themes directory');
const destination = path.join(themes, 'Saffron Ink');
try {
  const stat = await lstat(destination);
  if (!stat.isDirectory() || stat.isSymbolicLink()) throw new Error('Theme destination must be a regular directory');
  const existing = JSON.parse(await readFile(path.join(destination, 'manifest.json'), 'utf8'));
  if (existing.name !== sourceManifest.name || existing.author !== sourceManifest.author) {
    throw new Error('Existing destination belongs to a different theme or author');
  }
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
  // An existing directory without a manifest is not an installation we own.
  try {
    await lstat(destination);
    throw new Error('Existing destination has no manifest; inspect it before installing');
  } catch (missing) {
    if (missing.code !== 'ENOENT') throw missing;
  }
}
await mkdir(destination, { recursive: true });
for (const name of ['theme.css', 'manifest.json']) {
  try {
    if (!(await lstat(path.join(destination, name))).isFile()) throw new Error(`Refusing non-file destination: ${name}`);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
}
for (const name of ['theme.css', 'manifest.json']) {
  await copyFile(path.join(root, name), path.join(destination, name));
}
console.log(`Installed ${sourceManifest.name} ${sourceManifest.version} in ${destination}`);
console.log('Choose Saffron Ink in Settings → Appearance → Themes, with the light base color scheme.');
