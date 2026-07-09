// Vendors the solid-ui component set into src/components/ui/ byte-perfect (D49).
// Each https://www.solid-ui.com/registry/ui/<name>.json carries the full .tsx
// source in files[].content, so we mirror upstream exactly rather than hand-copy;
// scripts/normalize-imports.ts then rewrites the `~/` alias to relative paths.
// Re-run (`bun run fetch-registry`) to pull upstream updates, then normalize +
// re-review. The list below is the primitive scope agreed for the app design.
import { Glob } from 'bun';

const BASE = 'https://www.solid-ui.com/registry/ui';

/** solid-ui component names to vendor (the app design's core primitives). */
const COMPONENTS = [
  'button', 'badge', 'card', 'separator', 'label', 'text-field', 'checkbox',
  'switch', 'select', 'tabs', 'dialog', 'alert-dialog', 'sheet', 'drawer',
  'dropdown-menu', 'popover', 'tooltip', 'alert', 'skeleton', 'accordion',
  'collapsible', 'table', 'toggle', 'toggle-group', 'number-field', 'sonner',
];

const outDir = new URL('../src/components/ui/', import.meta.url).pathname;
let written = 0;

for (const name of COMPONENTS) {
  const res = await fetch(`${BASE}/${name}.json`);
  if (!res.ok) {
    console.error(`✗ ${name}: HTTP ${res.status}`);
    process.exit(1);
  }
  const entry = (await res.json()) as {
    files?: Array<{ name?: string; path?: string; content?: string }>;
  };
  const files = entry.files ?? [];
  if (files.length === 0) {
    console.error(`✗ ${name}: registry entry has no files`);
    process.exit(1);
  }
  for (const file of files) {
    if (file.content == null) {
      console.error(`✗ ${name}: file entry missing content`);
      process.exit(1);
    }
    const base = (file.name ?? file.path ?? `${name}.tsx`).split('/').pop()!;
    await Bun.write(outDir + base, file.content);
    written++;
    console.log(`✓ ${base} (${file.content.length} bytes)`);
  }
}

// Guard against silent scope drift: every vendored file must be one we requested.
const requested = new Set(COMPONENTS.map((n) => `${n}.tsx`));
for await (const found of new Glob('*.tsx').scan(outDir)) {
  if (found.endsWith('.test.tsx')) continue;
  if (!requested.has(found)) console.warn(`! stray file not in COMPONENTS: ${found}`);
}

console.log(`\nwrote ${written} component file(s) to src/components/ui/`);
