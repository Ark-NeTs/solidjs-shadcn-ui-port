// Real-browser toggle semantics, controlled rejection, focus, sizes and RTL; D19.
import { test, expect } from '../browser-fixture';
import AxeBuilder from '@axe-core/playwright';
test.beforeEach(async({page})=>{await page.goto('/');});
test('labels and Space update checkboxes, mixed selections and switches once',async({page})=>{
  const weekly=page.getByRole('checkbox',{name:'Weekly summary'});await page.locator('label[for="weekly"]').click();await expect(weekly).not.toBeChecked();await weekly.focus();await page.keyboard.press('Tab');await page.keyboard.press('Shift+Tab');await expect(weekly).toBeFocused();await page.keyboard.press('Space');await expect(weekly).toBeChecked();expect(await weekly.evaluate(el=>getComputedStyle(el).boxShadow)).not.toBe('none');
  const mixed=page.getByRole('checkbox',{name:'Select all categories'});await expect(mixed).toBeChecked({indeterminate:true});await mixed.focus();await page.keyboard.press('Space');await expect(mixed).toBeChecked();await expect(mixed).toHaveAttribute('aria-checked','true');await page.getByRole('button',{name:'Restore mixed selection'}).click();await expect(mixed).toBeChecked({indeterminate:true});
  const toggle=page.getByRole('switch',{name:'Live updates'});await toggle.focus();await page.keyboard.press('Tab');await page.keyboard.press('Shift+Tab');await expect(toggle).toBeFocused();await page.keyboard.press('Space');await expect(toggle).not.toBeChecked();expect(await toggle.evaluate(el=>getComputedStyle(el).boxShadow)).not.toBe('none');await page.locator('label[for="enabled"]').click();await expect(toggle).toBeChecked();
});
test('disabled/read-only and rejected controlled changes preserve the displayed value',async({page})=>{
  const live=page.getByRole('switch',{name:'Live updates'});await page.getByRole('button',{name:'Lock live updates'}).click();await expect(live).toBeDisabled();const label=page.locator('label[for="enabled"]');await label.scrollIntoViewIfNeeded();const box=await label.boundingBox();await page.mouse.click(box!.x+box!.width/2,box!.y+box!.height/2);await expect(live).toBeChecked();await page.getByRole('button',{name:'Unlock live updates'}).click();await expect(live).toBeEnabled();
  const readonly=page.getByRole('switch',{name:'Audit notifications (read only)'});await readonly.focus();await page.keyboard.press('Space');await expect(readonly).toBeChecked();
  const restricted=page.getByRole('switch',{name:'Restricted preview setting'});await restricted.click();await expect(restricted).not.toBeChecked();await expect(restricted).toHaveAccessibleDescription(/previous setting is preserved/);await page.getByRole('button',{name:'Dismiss setting error'}).click();await expect(restricted).toHaveAttribute('aria-invalid','false');
});
test('both switch sizes move the thumb correctly in LTR and RTL and respect reduced motion',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  for(const [name,width] of [['Delivery alerts',32],['Quiet hours',24],['RTL switch example',32]] as const){
    const input=page.getByRole('switch',{name});const root=input.locator('..');const thumb=root.locator('[data-slot="switch-thumb"]');const box=await input.boundingBox();expect(box!.width).toBe(width);
    const before=await thumb.boundingBox();const wasChecked=await input.isChecked();await input.click();const after=await thumb.boundingBox();
    const rtl=name==='RTL switch example';expect(Math.sign(after!.x-before!.x)).toBe((wasChecked ? -1 : 1)*(rtl ? -1 : 1));expect(after!.x).toBeGreaterThanOrEqual(box!.x);expect(after!.x+after!.width).toBeLessThanOrEqual(box!.x+box!.width);expect(await thumb.evaluate(el=>getComputedStyle(el).transitionDuration)).toBe('0s');
  }
});
for(const mode of ['light','dark'])test(`${mode} toggles including invalid controls pass axe`,async({page})=>{
  if(mode==='dark')await page.getByRole('button',{name:'Dark mode'}).click();await page.getByRole('switch',{name:'Restricted preview setting'}).click();
  await page.evaluate(()=>Promise.all(document.getAnimations().filter(animation=>animation.effect?.getTiming().iterations!==Infinity).map(animation=>animation.finished.catch(()=>undefined))));
  // Mixed and checked indicators must retain the same filled surface in both themes.
  expect(await page.getByRole('checkbox',{name:'Select all categories'}).evaluate(el=>getComputedStyle(el).backgroundColor)).toBe(await page.getByRole('checkbox',{name:'Weekly summary'}).evaluate(el=>getComputedStyle(el).backgroundColor));
  expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);
});
