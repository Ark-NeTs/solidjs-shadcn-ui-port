// Real inline previews, owner reset and shared theme acceptance; D19/D90.
import AxeBuilder from '@axe-core/playwright';
import type {Route} from '@playwright/test';
import {test,expect} from './browser-fixture';
import groups from '../playground/docs-groups.json' with {type:'json'};
/** Run the same interactions against source and built documentation. */
export function registerDocsPreviewTests(){
 // Batches share one browser context to avoid per-test setup; each step reloads the page and attributes diagnostics to its family.
 const families=groups.flatMap(group=>group.families);const size=13;
 for(let start=0;start<families.length;start+=size){const batch=families.slice(start,start+size);test(`inline previews mount without diagnostics: ${batch[0]} to ${batch.at(-1)}`,async({page,diagnostics})=>{
  test.setTimeout(90000);
  for(const id of batch)await test.step(id,async()=>{await page.goto(`/docs.html?component=${id}`);await expect(page.locator(`[data-live-component="${id}"]`)).toBeVisible();await expect(page.locator(`[data-live-component="${id}"] [data-slot]`).first()).toBeVisible();await expect(page.getByRole('button',{name:'Reset preview',exact:true})).toBeEnabled();expect(diagnostics,`${id} preview diagnostics`).toEqual([]);});
 });}
 test('button state survives theme changes and reset creates a fresh example',async({page})=>{
  await page.goto('/docs.html?component=button');const preview=page.getByRole('region',{name:'Button live preview'});await preview.getByRole('button',{name:'Click me',exact:true}).click();await expect(preview.getByRole('status')).toHaveText('Clicked 1 times');await page.getByRole('button',{name:'Dark mode',exact:true}).click();await page.getByLabel('Palette',{exact:true}).selectOption('forest');await expect(preview.getByRole('status')).toHaveText('Clicked 1 times');await expect.poll(()=>preview.getByRole('button',{name:'Click me',exact:true}).evaluate(node=>getComputedStyle(node).getPropertyValue('--primary').trim())).toBe('oklch(0.46 0.15 155)');await preview.getByRole('button',{name:'Reset preview',exact:true}).click();await expect(preview.getByRole('status')).toHaveText('Clicked 0 times');await expect(page).toHaveURL(/component=button/);
 });
 test('inline form controls and Tabs accept real input and keyboard selection',async({page})=>{
  await page.goto('/docs.html?component=input');await page.getByLabel('Email address',{exact:true}).fill('alex@example.com');await page.getByRole('button',{name:'Dark mode',exact:true}).click();await expect(page.getByLabel('Email address',{exact:true})).toHaveValue('alex@example.com');await page.getByRole('button',{name:'Reset preview',exact:true}).click();await expect(page.getByLabel('Email address',{exact:true})).toHaveValue('');
  await page.goto('/docs.html?component=checkbox');await page.getByLabel('Accept the terms',{exact:true}).check();await expect(page.getByLabel('Accept the terms',{exact:true})).toBeChecked();
  await page.goto('/docs.html?component=tabs');await page.getByRole('tab',{name:'Account',exact:true}).focus();await page.keyboard.press('ArrowRight');await expect(page.getByRole('tab',{name:'Password',exact:true})).toHaveAttribute('aria-selected','true');await page.getByLabel('New password',{exact:true}).fill('example draft');await expect(page.getByLabel('New password',{exact:true})).toHaveValue('example draft');
 });
 test('inline overlays open, dismiss, restore focus and reopen',async({page})=>{
  await page.goto('/docs.html?component=dialog');const trigger=page.getByRole('button',{name:'Edit profile',exact:true});await trigger.click();await expect(page.getByRole('dialog',{name:'Edit your profile'})).toBeVisible();await page.getByLabel('Display name',{exact:true}).fill('Morgan');await page.keyboard.press('Escape');await expect(trigger).toBeFocused();await trigger.click();await expect(page.getByRole('dialog',{name:'Edit your profile'})).toBeVisible();await page.getByRole('button',{name:'Done',exact:true}).click();await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.goto('/docs.html?component=popover');await page.getByRole('button',{name:'Edit dimensions',exact:true}).click();await expect(page.getByLabel('Width',{exact:true})).toBeVisible();await page.keyboard.press('Escape');await expect(page.getByRole('button',{name:'Edit dimensions',exact:true})).toBeFocused();
 });
 test('inline Select, command and Data Table change their real state',async({page})=>{
  await page.goto('/docs.html?component=select');await page.getByRole('combobox',{name:'Fruit',exact:true}).click();await page.getByRole('option',{name:'Cherry',exact:true}).click();await expect(page.getByRole('combobox',{name:'Fruit',exact:true})).toContainText('Cherry');
  await page.goto('/docs.html?component=command');await page.getByRole('combobox',{name:'Search commands',exact:true}).fill('settings');await page.getByRole('option',{name:'Open settings',exact:true}).click();await expect(page.locator('[data-live-component=command]').getByRole('status')).toHaveText('Open settings');
  await page.goto('/docs.html?component=data-table');await expect(page.getByRole('table')).toBeVisible();await page.getByRole('button',{name:'Clear records',exact:true}).click();await expect(page.getByRole('table')).toContainText('No results');await page.getByRole('button',{name:'Reset preview',exact:true}).click();await expect(page.getByRole('table')).toContainText('Customer 01');
 });
 test('inline notifications dispose their state when the preview resets',async({page})=>{
  await page.goto('/docs.html?component=sonner');await page.getByRole('button',{name:'Show success',exact:true}).click();await expect(page.locator('[data-slot=toast-title]')).toContainText('Project saved');await page.getByRole('button',{name:'Reset preview',exact:true}).click();await expect(page.locator('[data-slot=toast]')).toHaveCount(0);await page.getByRole('button',{name:'Show success',exact:true}).click();await expect(page.locator('[data-slot=toast]')).toHaveCount(1);
 });
 test('shows loading and recovers an unavailable preview module through explicit reload',async({page})=>{
  let held:Route|undefined;let attempts=0;
  await page.route('**/component-previews*',route=>{if(route.request().resourceType()!=='script')return route.continue();attempts++;if(attempts===1){held=route;return;}return route.continue();});
  await page.goto('/docs.html?component=button',{waitUntil:'domcontentloaded'});
  // A held dynamic module can delay Firefox's load event: inspect DOM state, not layout.
  await expect(page.locator('.docs-live-body [role=status]')).toHaveText('Loading live preview…');
  await expect(page.locator('.docs-live-header button')).toHaveAttribute('disabled','');
  await expect.poll(()=>!!held).toBe(true);
  const original=await held!.fetch();const body=await original.text();
  await held!.fulfill({response:original,headers:{'content-type':'text/javascript','cache-control':'no-store'},body:`if (!sessionStorage.getItem('preview-test-failed')) { sessionStorage.setItem('preview-test-failed', '1'); throw new Error('Transient preview initialization failure'); }\n${body}`});
  await page.waitForLoadState('load');
  await expect(page.getByRole('alert')).toContainText('The preview could not load');
  await expect(page.locator('.docs-prose pre').first()).toBeVisible();
  await Promise.all([page.waitForEvent('load'),page.getByRole('button',{name:'Reload page',exact:true}).click({noWaitAfter:true})]);
  await expect(page.locator('[data-live-component=button]')).toBeVisible();await expect(page.getByRole('alert')).toHaveCount(0);
 });
 for(const id of ['button','calendar','data-table','questionnaire','sidebar','tabs','chart','input-otp','carousel'])test(`inline ${id} supports dark mobile and enlarged text`,async({page})=>{
  await page.setViewportSize({width:390,height:844});await page.goto(`/docs.html?component=${id}&dark`);const preview=page.locator(`[data-live-component="${id}"]`);await expect(preview).toBeVisible();await page.evaluate(()=>document.documentElement.style.fontSize='24px');await page.emulateMedia({reducedMotion:'reduce'});expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);expect((await new AxeBuilder({page}).include('#live-preview').analyze()).violations).toEqual([]);
 });

}
