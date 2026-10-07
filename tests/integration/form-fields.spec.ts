// Real browsers prove label focus, native field restrictions and semantic errors; D19.
import { test, expect } from '../browser-fixture';
import AxeBuilder from '@axe-core/playwright';
test.beforeEach(async({page})=>{await page.goto('/');});
test('labels focus their controls and keyboard navigation exposes focus rings',async({page})=>{
  await page.locator('label[for="contact-email"]').click();const email=page.getByLabel('Contact email (required)');await expect(email).toBeFocused();
  await page.keyboard.press('Tab');const notes=page.getByLabel('Delivery notes (required)');await expect(notes).toBeFocused();expect(await notes.evaluate(el=>getComputedStyle(el).boxShadow)).not.toBe('none');
  await page.keyboard.press('Shift+Tab');await expect(email).toBeFocused();expect(await email.evaluate(el=>getComputedStyle(el).boxShadow)).not.toBe('none');
  await page.locator('label[for="delivery-notes"]').click();await expect(notes).toBeFocused();
});
test('read-only, disabled, file and invalid fields retain their native behavior',async({page})=>{
  const readOnly=page.getByLabel('Account ID (read only)');await readOnly.focus();await page.keyboard.type('Cannot edit');await expect(readOnly).toHaveValue('NORTH-001');
  await expect(page.getByLabel('Managed contact (disabled)')).toBeDisabled();await expect(page.getByLabel('Locked notes (disabled)')).toBeDisabled();
  await page.keyboard.press('Tab');await expect(page.getByLabel('Attachment')).toBeFocused();
  const file=page.getByLabel('Attachment');await file.setInputFiles({name:'instructions.txt',mimeType:'text/plain',buffer:Buffer.from('Call on arrival')});expect(await file.evaluate(el=>(el as HTMLInputElement).files?.[0]?.name)).toBe('instructions.txt');
  const reference=page.getByLabel('Reference code');await reference.fill('Keep my draft');await page.getByRole('button',{name:'Show preview error'}).click();await expect(reference).toHaveAttribute('aria-invalid','true');await expect(reference).toHaveAccessibleDescription(/Enter the reference/);
  await page.getByRole('button',{name:'Clear preview error'}).click();await expect(reference).toHaveAttribute('aria-invalid','false');await expect(reference).not.toHaveAttribute('aria-describedby');await expect(reference).toHaveValue('Keep my draft');
});
for(const mode of ['light','dark'])test(`${mode} invalid field presentation has no axe violations`,async({page})=>{
  if(mode==='dark')await page.getByRole('button',{name:'Dark mode'}).click();await page.getByRole('button',{name:'Show preview error'}).click();
  await page.evaluate(()=>Promise.all(document.getAnimations().filter(animation=>animation.effect?.getTiming().iterations!==Infinity).map(animation=>animation.finished.catch(()=>undefined))));
  expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);
});
