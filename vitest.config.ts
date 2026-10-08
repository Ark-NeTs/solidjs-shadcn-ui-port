// Solid 2 browser-condition unit tests with strict diagnostic assertions; D19.
import { defineConfig } from 'vitest/config';
import solid from 'vite-plugin-solid';
export default defineConfig({
  plugins: [solid()], resolve: { conditions: ['development', 'browser'] },
  test: { environment: 'jsdom', include: ['tests/unit/**/*.test.{ts,tsx}'], setupFiles: ['./vitest.setup.ts'],
    coverage: { provider: 'v8', include: ['src/components/ui/*.tsx', 'src/lib/*.{ts,tsx}'], reporter: ['text', 'json-summary', 'html'], thresholds: { lines: 100, statements: 100, functions: 100, branches: 100 } } },
});
