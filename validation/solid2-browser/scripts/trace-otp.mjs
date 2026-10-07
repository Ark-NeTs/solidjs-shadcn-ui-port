// Capture OTP warning call sites and native form wiring for the D19 evaluation.
import { chromium } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
const browser = await chromium.launch();
const page = await browser.newPage();
const errors = [];
page.on('pageerror', error => errors.push(error.stack));
await page.addInitScript(() => {
  Error.stackTraceLimit = 40;
  window.__otpWarnings = [];
  const warn = console.warn.bind(console);
  console.warn = (...args) => {
    window.__otpWarnings.push({message:args.map(String).join(' '),stack:new Error().stack});
    warn(...args);
  };
});
/** Record actual input and label DOM contracts after a browser paint. */
async function snapshot() {
  await page.evaluate(() => new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  return page.evaluate(() => {
    const input=document.querySelector('[data-kb-otp-field-input]');
    const label=document.querySelector('label');
    return {id:input.id,name:input.name,value:input.value,labelFor:label.htmlFor,labelControl:label.control?.id,formData:[...new FormData(input.form)],labelledby:input.getAttribute('aria-labelledby'),describedby:input.getAttribute('aria-describedby'),warnings:window.__otpWarnings.splice(0)};
  });
}
try {
  await page.goto(`${process.env.HARNESS_URL || 'http://127.0.0.1:4399'}/?case=otp`);
  await page.locator('[data-kb-otp-field-input]').waitFor();
  const mount = await snapshot();
  await page.locator('[data-kb-otp-field-input]').fill('123456');
  const typing = await snapshot();
  await page.getByRole('button',{name:'Set external value'}).click();
  const external = await snapshot();
  await page.evaluate(()=>{window.otpControl.setShowText(true);window.otpControl.setInvalid(true);window.otpControl.setRootId('renamed-otp')});
  const renamed = await snapshot();
  await page.getByRole('button',{name:'Reset code'}).click();
  const reset = await snapshot();
  await page.evaluate(()=>window.harness.unmount());
  await writeFile(process.env.TRACE_FILE || 'otp-trace.json',JSON.stringify({mount,typing,external,renamed,reset,errors},null,2)+'\n');
  console.log(JSON.stringify({codes:[...new Set([mount,typing,external,renamed,reset].flatMap(phase=>phase.warnings.flatMap(row=>[...row.message.matchAll(/\[([A-Z_]+)\]/g)].map(match=>match[1]))))],errors}));
} finally { await browser.close(); }
