// Exercise browser integration and built documentation using the same public exports; D19.
import { defineConfig } from '@playwright/test';
const production=process.env.THEME_PRODUCTION==='1';
const port=Number(process.env.THEME_PORT || 4399);
export default defineConfig({
  testDir: './tests', testMatch: ['integration/**/*.spec.ts','e2e/**/*.spec.ts'], workers: 1, retries: 0,
  reporter: [['list'], ['json', {outputFile: process.env.RESULTS_FILE || 'test-results/results.json'}]],
  use: { baseURL: `http://127.0.0.1:${port}`, viewport: {width: 1200,height: 900}, timezoneId: 'Europe/Istanbul', locale: 'en-US', trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  projects: [{name:'chromium',use:{browserName:'chromium'}},{name:'firefox',use:{browserName:'firefox'},testIgnore:'**/visual.spec.ts'}],
  webServer: { command: production ? `bun run build && THEME_BUILT=1 bun run build:playground && bunx --no-install vite preview --config playground/vite.config.ts --host 127.0.0.1 --port ${port} --strictPort` : 'bun run dev', url:`http://127.0.0.1:${port}`, reuseExistingServer:false, timeout:60000 },
});
