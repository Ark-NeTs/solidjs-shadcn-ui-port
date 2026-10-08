// Test SSR node reuse and live interaction in all installed engines with an isolated preview; D19/D90.
import { defineConfig } from '@playwright/test';
import base from './playwright.config';
const port = Number(process.env.THEME_PORT || 4403);
export default defineConfig({
  ...base,
  testMatch: ['hydration/**/*.spec.ts'],
  reporter: [['list'], ['json', { outputFile: process.env.RESULTS_FILE || 'test-results/hydration.json' }]],
  use: { ...base.use, baseURL: `http://127.0.0.1:${port}` },
  webServer: { command: `bun run build:hydration && bunx --no-install vite preview --config hydration.vite.config.ts --host 127.0.0.1 --port ${port} --strictPort`, url: `http://127.0.0.1:${port}`, reuseExistingServer: false, timeout: 60000 },
});
