// solid-ui (and `solidui-cli add`) generate components importing via the `~/`
// alias. Consumers resolve this package's source directly (exports "./*",
// "./utils"), where no alias exists, so rewrite those specifiers to relative
// paths after each fetch/add. Mirrors the React theme's normalize-imports (D19,
// D49). Test files are skipped — they import from relative paths already.
import { Glob } from 'bun';

const dir = new URL('../src/components/ui/', import.meta.url).pathname;
let changed = 0;

for await (const name of new Glob('*.tsx').scan(dir)) {
  if (name.endsWith('.test.tsx')) continue;
  const path = dir + name;
  const src = await Bun.file(path).text();
  const out = src
    // solid-ui's registry source refers to sibling components as
    // `~/registry/ui/<name>`; our vendored copies are siblings in this folder.
    .replaceAll('"~/registry/ui/', '"./')
    .replaceAll('"~/components/ui/', '"./')
    .replaceAll('"~/lib/', '"../../lib/')
    .replaceAll('"~/hooks/', '"../../hooks/')
    .replaceAll("'~/registry/ui/", "'./")
    .replaceAll("'~/components/ui/", "'./")
    .replaceAll("'~/lib/", "'../../lib/")
    .replaceAll("'~/hooks/", "'../../hooks/");
  if (out !== src) {
    await Bun.write(path, out);
    changed++;
  }
}

console.log(changed ? `normalized ${changed} file(s)` : 'nothing to normalize');
