// Errored reset, persistent drafts and stale rejection after real source hydration; D19/D90.
import type { Page } from '@playwright/test';
import { test, expect } from '../browser-fixture';

/** Flush promise reactions and rendering before absence and no-automatic-retry assertions. */
async function settle(page: Page) {
  await page.evaluate(async () => {
    await new Promise<void>(done => requestAnimationFrame(() => done()));
    await new Promise<void>(done => requestAnimationFrame(() => done()));
  });
}
/** Inspect SSR pending state, exact synchronous claims and persistent shell/draft identity. */
async function hydratePending(page: Page) {
  await page.goto('/errored/');
  await expect(page.locator('#hydrate')).toHaveAttribute('data-ready', 'true');
  await expect(page.getByRole('status')).toHaveText('Loading profile 1');
  const shell = await page.locator('#hydration-root').evaluateHandle(root => Array.from(root.querySelectorAll('*')).filter(node => !node.closest('[data-testid="profile-fallback"]')));
  await page.getByLabel('Profile draft').fill('Draft before hydration');
  expect(await page.locator('#hydrate').evaluate((node: HTMLButtonElement) => {
    const elements = Array.from(document.querySelectorAll('#hydration-root *'));node.click();
    return elements.filter(element => !element.isConnected).map(element => element.outerHTML);
  })).toEqual([]);
  await expect(page.locator('#hydration-root')).toHaveAttribute('data-hydrated', 'true');
  await expect(page.getByRole('status')).toHaveText('Loading profile 1');
  expect(await shell.evaluate(nodes => nodes.every(node => node.isConnected))).toBe(true);await shell.dispose();
  await expect(page.getByLabel('Profile draft')).toHaveValue('Draft before hydration');
  return page.getByLabel('Profile draft').elementHandle();
}

test('rejected hydrated data preserves drafts and explicit Errored resets recover without duplicate requests', async ({ page }) => {
  const draftNode = await hydratePending(page);const draft = page.getByLabel('Profile draft');
  await draft.fill('Unsaved profile edits');
  await page.getByRole('button', { name: 'Reject request 1', exact: true }).evaluate(node => (node as HTMLButtonElement).click());
  await expect(page.getByRole('alert')).toContainText('Profile 1 failed');
  await expect(page.getByRole('alert')).toContainText('Your draft is preserved. Retry');
  await expect(page.getByRole('status')).toHaveCount(0);await expect(page.locator('[data-slot="skeleton"]')).toHaveCount(0);
  await settle(page);await expect(page.getByTestId('request-count')).toHaveText('1');
  await expect(draft).toBeFocused();await expect(draft).toHaveValue('Unsaved profile edits');
  expect(await draft.evaluate((node, original) => node === original, draftNode)).toBe(true);
  await page.getByRole('button', { name: 'Retry profile' }).focus();await page.keyboard.press('Enter');
  // The previous error remains committed while the retry promise is pending.
  await settle(page);await expect(page.getByRole('alert')).toContainText('Profile 1 failed');
  await expect(page.getByRole('status')).toHaveCount(0);await expect(draft).toBeFocused();
  await expect(page.getByTestId('request-count')).toHaveText('1');
  await page.getByRole('button', { name: 'Reject request 2', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Profile 2 failed');
  // Two synchronous activation attempts on the retry control create only one new request.
  await page.getByRole('button', { name: 'Retry profile' }).evaluate((node: HTMLButtonElement) => { node.click();node.click(); });
  await settle(page);await expect(page.getByRole('alert')).toContainText('Profile 2 failed');
  await expect(page.getByRole('status')).toHaveCount(0);
  await page.getByRole('button', { name: 'Resolve request 3', exact: true }).evaluate(node => (node as HTMLButtonElement).click());
  await expect(page.getByTestId('ready-profile')).toHaveText('Profile 3 is ready');
  await expect(page.getByTestId('request-count')).toHaveText('3');
  await expect(page.getByRole('alert')).toHaveCount(0);await expect(page.getByRole('status')).toHaveCount(0);
  await expect(draft).toHaveValue('Unsaved profile edits');await expect(draft).toBeFocused();
  expect(await draft.evaluate((node, original) => node === original, draftNode)).toBe(true);
});

for (const action of ['Resolve', 'Reject'] as const) test(`a stale retry's ${action.toLowerCase()} cannot overwrite a newer successful request`, async ({ page }) => {
  const draftNode = await hydratePending(page);
  await page.getByRole('button', { name: 'Reject request 1', exact: true }).click();
  await page.getByRole('button', { name: 'Retry profile' }).click();
  await settle(page);await expect(page.getByRole('alert')).toContainText('Profile 1 failed');
  await page.getByRole('button', { name: 'Start newer request' }).click();
  await page.getByRole('button', { name: 'Resolve request 3', exact: true }).click();
  await expect(page.getByTestId('ready-profile')).toHaveText('Profile 3 is ready');
  const ready = await page.getByTestId('ready-profile').elementHandle();
  await page.getByRole('button', { name: `${action} request 2`, exact: true }).click();await settle(page);
  await expect(page.getByTestId('ready-profile')).toHaveText('Profile 3 is ready');
  expect(await page.getByTestId('ready-profile').evaluate((node, original) => node === original, ready)).toBe(true);
  await expect(page.getByRole('alert')).toHaveCount(0);await expect(page.getByRole('status')).toHaveCount(0);
  await expect(page.getByTestId('request-count')).toHaveText('3');
  await expect(page.getByLabel('Profile draft')).toHaveValue('Draft before hydration');
  expect(await page.getByLabel('Profile draft').evaluate((node, original) => node === original, draftNode)).toBe(true);
});

test('late rejection after pending unmount stays contained and a fresh boundary can recover', async ({ page }) => {
  await hydratePending(page);
  await page.getByRole('button', { name: 'Unmount profile' }).click();
  await page.getByRole('button', { name: 'Reject request 1', exact: true }).click();await settle(page);
  await expect(page.getByText('Profile unmounted', { exact: true })).toBeVisible();
  await expect(page.getByRole('alert')).toHaveCount(0);
  await page.getByRole('button', { name: 'Start newer request' }).click();
  await expect(page.getByRole('status')).toHaveText('Loading profile 2');
  await page.getByRole('button', { name: 'Reject request 2', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Profile 2 failed');
  await page.getByRole('button', { name: 'Retry profile' }).click();
  await page.getByRole('button', { name: 'Resolve request 3', exact: true }).click();
  await expect(page.getByTestId('ready-profile')).toHaveText('Profile 3 is ready');
  await expect(page.getByLabel('Profile draft')).toHaveValue('Draft before hydration');
});

test('late rejection after disposing the hydrated root does not restore an error or content', async ({ page }) => {
  await hydratePending(page);
  await page.getByRole('button', { name: 'Dispose components' }).click();
  await expect(page.locator('#hydration-root')).toBeEmpty();
  await page.getByRole('button', { name: 'Reject detached request' }).click();await settle(page);
  await expect(page.locator('#reject-detached')).toHaveAttribute('data-rejected', 'true');
  await expect(page.locator('#hydration-root')).toBeEmpty();await expect(page.getByRole('alert')).toHaveCount(0);
});
