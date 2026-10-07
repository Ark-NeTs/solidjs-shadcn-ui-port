// Shared CMB-2 keyboard/geometry checks for source and built browser runs; D19/D90.
import type { Locator, Page } from '@playwright/test';
import { test, expect } from './browser-fixture';

/** Assert actual active-option geometry without scrolling it into view through the test. */
async function expectActiveVisible(page: Page, input: Locator, name: string) {
  const option = page.getByRole('option', { name, exact: true });
  await expect(input).toHaveAttribute('aria-activedescendant', await option.getAttribute('id') as string);
  await expect(input).toBeFocused();
  await expect.poll(async () => option.evaluate(node => {
    const item = node.getBoundingClientRect();
    const list = node.closest('[role="listbox"]')!.getBoundingClientRect();
    const popup = node.closest('[data-slot="popover-content"]')!.getBoundingClientRect();
    return item.top >= Math.max(list.top, popup.top, 0) - 1 && item.bottom <= Math.min(list.bottom, popup.bottom, innerHeight) + 1;
  })).toBe(true);
}

/** Exercise long lists, real sequential focus and nested modal dismissal. */
export function comboboxNavigation() {
  for (const narrow of [false, true]) {
    test(`active options stay visible through wrapping and scrolling in ${narrow ? 'narrow enlarged' : 'desktop'} layouts`, async ({ page }) => {
      if (narrow) await page.setViewportSize({ width: 390, height: 844 });
      await page.goto('/?combobox-contracts');
      if (narrow) await page.evaluate(() => document.documentElement.style.fontSize = '24px');
      const input = page.getByRole('combobox', { name: 'Long option list' });
      await input.press('ArrowUp');
      await expectActiveVisible(page, input, 'Option 40');
      const list = page.getByRole('listbox', { name: 'Options', exact: true });
      await expect.poll(() => list.evaluate(node => node.scrollTop)).toBeGreaterThan(0);
      await input.press('ArrowDown');
      await expectActiveVisible(page, input, 'Option 01');
      await expect.poll(() => list.evaluate(node => node.scrollTop)).toBe(0);
      for (let i = 0; i < 15; i++) await input.press('ArrowDown');
      await expectActiveVisible(page, input, 'Option 16');
      for (let i = 0; i < 10; i++) await input.press('ArrowUp');
      await expectActiveVisible(page, input, 'Option 06');
      await input.press('Enter');
      await expect(input).toHaveValue('Option 06');
      await expect(page.getByRole('listbox')).toHaveCount(0);
    });
  }

  test('inline Tab and Shift+Tab discard drafts and reach native neighboring controls', async ({ page }) => {
    await page.goto('/?combobox-contracts');
    const group = page.getByRole('group', { name: 'Inline focus order' });
    const input = group.getByRole('combobox');
    await input.fill('Ban');
    await input.press('Tab');
    await expect(group.getByRole('button', { name: 'Show options' })).toBeFocused();
    await expect(input).toHaveValue('Apple');
    await expect(page.getByRole('listbox')).toHaveCount(0);
    await page.keyboard.press('Tab');
    await expect(group.getByRole('button', { name: 'After inline chooser' })).toBeFocused();
    await input.fill('Che');
    await input.press('Shift+Tab');
    await expect(group.getByRole('button', { name: 'Before inline chooser' })).toBeFocused();
    await expect(input).toHaveValue('Apple');
    await expect(input).toHaveAttribute('aria-expanded', 'false');
  });

  test('popup search Tab reaches the next control and Shift+Tab returns to its trigger', async ({ page }) => {
    await page.goto('/?combobox-contracts');
    const group = page.getByRole('group', { name: 'Popup focus order' });
    const trigger = group.getByRole('button', { name: 'Popup fruit', exact: true });
    await trigger.click();
    const input = page.getByRole('combobox', { name: 'Popup fruit search' });
    await expect(input).toBeFocused();
    await input.fill('Ban');
    await input.press('Tab');
    await expect(group.getByRole('button', { name: 'After popup chooser' })).toBeFocused();
    await expect(trigger).toHaveText('Apple');
    await expect(input).toHaveCount(0);
    await trigger.click();
    await input.fill('Che');
    await input.press('Shift+Tab');
    await expect(trigger).toBeFocused();
    await expect(trigger).toHaveText('Apple');
    await expect(input).toHaveCount(0);
  });

  test('nested chooser selects and dismisses independently while its modal retains focus and scroll lock', async ({ page }) => {
    await page.goto('/?combobox-contracts');
    const trigger = page.getByRole('button', { name: 'Open fruit editor' });
    await trigger.click();
    const modal = page.getByRole('dialog', { name: 'Fruit editor', exact: true });
    const input = modal.getByRole('combobox', { name: 'Modal fruit' });
    await expect(modal).toHaveAttribute('aria-modal', 'true');
    await input.fill('Ban');
    await input.press('ArrowDown');
    await expectActiveVisible(page, input, 'Banana');
    await input.press('Enter');
    await expect(input).toHaveValue('Banana');
    await expect(input).toBeFocused();
    await expect(modal).toBeVisible();
    await input.press('ArrowDown');
    await input.press('Escape');
    await expect(page.getByRole('listbox')).toHaveCount(0);
    await expect(modal).toBeVisible();
    await expect(input).toBeFocused();
    expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe('hidden');
    await input.fill('Che');
    await input.press('Tab');
    await expect(modal.getByRole('button', { name: 'After modal chooser' })).toBeFocused();
    await expect(input).toHaveValue('Banana');
    await expect(page.getByRole('listbox')).toHaveCount(0);
    await modal.getByRole('button', { name: 'Close fruit editor' }).focus();
    await page.keyboard.press('Tab');
    await expect(modal.getByRole('button', { name: 'Before modal chooser' })).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    await expect(modal.getByRole('button', { name: 'Close fruit editor' })).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(modal).toHaveCount(0);
    await expect(trigger).toBeFocused();
    expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe('');
    await trigger.click();
    await expect(modal.getByRole('combobox')).toHaveValue('Apple');
    await modal.getByRole('button', { name: 'Close fruit editor' }).click();
    await expect(trigger).toBeFocused();
  });
}
