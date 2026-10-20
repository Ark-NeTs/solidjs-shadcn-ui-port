// Standalone consumer compatibility; main package has no router/query dependency; D19/D90.
import {defineConfig} from '@playwright/test';
import shared from './playwright.config';
const port=Number(process.env.THEME_PORT??4403);
export default defineConfig({...shared,testDir:'./validation/consumer-stack',testMatch:['consumer.spec.ts','workflow.spec.ts'],use:{...shared.use,baseURL:`http://127.0.0.1:${port}`},webServer:{command:`${process.env.CONSUMER_BUILT==='1'?'bun run build && ':''}bunx --no-install vite --config validation/consumer-stack/vite.config.mjs`,url:`http://127.0.0.1:${port}`,reuseExistingServer:false,timeout:60000}});
