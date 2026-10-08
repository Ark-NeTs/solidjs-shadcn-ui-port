// Build the same public composition twice, then serve server HTML with its hydratable client; D19/D90.
import { build } from 'vite';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
const configFile = new URL('../hydration.vite.config.ts', import.meta.url).pathname;
await build({ configFile, build: { ssr: 'tests/hydration/server.tsx', outDir: 'hydration-dist/server', manifest: false, rolldownOptions: { input: 'tests/hydration/server.tsx', output: { entryFileNames: 'server.js' } } } });
await build({ configFile });
const { renderFixture, bootstrap, renderTabsProbe, probeModes } = await import('../hydration-dist/server/server.js');
// Keep server diagnostics fatal, including warnings that renderToString's error hook does not receive.
console.warn = (...messages) => { throw new Error(messages.join(' ')); };
console.error = (...messages) => { throw new Error(messages.join(' ')); };
const manifest = JSON.parse(await readFile(new URL('../hydration-dist/client/.vite/manifest.json', import.meta.url), 'utf8'));
const entry = manifest['tests/hydration/client.tsx'];
for (const initiallyOpen of [false, 'popover', 'alert']) {
  const directory = new URL(`../hydration-dist/client/${initiallyOpen ? `${initiallyOpen}/` : ''}`, import.meta.url);
  await mkdir(directory, { recursive: true });
  const styles = (entry.css ?? []).map(file => `<link rel="stylesheet" href="/${file}">`).join('');
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Hydration acceptance</title>${styles}${bootstrap}</head><body><button id="hydrate">Hydrate components</button><button id="dispose" disabled>Dispose components</button><div id="hydration-root" data-open="${initiallyOpen}">${renderFixture(initiallyOpen)}</div><script type="module" src="/${entry.file}"></script></body></html>`;
  await writeFile(new URL('index.html', directory), html);
}

for (const mode of probeModes) {
  const directory = new URL(`../hydration-dist/client/tabs-${mode}/`, import.meta.url);
  await mkdir(directory, { recursive: true });
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Minimal Tabs ${mode}</title>${bootstrap}</head><body><button id="hydrate">Hydrate components</button><button id="dispose" disabled>Dispose components</button><div id="hydration-root" data-probe="${mode}">${renderTabsProbe(mode)}</div><script type="module" src="/${entry.file}"></script></body></html>`;
  await writeFile(new URL('index.html', directory), html);
}
