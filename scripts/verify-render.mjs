import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = path.join(root, 'artifacts');
await mkdir(output, { recursive: true });

// Read vendor CSS as test data; do not vendor the proprietary app stylesheet.
async function appCss() {
  if (process.env.OBSIDIAN_APP_CSS) return readFile(process.env.OBSIDIAN_APP_CSS, 'utf8');
  const archive = await readFile('/Applications/Obsidian.app/Contents/Resources/obsidian.asar');
  const headerSize = archive.readUInt32LE(4);
  const jsonSize = archive.readUInt32LE(12);
  const header = JSON.parse(archive.subarray(16, 16 + jsonSize).toString());
  const entry = header.files['app.css'];
  assert.ok(entry?.offset, 'app.css missing from Obsidian archive; use OBSIDIAN_APP_CSS');
  const start = 8 + headerSize + Number(entry.offset);
  return archive.subarray(start, start + entry.size).toString();
}

// app:// font URLs are unavailable in a standalone renderer. Only replace
// bundled font sources; the vendor's layout and typography rules stay intact.
const vendor = (await appCss()).replace(/@font-face\s*\{[^}]*\}/g, '');
const theme = await readFile(path.join(root, 'theme.css'), 'utf8');
const expectedWeights = ['800', '700', '600', '500', '400', '300'];
const fontDir = path.join(homedir(), 'Library', 'Fonts');
const fontBuffers = new Map();
const fontCases = [{ name: 'System font', family: 'sans-serif', faces: [] }];
// Optional installed fonts are embedded only in a local QA page, never theme.css.
for (const font of [
  { name: 'Pretendard Variable', family: 'QA Pretendard', files: [['PretendardVariable.ttf', '100 900']] },
  { name: 'JetBatang NF', family: 'QA JetBatang', files: [
    ['JetBatangNF-ExtraBold.ttf', '800'], ['JetBatangNF-Bold.ttf', '700'],
    ['JetBatangNF-SemiBold.ttf', '600'], ['JetBatangNF-Medium.ttf', '500'],
    ['JetBatangNF-Regular.ttf', '400'], ['JetBatangNF-Light.ttf', '300'],
  ] },
]) {
  try {
    const faces = [];
    for (const [file, weight] of font.files) {
      const bytes = await readFile(path.join(fontDir, file));
      fontBuffers.set(file, bytes);
      faces.push(`@font-face { font-family: "${font.family}"; font-weight: ${weight}; src: url("https://saffron-ink.invalid/qa-fonts/${file}") format("truetype"); }`);
    }
    fontCases.push({ ...font, faces });
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    console.log(`Optional font unavailable: ${font.name}`);
  }
}

const titles = ['사프란 잉크 Saffron Ink', '읽고 쓰는 공간 Reading', '문서의 구조 Structure', '생각의 연결 Connections', '작은 세부사항 Details', '가벼운 제목 Light heading'];
const rendered = titles.map((text, i) => `<h${i + 1} data-heading="${i + 1}">H${i + 1} ${text} ${expectedWeights[i]}</h${i + 1}>`).join('');
const editor = titles.map((text, i) => `<div class="cm-line HyperMD-header HyperMD-header-${i + 1}"><span class="cm-header cm-header-${i + 1}" data-heading="${i + 1}">${'#'.repeat(i + 1)} H${i + 1} ${text} ${expectedWeights[i]}</span></div>`).join('');
const body = `<p>한글과 English를 함께 읽습니다. <strong>굵게</strong>, <em>기울임</em>, <mark>강조</mark>, <a class="internal-link" href="#">문서 링크</a>, <code>inline code</code></p>
<blockquote><p>검은 잉크와 사프란 종이. 생각을 정리하는 녹색 인용문입니다.</p></blockquote>
<table><thead><tr><th>요소</th><th>색상</th></tr></thead><tbody><tr><td>종이 배경</td><td>#eddfb7</td></tr><tr><td>검은 본문</td><td>#000000</td></tr></tbody></table>
<ul><li>한글 목록과 English item</li><li class="task-list-item"><input type="checkbox" checked>완료한 작업</li></ul>
<div class="callout" data-callout="warning"><div class="callout-title"><div class="callout-title-inner">주의 Warning</div></div><div class="callout-content"><p>굵기를 지원하는 사용자 글꼴을 따릅니다.</p></div></div>
<pre><code class="language-javascript"><span class="token comment">// 한국어 주석</span>\n<span class="token keyword" data-token="keyword">const</span> theme = <span class="token string" data-token="string">"Saffron Ink"</span>;\n<span class="token function">greet</span>(theme);</code></pre>`;

