// Capture helper/Dialog/Drawer diagnostics independently for the D19 compatibility decision.
import { chromium } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
const browser = await chromium.launch();
const evidence = [];
try {
  for (const name of ['presence', 'dialog', 'drawer']) {
    const page = await browser.newPage();
    let phase = 'mount';
    const messages = [];
    page.on('console', message => {
      if (['warning','error'].includes(message.type())) messages.push({phase,type:message.type(),message:message.text()});
    });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`${process.env.HARNESS_URL || 'http://127.0.0.1:4399'}/?case=${name}`);
    await page.waitForTimeout(200);
    for (let cycle = 0; cycle < 2; cycle++) {
      phase = `open-${cycle}`;
      const trigger = {presence:'Toggle presence',dialog:'Open plain dialog',drawer:'Open drawer'}[name];
      await page.getByRole('button',{name:trigger,exact:true}).click();
      await page.waitForTimeout(300);
      phase = `close-${cycle}`;
      if (name === 'presence') await page.getByRole('button',{name:trigger,exact:true}).click();
      else await page.keyboard.press('Escape');
      await page.waitForTimeout(300);
    }
    phase = 'unmount';
    await page.evaluate(() => window.harness.unmount());
    await page.waitForTimeout(100);
    evidence.push({fixture:name,codes:[...new Set(messages.flatMap(row => [...row.message.matchAll(/\[([A-Z_]+)\]/g)].map(match=>match[1])))],messages,errors});
    await page.close();
  }
} finally { await browser.close(); }
await writeFile(process.env.TRACE_FILE || 'presence-trace.json', JSON.stringify(evidence,null,2)+'\n');
console.log(JSON.stringify(evidence.map(({fixture,codes,errors})=>({fixture,codes,errors})),null,2));
