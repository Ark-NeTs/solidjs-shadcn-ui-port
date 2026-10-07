// Standalone documentation playground; no application services or secrets (D19).
import { defineConfig } from 'vite';
import { realpathSync } from 'node:fs';
import { resolve } from 'node:path';
import solid from 'vite-plugin-solid';
import tailwind from '@tailwindcss/vite';
export default defineConfig({
  root: import.meta.dirname, plugins: [solid(), tailwind()],
  resolve: { alias: process.env.THEME_BUILT === '1' ? [{find:/^shadcn-solidjs-theme\/ui\/[^/]+$/, replacement:resolve(import.meta.dirname, '../dist/shadcn-solidjs-theme.js')}] : [], dedupe: ['solid-js', '@solidjs/web', '@solidjs/signals'] },
  server: { host: '127.0.0.1', port: Number(process.env.THEME_PORT || 4399), strictPort: true, fs: { allow: [resolve(import.meta.dirname, '..'), realpathSync(resolve(import.meta.dirname, '../node_modules'))] } },
  build: { outDir: '../playground-dist', emptyOutDir: true },
});
