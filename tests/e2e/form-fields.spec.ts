// Exercise built public fields through validation, submission and reset; D19.
import { test, expect } from '../browser-fixture';
test('native validation preserves drafts and reset restores controlled and uncontrolled fields',async({page})=>{
  await page.goto('/');const email=page.getByLabel('Contact email (required)');const notes=page.getByLabel('Delivery notes (required)');const save=page.getByRole('button',{name:'Save delivery preview'});const status=page.getByTestId('delivery-status');
  await notes.fill('Call on arrival\nUse the side entrance.');await email.fill('not-an-email');await save.click();await expect(email).toBeFocused();await expect(status).toBeEmpty();await expect(notes).toHaveValue('Call on arrival\nUse the side entrance.');
  await email.fill('team@example.com');await notes.fill('');await save.click();await expect(notes).toBeFocused();await expect(status).toBeEmpty();
  await notes.fill('Call on arrival\nUse the side entrance.');await save.focus();await page.keyboard.press('Enter');await expect(status).toHaveText('Preview saved for team@example.com: Call on arrival\nUse the side entrance.');
  await page.getByRole('button',{name:'Reset delivery draft'}).click();await expect(email).toHaveValue('hello@example.com');await expect(notes).toHaveValue('Please leave deliveries at reception.');await expect(page.locator('#notes-help')).toContainText('37/240');await expect(status).toBeEmpty();
  await page.getByRole('button',{name:'Reset delivery draft'}).click();await expect(notes).toHaveValue('Please leave deliveries at reception.');
  await save.click();await expect(status).toContainText('hello@example.com: Please leave deliveries at reception.');
});
test('long field values, file names and enlarged fonts fit a narrow screen',async({page})=>{
  await page.setViewportSize({width:390,height:844});await page.goto('/');await page.evaluate(()=>{document.documentElement.style.fontSize='24px';});
  const notes=page.getByLabel('Delivery notes (required)');await notes.fill('Long delivery instructions '.repeat(9));await page.getByLabel('Attachment').setInputFiles({name:'A-very-long-delivery-attachment-name-without-shortening.txt',mimeType:'text/plain',buffer:Buffer.from('Example')});
  await page.getByRole('button',{name:'Show preview error'}).click();await page.getByRole('button',{name:'Save delivery preview'}).click();await expect(page.getByTestId('delivery-status')).toContainText('Long delivery instructions');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
  for(const field of [notes,page.getByLabel('Contact email (required)'),page.getByLabel('Attachment')]){const box=await field.boundingBox();expect(box!.x).toBeGreaterThanOrEqual(0);expect(box!.x+box!.width).toBeLessThanOrEqual(390);}
});
