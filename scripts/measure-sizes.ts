// Reports the bundle size (minified + gzipped) of each component and of the
// compiled theme CSS. Sizes come from a real Vite build so Solid's JSX transform
// is applied honestly (Bun's bundler would compile JSX as React and misreport);
// npm deps (solid-js, Kobalte, corvu, cva, …) are externalized exactly as the
// library build externalizes them, so each number is that component's *own* code
// — the marginal cost of `import … from 'shadcn-solidjs-theme/<name>'` — not the
// shared runtime. Run: `bun run sizes`.
import { isAbsolute } from 'node:path';
import { Glob } from 'bun';
import { build } from 'vite';
import solid from 'vite-plugin-solid';
import tailwindcss from '@tailwindcss/vite';

const uiDir = new URL('../src/components/ui/', import.meta.url).pathname;
const srcDir = new URL('../src', import.meta.url).pathname;
const indexEntry = new URL('../src/index.ts', import.meta.url).pathname;

/** Externalize every bare specifier (matches vite.config's rollup rule). */
const external = (id: string) =>
  !id.startsWith('.') && !id.startsWith('~') && !isAbsolute(id);

const rawBytes = (s: string) => new TextEncoder().encode(s).length;
const gzipBytes = (s: string) => Bun.gzipSync(new TextEncoder().encode(s)).length;

/** Build one entry in-memory and return its total JS and CSS text. */
async function bundle(entry: string): Promise<{ js: string; css: string }> {
  const result = await build({
    configFile: false,
    logLevel: 'silent',
    resolve: { alias: { '~': srcDir } },
    plugins: [solid(), tailwindcss()],
    build: {
      write: false,
      minify: true,
      cssMinify: true,
      reportCompressedSize: false,
      lib: { entry, formats: ['es'], fileName: () => 'out.js' },
      rollupOptions: { external },
    },
  });
  const bundles = Array.isArray(result) ? result : [result as never];
  let js = '';
  let css = '';
  for (const b of bundles) {
    for (const out of (b as { output: unknown[] }).output as Array<Record<string, unknown>>) {
      if (out.type === 'chunk') js += out.code as string;
      else if (typeof out.fileName === 'string' && out.fileName.endsWith('.css')) {
        css += typeof out.source === 'string' ? out.source : Buffer.from(out.source as Uint8Array).toString();
      }
    }
  }
  return { js, css };
}

const fmt = (n: number) => (n < 1024 ? `${n} B` : `${(n / 1024).toFixed(2)} kB`);

// Collect component entries (skip tests).
const names: string[] = [];
for await (const f of new Glob('*.tsx').scan(uiDir)) {
  if (!f.endsWith('.test.tsx')) names.push(f.replace('.tsx', ''));
}
names.sort();

console.log(`Measuring ${names.length} components + theme (Vite build, deps externalized)…\n`);

const rows: Array<{ name: string; min: number; gz: number }> = [];
for (const name of names) {
  const { js } = await bundle(uiDir + name + '.tsx');
  rows.push({ name, min: rawBytes(js), gz: gzipBytes(js) });
}

// The barrel build gives the combined JS (helpers deduped) and the theme CSS.
const barrel = await bundle(indexEntry);
const themeMin = rawBytes(barrel.css);
const themeGz = gzipBytes(barrel.css);
const bundledMin = rawBytes(barrel.js);
const bundledGz = gzipBytes(barrel.js);
// The library build inlines fonts (@fontsource Inter) as base64 data: URIs, which
// dominate the file; a consuming app's (non-lib) build emits them as separate
// cached font files instead. Split them out so "utilities" reflects real CSS.
const fontData = [...barrel.css.matchAll(/url\(data:[^)]*\)/g)].map((m) => m[0]).join('');
const utilCss = barrel.css.replace(/url\(data:[^)]*\)/g, 'url()');
const fontMin = rawBytes(fontData);
const fontGz = gzipBytes(fontData);
const utilMin = rawBytes(utilCss);
const utilGz = gzipBytes(utilCss);

rows.sort((a, b) => b.gz - a.gz);
const sumMin = rows.reduce((n, r) => n + r.min, 0);
const sumGz = rows.reduce((n, r) => n + r.gz, 0);

const nameW = Math.max(20, ...rows.map((r) => r.name.length));
const line = '─'.repeat(nameW + 24);
const row = (a: string, b: string, c: string) =>
  `${a.padEnd(nameW)}  ${b.padStart(10)}  ${c.padStart(10)}`;

console.log(row('Component', 'Minified', 'Gzipped'));
console.log(line);
for (const r of rows) console.log(row(r.name, fmt(r.min), fmt(r.gz)));
console.log(line);
console.log(row(`${rows.length} components (sum)`, fmt(sumMin), fmt(sumGz)));
console.log(row('index (bundled)', fmt(bundledMin), fmt(bundledGz)));
console.log(line);
console.log(row('theme.css (styles)', fmt(themeMin), fmt(themeGz)));
console.log(row('  ├ utilities', fmt(utilMin), fmt(utilGz)));
console.log(row('  └ inlined fonts', fmt(fontMin), fmt(fontGz)));
console.log(
  '\nNotes: unused Tailwind utilities are tree-shaken — theme.css only carries',
);
console.log(
  '       classes @source finds in the components. The bulk of theme.css is the',
);
console.log(
  '       Inter font inlined as base64 by the *library* build; a consuming app',
);
console.log(
  '       build emits those as separate cached files, so its CSS ≈ the utilities',
);
console.log(
  '       row. Per-component sizes exclude externalized deps (solid-js/Kobalte/',
);
console.log('       corvu); "index (bundled)" is all 26 in one chunk, helpers deduped.');
