import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = name => readFile(path.join(root, name), 'utf8');
for (const name of ['README.md', 'LICENSE', 'theme.css', 'manifest.json', 'versions.json']) {
  assert.ok((await read(name)).trim(), `${name} is missing or empty`);
}
const license = await read('LICENSE');
assert.ok(license.includes('MIT License') && license.includes('Copyright 2020 Ling CHU'), 'Missing MIT attribution');
const css = (await read('theme.css')).replace(/\/\*[\s\S]*?\*\//g, '');
// These scoped overrides are required by Obsidian's inline resize padding and
// its built-in !important table margin. All other !important uses remain banned.
const importantExceptions = new Map([
  ['.theme-light .markdown-source-view.mod-cm6 .cm-content, .theme-light .markdown-preview-view .markdown-preview-sizer', 'padding-bottom: 0 !important'],
  ['.theme-light .markdown-source-view.mod-cm6 .cm-table-widget', 'margin: 0 !important'],
]);
const checkedCss = css.replace(/([^{}]+)\{([^{}]*)\}/g, (rule, selector, declarations) => {
  const exception = importantExceptions.get(selector.trim().replace(/\s+/g, ' '));
  if (!exception) return rule;
  return `${selector}{${declarations.split(';').map(declaration =>
    declaration.trim() === exception ? declaration.replace('!important', '') : declaration
  ).join(';')}}`;
});
assert.ok(!/@import|!important|url\(\s*['"]?(?:https?:|\/\/)/i.test(checkedCss), 'Theme must remain self-contained and follow CSS guidelines');
for (const [name, width, height] of [['screenshot.png', 512, 288], ['desktop.png', 1280, 720], ['font-awesome.png', 1280, 720]]) {
  const png = await readFile(path.join(root, 'screenshots', name));
  assert.equal(png.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', `${name}: invalid PNG`);
  assert.equal(png.readUInt32BE(16), width, `${name}: wrong width`);
  assert.equal(png.readUInt32BE(20), height, `${name}: wrong height`);
}
const candidates = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z'], { cwd: root, encoding: 'utf8' }).split('\0').filter(Boolean);
for (const name of candidates) {
  assert.ok(!/(^|\/)(AGENTS\.md|CLAUDE\.md|node_modules|artifacts|\.obsidian|\.codex|\.agents)(\/|$)/.test(name), `Private/development-only file included: ${name}`);
  if (/\.(md|json|mjs|css|ya?ml)$/.test(name)) {
    assert.ok(!/\/Users\/[^/\s]+\//.test(await read(name)), `Personal absolute path in ${name}`);
  }
}
const readme = await read('README.md');
for (const match of readme.matchAll(/\]\(([^)]+)\)/g)) {
  const target = match[1];
  if (!/^(?:https?:|#)/.test(target)) {
    const file = path.normalize(target.split('#')[0]);
    assert.ok(candidates.includes(file), `README link is excluded or missing: ${file}`);
    await access(path.join(root, file));
  }
}
console.log(`Submission files validated (${candidates.length} public files). Publication and directory review remain manual.`);
