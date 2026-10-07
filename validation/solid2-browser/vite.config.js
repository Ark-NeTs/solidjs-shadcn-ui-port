// Isolated Solid 2 compatibility tooling; supports the D19 encapsulation evaluation.
import { defineConfig } from 'vite';
import solid from 'vite-plugin-solid';
import { resolve } from 'node:path';
export default defineConfig({
  plugins: [solid()],
  resolve: process.env.KOBALTE_DISTRIBUTION === 'js' ? { alias: [{find:/^@kobalte\/core\/([^/]+)$/,replacement:resolve(import.meta.dirname,'node_modules/@kobalte/core/dist/$1/index.js')}] } : {},
  server: { port: 4399, strictPort: true, watch: { ignored: ['**/*test-results/**', '**/*results.json'] } }
});
