// Real-browser acceptance matrix for the isolated D19 compatibility evaluation.
import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir:'./tests', timeout:15000, expect:{timeout:2500}, workers:1, retries:0,
  reporter:[['list'],['json',{outputFile:process.env.RESULTS_FILE || 'results.json'}]],
  use:{baseURL:process.env.HARNESS_URL || 'http://127.0.0.1:4399',viewport:{width:1000,height:900},timezoneId:'Europe/Istanbul',trace:'retain-on-failure',screenshot:'only-on-failure'},
  projects:[{name:'chromium',use:{browserName:'chromium'}},{name:'firefox',use:{browserName:'firefox'}}]
});
