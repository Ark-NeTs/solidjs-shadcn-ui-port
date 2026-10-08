// TAB-1 dynamic focus and panel lifetime contracts for both export modes; D19/D90.
import type { Page } from '@playwright/test';
import { test, expect } from './browser-fixture';

/** Require one enabled tab stop and live ARIA links after each collection change. */
async function expectTabState(page: Page, focused: string, selected: string) {
  const list = page.getByRole('tablist', { name: 'Dynamic sections' });
  const tab = list.getByRole('tab', { name: focused, exact: true });
  await expect(tab).toBeFocused();
  await expect(list.locator('[role="tab"][tabindex="0"]')).toHaveCount(1);
  await expect(tab).toHaveAttribute('tabindex', '0');
  const active = list.getByRole('tab', { name: selected, exact: true });
  await expect(active).toHaveAttribute('aria-selected', 'true');
  await expect(list.locator('[aria-selected="true"]')).toHaveCount(1);
  const panel = page.getByRole('tabpanel', { name: selected, exact: true });
  await expect(panel).toBeVisible();
  expect(await active.getAttribute('aria-controls')).toBe(await panel.getAttribute('id'));
  expect(await panel.getAttribute('aria-labelledby')).toBe(await active.getAttribute('id'));
}

/** Exercise keyed updates without repairing browser focus from the harness. */
export function tabsLifecycle() {
  for (const manual of [false, true]) {
    const mode = manual ? 'manual' : 'automatic';
    test(`${mode} Tabs recover focus when the focused trigger is removed`, async ({ page }) => {
      await page.goto(`/?tabs-lifecycle${manual ? '&manual' : ''}`);
      await page.getByRole('tab', { name: 'Overview', exact: true }).focus();
      await page.keyboard.press('ArrowRight');
      await expectTabState(page, 'Activity', manual ? 'Overview' : 'Activity');
      await page.keyboard.press('Delete');
      await expect(page.getByRole('tab', { name: 'Activity', exact: true })).toHaveCount(0);
      await expectTabState(page, 'Overview', 'Overview');
      await page.keyboard.press('End');
      await expectTabState(page, 'Settings', manual ? 'Overview' : 'Settings');
      await page.keyboard.press('Delete');
      await expectTabState(page, 'Overview', 'Overview');
      await page.keyboard.press('Tab');
      await expect(page.getByRole('tabpanel', { name: 'Overview', exact: true })).toBeFocused();
      await page.keyboard.press('Shift+Tab');
      await page.keyboard.press('Delete');
      await expect(page.getByRole('tablist')).toBeFocused();
      await expect(page.getByRole('tablist').locator('[role="tab"][tabindex="0"]')).toHaveCount(0);
      await page.keyboard.press('Tab');
      await expect(page.getByRole('button', { name: 'After tabs' })).toBeFocused();
    });

    test(`${mode} Tabs preserve the focused node across keyed reordering and navigate the new DOM order`, async ({ page }) => {
      await page.goto(`/?tabs-lifecycle${manual ? '&manual' : ''}`);
      await page.getByRole('tab', { name: 'Overview', exact: true }).focus();
      await page.keyboard.press('ArrowRight');
      const activity = page.getByRole('tab', { name: 'Activity', exact: true });
      const original = await activity.elementHandle();
      if (!original) throw new Error('Expected an Activity trigger');
      await page.keyboard.press('Alt+End');
      await expect(page.getByRole('tablist').getByRole('tab')).toHaveText(['Overview', 'Locked', 'Settings', 'Activity']);
      expect(await activity.evaluate((node, saved) => node === saved, original)).toBe(true);
      await expectTabState(page, 'Activity', manual ? 'Overview' : 'Activity');
      await page.keyboard.press('ArrowLeft');
      await expectTabState(page, 'Settings', manual ? 'Overview' : 'Settings');
      await page.keyboard.press('Home');
      await expectTabState(page, 'Overview', 'Overview');
      await page.keyboard.press('End');
      await expectTabState(page, 'Activity', manual ? 'Overview' : 'Activity');
      if (manual) {
        await page.keyboard.press('Space');
        await expectTabState(page, 'Activity', 'Activity');
      }
      await page.keyboard.press('Home');
      const overview = page.getByRole('tab', { name: 'Overview', exact: true });
      const firstNode = await overview.elementHandle();
      if (!firstNode) throw new Error('Expected an Overview trigger');
      await page.keyboard.press('Alt+End');
      await expect(page.getByRole('tablist').getByRole('tab')).toHaveText(['Locked', 'Settings', 'Activity', 'Overview']);
      expect(await overview.evaluate((node, saved) => node === saved, firstNode)).toBe(true);
      await expectTabState(page, 'Overview', manual ? 'Activity' : 'Overview');
      await page.keyboard.press('ArrowLeft');
      await expectTabState(page, 'Activity', 'Activity');
    });
  }

  test('force-mounted panels preserve draft nodes while hidden and lazy panels dispose their drafts', async ({ page }) => {
    await page.goto('/?tabs-lifecycle');
    await page.getByRole('tab', { name: 'Activity', exact: true }).click();
    const draft = page.locator('#persistent-draft');
    await draft.fill('Keep the edited draft');
    const original = await draft.elementHandle();
    if (!original) throw new Error('Expected a mounted draft');
    await page.getByRole('tab', { name: 'Overview', exact: true }).click();
    await expect(draft).toBeAttached();
    await expect(draft).toBeHidden();
    await expect(page.getByRole('textbox', { name: 'Persistent draft' })).toHaveCount(0);
    await page.keyboard.press('Tab');
    await expect(page.getByRole('tabpanel', { name: 'Overview', exact: true })).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'After tabs' })).toBeFocused();
    await page.getByRole('tab', { name: 'Activity', exact: true }).click();
    await expect(draft).toHaveValue('Keep the edited draft');
    expect(await draft.evaluate((node, saved) => node === saved, original)).toBe(true);
    await page.getByRole('tab', { name: 'Settings', exact: true }).click();
    await page.getByRole('textbox', { name: 'Lazy draft' }).fill('Temporary draft');
    await page.getByRole('tab', { name: 'Overview', exact: true }).click();
    await expect(page.locator('#lazy-draft')).toHaveCount(0);
    await page.getByRole('tab', { name: 'Settings', exact: true }).click();
    await expect(page.getByRole('textbox', { name: 'Lazy draft' })).toHaveValue('Original lazy draft');
    await page.getByRole('tab', { name: 'Activity', exact: true }).click();
    await expect(draft).toHaveValue('Keep the edited draft');
  });

  test('external removal and reordering preserve focus outside the tablist', async ({ page }) => {
    await page.goto('/?tabs-lifecycle');
    await page.getByRole('tab', { name: 'Activity', exact: true }).click();
    const remove = page.getByRole('button', { name: 'Remove Activity externally' });
    await remove.click();
    await expect(remove).toBeFocused();
    await expect(page.getByRole('tab', { name: 'Overview', exact: true })).toHaveAttribute('aria-selected', 'true');
    const reverse = page.getByRole('button', { name: 'Reverse tabs externally' });
    await reverse.click();
    await expect(reverse).toBeFocused();
    await expect(page.getByRole('tablist').getByRole('tab')).toHaveText(['Settings', 'Locked', 'Overview']);
    await page.keyboard.press('Tab');
    await expectTabState(page, 'Overview', 'Overview');
    await page.keyboard.press('ArrowLeft');
    await expectTabState(page, 'Settings', 'Settings');
  });
}
