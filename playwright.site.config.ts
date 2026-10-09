// Exercise the deployable artifact through the provider's actual local static runtime; D19/D90.
import {resolve} from 'node:path';
import {defineConfig} from '@playwright/test';
import shared from './playwright.config';
const port=Number(process.env.THEME_PORT??4403);
const cli=process.env.WRANGLER_BIN??resolve(import.meta.dirname,'deployment/node_modules/wrangler/bin/wrangler.js');
export default defineConfig({...shared,testDir:'./tests/site',testMatch:'*.spec.ts',use:{...shared.use,baseURL:`http://127.0.0.1:${port}`},webServer:{command:`bun run build:site && node "${cli}" dev --local --ip 127.0.0.1 --port ${port}`,url:`http://127.0.0.1:${port}`,reuseExistingServer:false,timeout:120000,env:{WRANGLER_LOG_PATH:'.wrangler/site-tests.log',WRANGLER_SEND_METRICS:'false'}}});
