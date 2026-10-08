// Hydrate real Loading fallback nodes before resolving or disposing their async owner; D19/D90.
import type { Page } from '@playwright/test';
import { test, expect } from '../browser-fixture';

/** Require one accessible caller-owned status and decorative Skeleton placeholders. */
async function expectPending(page: Page, id: number) {
  await expect(page.getByRole('status')).toHaveText(`Loading profile ${id}`);
  await expect(page.getByTestId('profile-fallback')).toHaveAttribute('aria-busy', 'true');
  const skeletons = page.locator('[data-slot="skeleton"]');
  await expect(skeletons).toHaveCount(2);
  for (const skeleton of await skeletons.all()) await expect(skeleton).toHaveAttribute('aria-hidden', 'true');
  await expect(page.getByTestId('ready-profile')).toHaveCount(0);
}
/** Allow promise reactions and browser rendering to finish before asserting a late result stayed absent. */
async function settle(page: Page) {
  await page.evaluate(async () => {
    await new Promise<void>(done => requestAnimationFrame(() => done()));
    await new Promise<void>(done => requestAnimationFrame(() => done()));
  });
}
/** Require exact SSR claims, then confine Solid's pending fallback handoff to that subtree. */
async function hydratePending(page: Page, native = false) {
  await page.goto(native ? '/loading-native/' : '/loading/');
  await expect(page.locator('#hydrate')).toHaveAttribute('data-ready', 'true');
  await expectPending(page, 1);
  const nodes = await page.locator('#hydration-root').evaluateHandle(root => Array.from(root.querySelectorAll('*')));
  await page.getByLabel('Profile draft').fill('Draft before hydration');
  const duringClaim = await page.locator('#hydrate').evaluate((node: HTMLButtonElement) => {
    const elements = Array.from(document.querySelectorAll('#hydration-root *'));
    node.click();
    return elements.filter(element => !element.isConnected).map(element => element.outerHTML);
  });
  await expect(page.locator('#hydration-root')).toHaveAttribute('data-hydrated', 'true');
  await expectPending(page, 1);
  const replaced = await nodes.evaluate(elements => elements.filter(node => !node.isConnected).map(node => node.outerHTML));
  await test.info().attach('fallback-handoff', { body: JSON.stringify({ native, duringClaim, replaced }), contentType: 'application/json' });
  expect(duringClaim, 'The synchronous hydration claim retains every server element').toEqual([]);
  // rc.13's serialized $$f marker queues a fresh client boundary after claiming the SSR fallback.
  expect(replaced).toHaveLength(4);
  expect(await nodes.evaluate(elements => elements.filter(node => !node.isConnected).every(node => node.closest('[data-testid="profile-fallback"]'))), 'Only the pending fallback may be replaced').toBe(true);
  expect(await page.locator('#hydration-root *').count()).toBe(await nodes.evaluate(elements => elements.length));
  await nodes.dispose();
  await expect(page.getByLabel('Profile draft')).toHaveValue('Draft before hydration');
}

test('compares native placeholders during the pending boundary handoff', async ({ page }) => {
  await hydratePending(page, true);
  await page.getByRole('button', { name: 'Resolve request 1', exact: true }).click();
  await expect(page.getByTestId('ready-profile')).toHaveText('Profile 1 is ready');
  await expect(page.locator('[data-slot="skeleton"]')).toHaveCount(0);
});

test('hydrates pending Skeleton nodes, resolves the real boundary and unmounts ready content', async ({ page }) => {
  await hydratePending(page);
  const fallback = await page.getByTestId('profile-fallback').elementHandle();
  const draft = page.getByLabel('Profile draft');const draftNode = await draft.elementHandle();
  await draft.fill('Hydrated draft');
  await page.getByRole('button', { name: 'Resolve request 1', exact: true }).evaluate(node => (node as HTMLButtonElement).click());
  await expect(page.getByTestId('ready-profile')).toHaveText('Profile 1 is ready');
  await expect(page.getByRole('status')).toHaveCount(0);await expect(page.locator('[data-slot="skeleton"]')).toHaveCount(0);
  expect(await fallback!.evaluate(node => node.isConnected)).toBe(false);
  await expect(draft).toBeFocused();await expect(draft).toHaveValue('Hydrated draft');
  expect(await draft.evaluate((node, original) => node === original, draftNode)).toBe(true);
  const ready = await page.getByTestId('ready-profile').elementHandle();
  await page.getByRole('button', { name: 'Unmount profile' }).focus();await page.keyboard.press('Enter');
  await expect(page.getByText('Profile unmounted', { exact: true })).toBeVisible();
  expect(await ready!.evaluate(node => node.isConnected)).toBe(false);
  await expect(page.getByRole('button', { name: 'Unmount profile' })).toBeFocused();
});

test('unmounts hydrated pending boundaries and ignores old resolutions after a fresh mount', async ({ page }) => {
  await hydratePending(page);
  const fallback = await page.getByTestId('profile-fallback').elementHandle();
  await page.getByRole('button', { name: 'Unmount profile' }).click();
  expect(await fallback!.evaluate(node => node.isConnected)).toBe(false);
  await page.getByRole('button', { name: 'Resolve request 1', exact: true }).click();await settle(page);
  await expect(page.getByText('Profile unmounted', { exact: true })).toBeVisible();
  await expect(page.getByTestId('ready-profile')).toHaveCount(0);
  await page.getByRole('button', { name: 'Mount next request' }).click();await expectPending(page, 2);
  await page.getByRole('button', { name: 'Unmount profile' }).click();
  await page.getByRole('button', { name: 'Mount next request' }).click();await expectPending(page, 3);
  const fresh = await page.getByTestId('profile-fallback').elementHandle();
  await page.getByRole('button', { name: 'Resolve request 2', exact: true }).click();await settle(page);
  await expectPending(page, 3);
  expect(await page.getByTestId('profile-fallback').evaluate((node, original) => node === original, fresh)).toBe(true);
  await page.getByRole('button', { name: 'Resolve request 3', exact: true }).click();
  await expect(page.getByTestId('ready-profile')).toHaveText('Profile 3 is ready');
  await expect(page.locator('[data-slot="skeleton"]')).toHaveCount(0);
  await expect(page.getByLabel('Profile draft')).toHaveValue('Draft before hydration');
});

test('disposing the hydrated root prevents late promise completion from restoring content', async ({ page }) => {
  await hydratePending(page);
  const fallback = await page.getByTestId('profile-fallback').elementHandle();
  await page.getByRole('button', { name: 'Dispose components' }).click();
  await expect(page.locator('#hydration-root')).toBeEmpty();
  expect(await fallback!.evaluate(node => node.isConnected)).toBe(false);
  await page.getByRole('button', { name: 'Resolve detached request' }).click();await settle(page);
  await expect(page.locator('#resolve-detached')).toHaveAttribute('data-resolved', 'true');
  await expect(page.locator('#hydration-root')).toBeEmpty();
  await expect(page.getByTestId('ready-profile')).toHaveCount(0);
  await expect(page.locator('[data-slot="skeleton"]')).toHaveCount(0);
});
