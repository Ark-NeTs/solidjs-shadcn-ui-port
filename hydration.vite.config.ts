// Build matched server/client transforms for hydration acceptance, separate from the CSR gallery; D19/D90.
import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import solid from 'vite-plugin-solid';
import tailwind from '@tailwindcss/vite';
export default defineConfig({
  plugins: [solid({ ssr: true }), tailwind()],
  resolve: { conditions: ['solid', 'development', 'browser'], dedupe: ['solid-js', '@solidjs/web', '@solidjs/signals'] },
  ssr: { noExternal: ['shadcn-solidjs-theme'], resolve: { conditions: ['solid', 'development', 'node'] } },
  build: {
    outDir: 'hydration-dist/client', manifest: true, minify: false,
    rolldownOptions: { input: resolve(import.meta.dirname, 'tests/hydration/client.tsx'), output: { entryFileNames: 'client.js' } },
  },
});
