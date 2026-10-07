// Built-library form participation, reset recovery and small-screen operation; D19.
import { test, expect } from '../browser-fixture';
test('notification form validates, serializes checked values and restores default-on controls',async({page})=>{
  await page.goto('/');const terms=page.getByRole('checkbox',{name:'Accept notification terms (required)'});const save=page.getByRole('button',{name:'Save notification preview'});const status=page.getByTestId('notification-status');
  await save.click();await expect(terms).toBeFocused();await expect(status).toBeEmpty();await terms.check();await page.getByRole('checkbox',{name:'Weekly summary'}).uncheck();await page.getByRole('switch',{name:'Delivery alerts'}).uncheck();await page.getByRole('switch',{name:'Quiet hours'}).check();await save.click();await expect(status).toHaveText('{"terms":"accepted","quiet":"on"}');
  await page.getByRole('button',{name:'Reset notifications'}).click();await expect(terms).not.toBeChecked();await expect(page.getByRole('checkbox',{name:'Weekly summary'})).toBeChecked();await expect(page.getByRole('switch',{name:'Delivery alerts'})).toBeChecked();await expect(page.getByRole('switch',{name:'Quiet hours'})).not.toBeChecked();await expect(status).toBeEmpty();
  await terms.check();await save.click();await expect(status).toHaveText('{"terms":"accepted","weekly":"on","alerts":"on"}');
});
test('toggles remain usable with enlarged text at mobile width',async({page})=>{
  await page.setViewportSize({width:390,height:844});await page.goto('/');await page.evaluate(()=>{document.documentElement.style.fontSize='24px';});
  const checkbox=page.getByRole('checkbox',{name:'Select all categories'});await page.locator('label[for="select-all"]').click();await expect(checkbox).toBeChecked();await page.getByRole('switch',{name:'Restricted preview setting'}).click();await page.getByRole('button',{name:'Dismiss setting error'}).click();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
});
