// Reviewable Chromium baselines for light, dark and narrow component layouts; D19.
import { test, expect } from '../browser-fixture';
for(const mode of ['light','dark','mobile'])test(`${mode} component gallery`,async({page})=>{
  if(mode==='mobile')await page.setViewportSize({width:390,height:844});
  await page.goto(mode==='dark'?'/?dark':'/');await page.evaluate(()=>document.fonts.ready);
  await page.getByRole('button',{name:'Save changes',exact:true}).click();
  await page.getByRole('button',{name:'Show preview error'}).click();
  await page.getByRole('switch',{name:'Restricted preview setting'}).click();
  await expect(page.locator('[data-slot="skeleton"]')).toHaveCount(3);
  await expect(page).toHaveScreenshot(`${mode}.png`,{fullPage:true,animations:'disabled',maxDiffPixelRatio:0.001});
});
for(const mode of ['light','dark','mobile'])test(`${mode} open overlays`,async({page})=>{
 if(mode==='mobile')await page.setViewportSize({width:390,height:844});await page.goto(mode==='dark'?'/?dark':'/');await page.evaluate(()=>document.fonts.ready);await page.emulateMedia({reducedMotion:'reduce'});
 await page.getByRole('button',{name:'Workspace details',exact:true}).click();await expect(page.getByRole('dialog')).toBeVisible();await expect(page).toHaveScreenshot(`popover-${mode}.png`,{animations:'disabled',maxDiffPixelRatio:0.001});await page.keyboard.press('Escape');await page.getByRole('button',{name:'Remove preview',exact:true}).click();await expect(page.getByRole('alertdialog')).toBeVisible();await expect(page).toHaveScreenshot(`alert-${mode}.png`,{animations:'disabled',maxDiffPixelRatio:0.001});
});
for(const mode of ['light','dark','mobile'])test(`${mode} open combobox`,async({page})=>{
 if(mode==='mobile')await page.setViewportSize({width:390,height:844});await page.goto(mode==='dark'?'/?dark':'/');await page.evaluate(()=>document.fonts.ready);await page.emulateMedia({reducedMotion:'reduce'});await page.getByRole('combobox',{name:'Favorite fruit'}).press('ArrowDown');await expect(page.getByRole('listbox')).toBeVisible();await expect(page).toHaveScreenshot(`combobox-${mode}.png`,{animations:'disabled',maxDiffPixelRatio:0.001});
});
for (const mode of ['light', 'dark', 'mobile']) test(`${mode} compact cards and vertical separators`, async ({ page }) => {
  if (mode === 'mobile') await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`/?card-layout${mode === 'dark' ? '&dark' : ''}`);
  if (mode === 'mobile') await page.evaluate(() => { document.documentElement.style.fontSize = '24px'; });
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator('main')).toHaveScreenshot(`card-layout-${mode}.png`, { animations: 'disabled', maxDiffPixelRatio: 0.001 });
});
for(const mode of ['light','dark','mobile'])test(`${mode} accordion and collapsible`,async({page})=>{
 if(mode==='mobile')await page.setViewportSize({width:390,height:844});await page.goto(`/?disclosures${mode==='dark'?'&dark':''}`);await page.evaluate(()=>document.fonts.ready);await page.emulateMedia({reducedMotion:'reduce'});await expect(page.locator('main')).toHaveScreenshot(`disclosures-${mode}.png`,{animations:'disabled',maxDiffPixelRatio:0.001});
});
for(const mode of ['light','dark','mobile'])test(`${mode} tooltip and hover card`,async({page})=>{
 if(mode==='mobile')await page.setViewportSize({width:390,height:844});await page.goto(`/?hints&visual${mode==='dark'?'&dark':''}`);await page.evaluate(()=>document.fonts.ready);await page.emulateMedia({reducedMotion:'reduce'});await expect(page.locator('#save-hint')).toBeVisible();await expect(page.locator('#person-preview')).toBeVisible();await expect(page).toHaveScreenshot(`hints-${mode}.png`,{fullPage:true,animations:'disabled',maxDiffPixelRatio:0.001});
});
for(const mode of ['light','dark','mobile'])test(`${mode} radio and toggle choices`,async({page})=>{
 if(mode==='mobile')await page.setViewportSize({width:390,height:844});await page.goto(`/?choices${mode==='dark'?'&dark':''}`);await page.evaluate(()=>document.fonts.ready);await page.emulateMedia({reducedMotion:'reduce'});await expect(page.locator('main')).toHaveScreenshot(`choices-${mode}.png`,{animations:'disabled',maxDiffPixelRatio:0.001});
});

for(const mode of ['light','dark','mobile'])test(`${mode} Select choices`,async({page})=>{
 if(mode==='mobile')await page.setViewportSize({width:390,height:844});await page.goto(`/?select&visual${mode==='dark'?'&dark':''}`);await page.evaluate(()=>document.fonts.ready);await page.emulateMedia({reducedMotion:'reduce'});await expect(page.getByRole('listbox',{name:'Table fruit options'})).toBeVisible();await expect(page.locator('main')).toHaveScreenshot(`select-${mode}.png`,{animations:'disabled',maxDiffPixelRatio:0.001});
});

for(const mode of ['light','dark','mobile'])test(`${mode} Slider ranges`,async({page})=>{
 if(mode==='mobile')await page.setViewportSize({width:390,height:844});await page.goto(`/?slider${mode==='dark'?'&dark':''}`);await page.evaluate(()=>document.fonts.ready);await page.emulateMedia({reducedMotion:'reduce'});await expect(page.locator('main')).toHaveScreenshot(`slider-${mode}.png`,{animations:'disabled',maxDiffPixelRatio:0.001});
});
