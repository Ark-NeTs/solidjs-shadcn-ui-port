// Complete user journeys against freshly built public documentation; D19.
import { test, expect } from '../browser-fixture';
test('form validation, pending submit protection and recovery to ready',async({page})=>{
  await page.goto('/');const input=page.getByRole('textbox',{name:'Workspace name'});const save=page.getByRole('button',{name:'Save changes',exact:true});
  await input.fill('');await save.click();await expect(input).toBeFocused();await expect(save).toBeEnabled();
  await input.fill('Our new workspace');await save.focus();await page.keyboard.press('Enter');await expect(save).toBeDisabled();await expect(save).toHaveAttribute('aria-busy','true');await expect(page.getByText('Loading preview',{exact:true})).toBeAttached();
  await page.getByRole('button',{name:'Complete preview save'}).click();await expect(page.getByText('Saved changes: 1')).toBeVisible();await expect(save).toBeEnabled();await expect(input).toHaveValue('Our new workspace');await expect(page.locator('[data-slot="skeleton"]')).toHaveCount(0);
});
test('narrow viewport, enlarged text and long input stay usable',async({page})=>{
  await page.setViewportSize({width:390,height:844});await page.goto('/');await page.evaluate(()=>{document.documentElement.style.fontSize='24px'});
  await page.getByRole('textbox',{name:'Workspace name'}).fill('An exceptionally long workspace name with many words');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
  await page.getByRole('button',{name:'Save changes',exact:true}).click();await expect(page.getByRole('button',{name:'Save changes',exact:true})).toBeDisabled();await page.getByRole('button',{name:'Complete preview save'}).click();await expect(page.getByText('Saved changes: 1')).toBeVisible();
});