const browser = await chromium.launch({ headless: true });
const report = { stylesheet: process.env.OBSIDIAN_APP_CSS ?? 'Installed Obsidian app.css', results: [] };
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 }, deviceScaleFactor: 1 });
  await page.route('https://saffron-ink.invalid/qa-fonts/*', async (route) => {
    const bytes = fontBuffers.get(new URL(route.request().url()).pathname.split('/').at(-1));
    if (!bytes) return route.abort();
    await route.fulfill({ body: bytes, contentType: 'font/ttf', headers: { 'Access-Control-Allow-Origin': '*' } });
  });
  for (const font of fontCases) {
    const family = font.family === 'sans-serif' ? 'sans-serif' : `"${font.family}"`;
    const html = `<!doctype html><html lang="ko"><head><meta charset="utf-8"><style>${font.faces.join('\n')}${vendor}\n${theme}</style>
<style>body{--font-text-override:${family};--font-interface-override:${family};margin:0;padding:32px;overflow:auto;height:auto;min-height:100vh;display:block;position:static} .qa-grid{display:grid;grid-template-columns:1fr 1fr;gap:32px}.qa-panel{padding:24px;border:1px solid var(--background-modifier-border);min-width:0}.qa-panel .markdown-preview-view{padding:0}.qa-label{margin-bottom:24px;color:var(--text-muted)}.qa-panel .cm-scroller{display:block;overflow:visible}.qa-panel .markdown-source-view.mod-cm6 .cm-content{white-space:pre-wrap;width:100%;padding:0;min-height:0}.qa-panel .markdown-source-view{height:auto}.qa-panel .markdown-source-view.mod-cm6 .cm-line{padding-bottom:12px;white-space:pre-wrap;overflow-wrap:anywhere} </style></head>
<body class="theme-light"><div class="qa-label">Saffron Ink · ${font.name} · Obsidian CSS rendering fixture</div><div class="workspace-leaf-content" data-type="file-explorer"><div class="nav-folder"><div class="nav-folder-title tree-item-self"><div class="nav-folder-title-content">폴더 Folder</div></div><div class="nav-folder-children"><div class="nav-file-title tree-item-self"><div class="nav-file-title-content">일반 파일 Normal file.md</div></div></div></div></div><div class="qa-grid">
<section class="qa-panel"><div class="qa-label">Reading mode</div><div class="markdown-preview-view markdown-rendered" data-mode="reading">${rendered}${body}</div></section>
<section class="qa-panel"><div class="qa-label">Live Preview and source heading styles</div><div class="markdown-source-view mod-cm6 is-live-preview" data-mode="editor"><div class="cm-editor cm-s-obsidian"><div class="cm-scroller"><div class="cm-content">${editor}<div class="cm-line">한글 본문과 English text, <span class="cm-inline-code">inline code</span></div><div class="cm-line HyperMD-codeblock"><span class="cm-keyword" data-token="keyword">const</span> theme = <span class="cm-string" data-token="string">"Saffron Ink"</span>;</div></div></div></div></div></section>
</div></body></html>`;
    await page.setContent(html);
    await page.evaluate(async () => {
      await Promise.all([...document.querySelectorAll('[data-heading]')].map((el) => {
        const css = getComputedStyle(el);
        return document.fonts.load(`${css.fontWeight} ${css.fontSize} ${css.fontFamily}`, el.textContent);
      }));
      await document.fonts.ready;
    });
    assert.ok(await page.locator('[data-mode="editor"] .cm-content').evaluate((el) => el.getBoundingClientRect().width > 400), 'Editor fixture content must have a realistic width');
    const tree = await page.evaluate(() => ({
      folder: getComputedStyle(document.querySelector('.nav-folder-title-content')).fontWeight,
      file: getComputedStyle(document.querySelector('.nav-file-title-content')).fontWeight,
    }));
    assert.equal(tree.folder, '600', `${font.name} folder weight`);
    assert.ok(Number(tree.folder) > Number(tree.file), `${font.name} folder must be bolder than normal file`);
    if (font.faces.length) {
      const faces = await page.evaluate((family) => [...document.fonts].filter((f) => f.family.includes(family)).map((f) => f.status), font.family);
      assert.equal(faces.length, font.faces.length, `${font.name} font face count`);
      assert.ok(faces.every((status) => status === 'loaded'), `${font.name} actual font files must be loaded`);
    }
    for (const mode of ['reading', 'live-preview', 'source']) {
      if (mode !== 'reading') {
        await page.evaluate((live) => document.querySelector('[data-mode="editor"]').classList.toggle('is-live-preview', live), mode === 'live-preview');
      }
      const selector = mode === 'reading' ? '[data-mode="reading"]' : '[data-mode="editor"]';
      const headings = await page.locator(`${selector} [data-heading]`).evaluateAll((nodes) => nodes.map((el) => {
        const css = getComputedStyle(el);
        return { weight: css.fontWeight, family: css.fontFamily, color: css.color, size: css.fontSize, variation: css.fontVariationSettings };
      }));
      assert.deepEqual(headings.map((h) => h.weight), expectedWeights, `${font.name} ${mode} heading weights`);
      assert.ok(headings.every((h) => h.family.includes(font.family)), `${font.name} ${mode} font inheritance`);
      assert.ok(headings.every((h) => h.color === 'rgb(0, 74, 159)'), `${font.name} ${mode} heading color`);
      assert.ok(headings.every((h) => h.variation === 'normal'), `${font.name} ${mode} unlocked font axes`);
      const tokens = await page.locator(`${selector} [data-token]`).evaluateAll((nodes) => nodes.map((el) => getComputedStyle(el).color));
      assert.deepEqual(tokens, ['rgb(183, 36, 52)', 'rgb(6, 38, 79)'], `${font.name} ${mode} code tokens`);
      report.results.push({ font: font.name, mode, headings, tree });
    }
    const surface = await page.evaluate(() => {
      const css = getComputedStyle(document.body);
      return { background: css.backgroundColor, color: css.color, callout: getComputedStyle(document.querySelector('.callout')).backgroundColor };
    });
    assert.equal(surface.background, 'rgb(237, 223, 183)');
    assert.equal(surface.color, 'rgb(0, 0, 0)');
    assert.notEqual(surface.callout, 'rgba(0, 0, 0, 0)', 'Callout must have a valid colored background');
    await page.evaluate(() => document.querySelector('[data-mode="editor"]').classList.add('is-live-preview'));
    await page.screenshot({ path: path.join(output, `${font.name.toLowerCase().replaceAll(' ', '-')}.png`), fullPage: true });
    // The light-only theme must leave the default dark palette intact.
    const darkTheme = await page.evaluate(() => {
      document.body.classList.replace('theme-light', 'theme-dark');
      return getComputedStyle(document.body).backgroundColor;
    });
    await page.setContent(`<style>${vendor}</style><body class="theme-dark"></body>`);
    assert.equal(darkTheme, await page.evaluate(() => getComputedStyle(document.body).backgroundColor), 'Dark fallback changed');
  }
  await writeFile(path.join(output, 'render-report.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(`Passed ${report.results.length} font/mode combinations; screenshots: ${output}`);
} finally {
  await browser.close();
}
