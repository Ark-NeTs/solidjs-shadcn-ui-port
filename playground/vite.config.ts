import { fileURLToPath } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import solid from 'vite-plugin-solid';
import { defineConfig } from 'vite';

// Dev-only visual playground server for shadcn-solidjs-theme. Not part of the
// library build (src/index.ts) or the published `files`; it exists to eyeball
// the theme in a browser. Launch via the "solidjs-theme" config.
export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  plugins: [solid(), tailwindcss()],
  server: { port: 4399, strictPort: true },
});
