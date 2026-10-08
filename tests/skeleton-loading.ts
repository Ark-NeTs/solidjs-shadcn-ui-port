// SKL-1 actual promise resolution and disposal in source and built browsers; D19/D90.
import type { Page } from '@playwright/test';
import { test, expect } from './browser-fixture';

/** Let promise reactions and subsequent browser rendering finish before absence checks. */
async function settleFrames(page: Page) {
  await page.evaluate(async () => {
    await new Promise<void>(done => requestAnimationFrame(() => done()));
    await new Promise<void>(done => requestAnimationFrame(() => done()));
  });
}
/** Require one accessible app-owned status and three decorative placeholders. */
async function expectPending(page: Page, id: number) {
  await expect(page.getByRole('status')).toHaveText(`Loading profile ${id}`);
  await expect(page.getByTestId('profile-fallback')).toHaveAttribute('aria-busy', 'true');
  const skeletons = page.locator('[data-slot="skeleton"]');
  await expect(skeletons).toHaveCount(3);
  for (const skeleton of await skeletons.all()) await expect(skeleton).toHaveAttribute('aria-hidden', 'true');
  await expect(page.getByTestId('ready-profile')).toHaveCount(0);
}
/** Exercise real Loading replacement, pending disposal, late settlement and fresh ownership. */
export function skeletonLoading() {
  for (const dark of [false, true]) {
    test(`${dark ? 'dark narrow enlarged' : 'light desktop'} Skeleton Loading resolves and releases its fallback and ready subtree`, async ({ page }) => {
      if (dark) await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(`/?skeleton-loading${dark ? '&dark' : ''}`);
      if (dark) await page.evaluate(() => { document.documentElement.style.fontSize = '24px'; });
      await expectPending(page, 1);
      const placeholder = await page.locator('[data-slot="skeleton"]').first().elementHandle();
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await expect(page.locator('[data-slot="skeleton"]').first()).toHaveCSS('animation-name', 'none');
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      const draft = page.getByRole('textbox', { name: 'Profile draft' });
      await draft.fill('Unsaved profile edits');
      const draftNode = await draft.elementHandle();
      // Resolving programmatically from a real button leaves editing focus on the shell.
      await page.getByRole('button', { name: 'Resolve request 1', exact: true }).evaluate(node => (node as HTMLButtonElement).click());
      await expect(page.getByTestId('ready-profile')).toHaveText('Profile 1 is ready');
      await expect(page.getByTestId('profile-fallback')).toHaveCount(0);
      await expect(page.getByRole('status')).toHaveCount(0);
      await expect(page.locator('[data-slot="skeleton"]')).toHaveCount(0);
      expect(await placeholder!.evaluate(node => node.isConnected)).toBe(false);
      await expect(draft).toBeFocused();
      await expect(draft).toHaveValue('Unsaved profile edits');
      expect(await draftNode!.evaluate(node => node === document.getElementById('profile-draft'))).toBe(true);
      const ready = await page.getByTestId('ready-profile').elementHandle();
      const unmount = page.getByRole('button', { name: 'Unmount profile' });
      await unmount.focus();
      await page.keyboard.press('Enter');
      await expect(page.getByText('Profile unmounted', { exact: true })).toBeVisible();
      expect(await ready!.evaluate(node => node.isConnected)).toBe(false);
      await expect(unmount).toBeFocused();
      await page.getByRole('button', { name: 'Mount next request' }).click();
      await expectPending(page, 2);
      await page.getByRole('button', { name: 'Resolve request 2', exact: true }).click();
      await expect(page.getByTestId('ready-profile')).toHaveText('Profile 2 is ready');
      await expect(page.locator('[data-slot="skeleton"]')).toHaveCount(0);
    });
  }

  test('pending Skeleton boundaries stay disposed after late resolution and cannot replace a fresh request', async ({ page }) => {
    await page.goto('/?skeleton-loading');
    await expectPending(page, 1);
    const oldFallback = await page.getByTestId('profile-fallback').elementHandle();
    await page.getByRole('button', { name: 'Unmount profile' }).click();
    await expect(page.getByTestId('profile-fallback')).toHaveCount(0);
    expect(await oldFallback!.evaluate(node => node.isConnected)).toBe(false);
    await page.getByRole('button', { name: 'Resolve request 1', exact: true }).click();
    await settleFrames(page);
    await expect(page.getByText('Profile unmounted', { exact: true })).toBeVisible();
    await expect(page.getByTestId('ready-profile')).toHaveCount(0);
    await expect(page.locator('[data-slot="skeleton"]')).toHaveCount(0);
    await page.getByRole('button', { name: 'Mount next request' }).click();
    await expectPending(page, 2);
    await page.getByRole('button', { name: 'Unmount profile' }).click();
    await page.getByRole('button', { name: 'Mount next request' }).click();
    await expectPending(page, 3);
    const newFallback = await page.getByTestId('profile-fallback').elementHandle();
    await page.getByRole('button', { name: 'Resolve request 2', exact: true }).click();
    await settleFrames(page);
    await expectPending(page, 3);
    expect(await newFallback!.evaluate(node => node === document.querySelector('[data-testid="profile-fallback"]'))).toBe(true);
    await page.getByRole('button', { name: 'Resolve request 3', exact: true }).click();
    await expect(page.getByTestId('ready-profile')).toHaveText('Profile 3 is ready');
    await expect(page.getByRole('status')).toHaveCount(0);
    await expect(page.locator('[data-slot="skeleton"]')).toHaveCount(0);
  });
}
