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
