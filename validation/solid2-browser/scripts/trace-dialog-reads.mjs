// Record strict-read call sites and live ID behavior for the D19 Dialog evaluation.
import { chromium } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
const browser = await chromium.launch();
const page = await browser.newPage();
const errors = [];
page.on('pageerror', error => errors.push(error.message));
await page.addInitScript(() => {
  Error.stackTraceLimit = 40;
  window.__readWarnings = [];
  const warn = console.warn.bind(console);
  console.warn = (...args) => {
    window.__readWarnings.push({message:args.map(String).join(' '),stack:new Error().stack});
    warn(...args);
  };
});
/** Record both DOM IDs and the ARIA references that depend on them. */
async function snapshot() {
  return page.evaluate(() => {
    const content=document.querySelector('[data-testid="plain-dialog"]');
    const title=document.querySelector('[data-testid="plain-title"]');
    const description=document.querySelector('[data-testid="plain-description"]');
    return {content:content?.id,title:title?.id,description:description?.id,labelledby:content?.getAttribute('aria-labelledby'),describedby:content?.getAttribute('aria-describedby'),controls:document.querySelector('[aria-haspopup="dialog"]')?.getAttribute('aria-controls')};
  });
}
try {
  await page.goto(`${process.env.HARNESS_URL || 'http://127.0.0.1:4399'}/?case=dialog`);
  await page.getByRole('button',{name:'Open plain dialog'}).click();
  await page.getByRole('textbox',{name:'Plain input'}).waitFor();
  const before = await snapshot();
  await page.evaluate(() => window.dialogControl.setRootId('renamed-dialog'));
  await page.evaluate(() => new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  const after = await snapshot();
  const warnings = await page.evaluate(() => window.__readWarnings);
  await writeFile(process.env.TRACE_FILE || 'dialog-reads-trace.json',JSON.stringify({before,after,warnings,errors},null,2)+'\n');
  console.log(JSON.stringify({before,after,codes:[...new Set(warnings.flatMap(row=>[...row.message.matchAll(/\[([A-Z_]+)\]/g)].map(match=>match[1])))],errors},null,2));
} finally { await browser.close(); }
