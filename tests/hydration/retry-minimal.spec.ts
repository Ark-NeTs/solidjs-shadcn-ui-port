// Record the intermediate error/loading view before checking eventual plain Solid recovery; D19/D90.
import { test, expect } from '../browser-fixture';
for (const mode of ['replace-reset', 'replace-only', 'source-reset']) test(`plain Solid retry: ${mode}`, async ({ page }, testInfo) => {
  await page.goto(`/retry-${mode}/`);
  await expect(page.locator('#hydrate')).toHaveAttribute('data-ready', 'true');
  await expect(page.locator('#hydration-root input')).toHaveCount(1);
  await page.getByLabel('Draft').fill('Preserved draft');
  const draft = await page.getByLabel('Draft').elementHandle();
  await page.getByRole('button', { name: 'Hydrate components' }).click();
  await page.getByRole('button', { name: 'Reject first' }).click();
  await expect(page.getByRole('alert')).toContainText('Failed 1');
  await page.getByRole('button', { name: 'Retry', exact: true }).click();
  await page.evaluate(async () => { await new Promise<void>(done => requestAnimationFrame(() => done()));await new Promise<void>(done => requestAnimationFrame(() => done())); });
  await expect(page.getByRole('alert')).toContainText('Failed 1');
  await expect(page.getByRole('status')).toHaveCount(0);
  await expect(page.getByTestId('request')).toHaveText('1');
  await testInfo.attach('after-retry', { body: JSON.stringify({ mode, request: await page.getByTestId('request').textContent(), error: await page.getByRole('alert').allTextContents(), pending: await page.getByRole('status').allTextContents() }), contentType: 'application/json' });
  await page.getByRole('button', { name: 'Resolve second' }).click();
  await expect(page.getByTestId('ready')).toHaveText('Ready 2');
  await expect(page.getByRole('alert')).toHaveCount(0);
  await expect(page.getByTestId('request')).toHaveText(mode === 'source-reset' ? '1' : '2');
  await expect(page.getByLabel('Draft')).toHaveValue('Preserved draft');
  expect(await page.getByLabel('Draft').evaluate((node, original) => node === original, draft)).toBe(true);
});
