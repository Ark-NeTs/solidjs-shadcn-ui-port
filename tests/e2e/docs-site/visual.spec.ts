// Reviewable documentation layouts and semantic theme overrides; D19/D90.
import {test,expect} from '../../browser-fixture';
for(const mode of ['light','dark','mobile'])test(`${mode} searchable documentation`,async({page})=>{
 if(mode==='mobile')await page.setViewportSize({width:390,height:844});await page.goto(`/docs.html${mode==='dark'?'?dark':''}`);await expect(page.getByRole('heading',{name:'Build with Solid UI',level:1,exact:true})).toBeVisible();await page.evaluate(()=>document.fonts.ready);await page.emulateMedia({reducedMotion:'reduce'});await expect(page).toHaveScreenshot(`docs-${mode}.png`,{animations:'disabled',maxDiffPixelRatio:0.001});
});
test('custom theme controls and component documentation',async({page})=>{
 await page.goto('/docs.html?component=button');await expect(page.getByRole('heading',{name:'Button',level:1,exact:true})).toBeVisible();await expect(page.locator('[data-live-component=button]')).toBeVisible();await page.getByLabel('Palette',{exact:true}).selectOption('forest');await page.getByLabel('Corners',{exact:true}).selectOption('0.8');await page.evaluate(()=>document.fonts.ready);await page.emulateMedia({reducedMotion:'reduce'});await expect(page).toHaveScreenshot('docs-custom.png',{animations:'disabled',maxDiffPixelRatio:0.001});
});

for(const id of ['tabs','data-table','dialog'])test(`inline ${id} preview layout`,async({page})=>{
 await page.goto(`/docs.html?component=${id}&dark`);await expect(page.locator(`[data-live-component="${id}"]`)).toBeVisible();await page.evaluate(()=>document.fonts.ready);await page.emulateMedia({reducedMotion:'reduce'});await expect(page.locator('#live-preview')).toHaveScreenshot(`docs-live-${id}.png`,{animations:'disabled',maxDiffPixelRatio:0.001});
});

for(const mode of ['light','dark','mobile'])test(`theme generator ${mode} workspace`,async({page})=>{
 if(mode==='mobile')await page.setViewportSize({width:390,height:844});await page.goto(`/docs.html?create&accent=Violet&chart=Violet${mode==='dark'?'&dark':''}`);await expect(page.locator('[data-preview-card=contributions]')).toBeVisible();await page.evaluate(()=>document.fonts.ready);await expect(page).toHaveScreenshot(`theme-generator-${mode}.png`,{animations:'disabled',maxDiffPixelRatio:0.001});
});
test('theme only export dialog',async({page})=>{await page.goto('/docs.html?create&dark');await page.getByRole('button',{name:'Get Code',exact:true}).first().click();await expect(page.getByRole('dialog',{name:'Theme Tokens'})).toBeVisible();await page.evaluate(()=>document.fonts.ready);await expect(page).toHaveScreenshot('theme-generator-export.png',{animations:'disabled',maxDiffPixelRatio:0.001});});

test('full reference ordered theme canvas',async({page})=>{await page.setViewportSize({width:3400,height:2800});await page.goto('/docs.html?create');await expect(page.locator('[data-preview-card=notifications]')).toBeAttached();await page.evaluate(()=>document.fonts.ready);await expect(page.locator('.theme-canvas')).toHaveScreenshot('theme-generator-full-canvas.png',{animations:'disabled',maxDiffPixelRatio:0.001});});
