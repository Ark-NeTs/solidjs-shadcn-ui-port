// HTTP service + real Query cache + public source/built components; no mocked fetches.
import AxeBuilder from '@axe-core/playwright';
import {test, expect} from '../../tests/browser-fixture';
import type {WorkflowItem} from './workflow-api';

test.describe('consumer Data Table → Dialog → HTTP save', () => {
 let session: string;
 test.beforeEach(async ({request}) => {
  const response = await request.post('/api/workflow/sessions');
  expect(response.ok()).toBe(true); session = (await response.json()).id;
 });
 test.afterEach(async ({request}) => {await request.post(`/api/workflow/${session}/control`, {data: {release: true}});});

 test('commits canonical server values, retains selection and persists after a full reload', async ({page, request}) => {
  await page.goto(`/workflow?session=${session}`);
  await page.getByRole('checkbox', {name: 'Select row dish-1', exact: true}).check();
  const edit = page.getByRole('button', {name: 'Edit Margherita pizza'});
  await edit.focus(); await page.keyboard.press('Enter');
  await expect(page.getByLabel('Item name', {exact: true})).toBeFocused();
  await page.getByLabel('Item name', {exact: true}).fill('  Seasonal pizza  ');
  await page.getByLabel('Price (USD)').fill('15.25');
  await page.getByRole('button', {name: 'Save changes'}).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('button', {name: 'Edit Seasonal pizza'})).toBeFocused();
  await expect(page.getByRole('row').filter({hasText: 'Seasonal pizza'})).toContainText('$15.25');
  await expect(page.getByRole('checkbox', {name: 'Select row dish-1', exact: true})).toBeChecked();
  const state = await (await request.get(`/api/workflow/${session}/state`)).json();
  expect(state.items[0]).toMatchObject({name: 'Seasonal pizza', priceCents: 1525, version: 2}); expect(state.saves).toBe(1);
  // Native router links dispose the editor, but the host Query cache retains confirmed rows.
  await page.getByRole('link', {name: 'Settings page'}).click(); await page.goBack();
  await expect(page.getByRole('button', {name: 'Edit Seasonal pizza'})).toBeVisible();
  expect((await (await request.get(`/api/workflow/${session}/state`)).json()).reads).toBe(1);
  await page.reload(); await page.getByRole('button', {name: 'Edit Seasonal pizza'}).click();
  await expect(page.getByLabel('Item name', {exact: true})).toHaveValue('Seasonal pizza');
  await expect(page.getByLabel('Price (USD)')).toHaveValue('15.25');
  expect((await (await request.get(`/api/workflow/${session}/state`)).json()).reads).toBe(2);
 });

 for (const dark of [false, true]) test(`preserves rejected drafts and retries only explicitly in ${dark ? 'dark' : 'light'} narrow layout`, async ({page, request}) => {
  await request.post(`/api/workflow/${session}/control`, {data: {reject: true}});
  await page.setViewportSize({width: 390, height: 844});
  await page.goto(`/workflow?session=${session}${dark ? '&dark' : ''}`);
  await page.evaluate(() => {document.documentElement.style.fontSize = '24px';});
  await page.getByRole('button', {name: 'Edit Margherita pizza'}).click();
  await page.getByLabel('Item name', {exact: true}).fill('Rejected pizza');
  await page.getByLabel('Price (USD)').fill('18.75');
  await page.getByRole('button', {name: 'Save changes'}).click();
  await expect(page.getByRole('alert')).toContainText('Your draft is preserved');
  await expect(page.getByLabel('Item name', {exact: true})).toHaveValue('Rejected pizza');
  await expect(page.getByLabel('Price (USD)')).toHaveValue('18.75');
  await expect(page.locator('tbody')).toContainText('Margherita pizza');
  expect((await (await request.get(`/api/workflow/${session}/state`)).json()).items[0].version).toBe(1);
  expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  const screenshot = test.info().outputPath('rejected-save.png');
  await page.screenshot({path: screenshot}); await test.info().attach('rejected-save', {path: screenshot, contentType: 'image/png'});
  // A retry is a second explicit form submission, never a cache or transport replay.
  await expect.poll(async () => (await (await request.get(`/api/workflow/${session}/state`)).json()).saves).toBe(1);
  await page.getByRole('button', {name: 'Save changes'}).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('row').filter({hasText: 'Rejected pizza'})).toContainText('$18.75');
  const state = await (await request.get(`/api/workflow/${session}/state`)).json();
  expect(state.saves).toBe(2); expect(state.items[0].version).toBe(2);
 });

 test('does not replay a write with an unreadable acknowledgement and reconciles through reload', async ({page, request}) => {
  await request.post(`/api/workflow/${session}/control`, {data: {unreadable: true}});
  await page.goto(`/workflow?session=${session}`);
  await page.getByRole('button', {name: 'Edit Margherita pizza'}).click();
  await page.getByLabel('Item name', {exact: true}).fill('Already saved pizza');
  await page.getByRole('button', {name: 'Save changes'}).click();
  await expect(page.getByRole('alert')).toContainText('Save outcome is unknown');
  await expect(page.getByLabel('Item name', {exact: true})).toHaveValue('Already saved pizza');
  await expect(page.getByRole('button', {name: 'Save changes'})).toBeDisabled();
  await page.locator('#workflow-editor').evaluate(form => {(form as HTMLFormElement).requestSubmit();});
  const state = await (await request.get(`/api/workflow/${session}/state`)).json();
  expect(state.saves).toBe(1); expect(state.items[0]).toMatchObject({name: 'Already saved pizza', version: 2});
  await expect(page.locator('tbody')).toContainText('Margherita pizza');
  await page.getByRole('button', {name: 'Cancel', exact: true}).click();
  await page.getByRole('link', {name: 'Settings page'}).click(); await page.goBack();
  await page.getByRole('button', {name: 'Edit Margherita pizza'}).click();
  await expect(page.getByRole('alert')).toContainText('Save outcome is unknown');
  await expect(page.getByRole('button', {name: 'Save changes'})).toBeDisabled();
  await page.reload(); await page.getByRole('button', {name: 'Edit Already saved pizza'}).click();
  await expect(page.getByLabel('Item name', {exact: true})).toHaveValue('Already saved pizza');
  expect((await (await request.get(`/api/workflow/${session}/state`)).json()).saves).toBe(1);
 });

 test('guards duplicate submits and Escape until the HTTP write settles', async ({page, request}) => {
  await request.post(`/api/workflow/${session}/control`, {data: {hold: true}});
  await page.goto(`/workflow?session=${session}`);
  await page.getByRole('button', {name: 'Edit Margherita pizza'}).click();
  await page.getByLabel('Item name', {exact: true}).fill('Held pizza');
  await page.getByRole('button', {name: 'Save changes'}).click();
  await expect(page.getByRole('button', {name: 'Saving…', exact: true})).toBeDisabled();
  await expect(page.getByLabel('Item name', {exact: true})).toBeDisabled();
  await expect(page.getByRole('button', {name: 'Cancel', exact: true})).toBeDisabled();
  await page.keyboard.press('Escape'); await expect(page.getByRole('dialog')).toBeVisible();
  await page.locator('#workflow-editor').evaluate(form => {(form as HTMLFormElement).requestSubmit(); (form as HTMLFormElement).requestSubmit();});
  await expect.poll(async () => (await (await request.get(`/api/workflow/${session}/state`)).json()).saves).toBe(1);
  await expect(page.locator('tbody')).toContainText('Margherita pizza');
  await request.post(`/api/workflow/${session}/control`, {data: {release: true}});
  await expect(page.getByRole('button', {name: 'Edit Held pizza'})).toBeFocused();
  expect((await (await request.get(`/api/workflow/${session}/state`)).json()).saves).toBe(1);
 });

 test('rejects a stale version without overwriting the newer server record', async ({page, request}) => {
  await page.goto(`/workflow?session=${session}`);
  await page.getByRole('button', {name: 'Edit Margherita pizza'}).click();
  await page.getByLabel('Item name', {exact: true}).fill('Stale draft');
  const state = await (await request.get(`/api/workflow/${session}/state`)).json();
  const remote: WorkflowItem = {...state.items[0], name: 'Another editor’s pizza'};
  const remoteSave = await request.put(`/api/workflow/${session}/items`, {data: remote});
  expect((await remoteSave.json()).accepted).toBe(true);
  await page.getByRole('button', {name: 'Save changes'}).click();
  await expect(page.getByRole('alert')).toContainText('changed on the server');
  await expect(page.getByLabel('Item name', {exact: true})).toHaveValue('Stale draft');
  expect((await (await request.get(`/api/workflow/${session}/state`)).json()).items[0]).toMatchObject({name: 'Another editor’s pizza', version: 2});
  await page.getByRole('button', {name: 'Cancel', exact: true}).click();
  await page.reload(); await page.getByRole('button', {name: 'Edit Another editor’s pizza'}).click();
  await expect(page.getByLabel('Item name', {exact: true})).toHaveValue('Another editor’s pizza');
 });
});
