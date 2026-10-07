// Server-render the same component source without browser globals; D19.
import { defineConfig } from 'vitest/config';
import solid from 'vite-plugin-solid';
export default defineConfig({ plugins: [solid({ ssr: true })], test: { environment: 'node', include: ['tests/server.test.tsx'] } });
