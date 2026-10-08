// ALT-1 exact focus destinations shared by source and built browser suites; D19/D90.
import type { Locator, Page } from '@playwright/test';
import { test, expect } from './browser-fixture';

/** Drive native sequential navigation and require the named destination at every step. */
async function step(page: Page, key: string, target: Locator) {
  await page.keyboard.press(key);
  await expect(target).toBeFocused();
}

/** Open by keyboard and verify the parent's least-destructive initial focus. */
async function openParent(page: Page, forceMount = false) {
  await page.goto(`/?alert-dialog-focus${forceMount ? '&force-mounted' : ''}`);
  const originalOverflow = await page.evaluate(() => document.documentElement.style.overflow);
  const trigger = page.getByRole('button', { name: 'Open parent confirmation', exact: true });
  await trigger.press('Enter');
  const parent = page.getByRole('alertdialog', { name: 'Parent confirmation', exact: true });
  await expect(parent).toBeVisible();
  await expect(parent).toHaveAttribute('aria-modal', 'true');
  await expect(parent).toHaveAccessibleDescription('Your local draft stays available after closing the nested confirmation.');
  await expect(page.getByRole('button', { name: 'Cancel parent', exact: true })).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe('hidden');
  return { parent, trigger, originalOverflow };
}

/** Prove exact forward/reverse boundaries and nested dismissal ownership. */
export function alertDialogFocus() {
  test('Alert Dialog wraps both Tab boundaries and skips disabled, hidden and negative-tabindex controls', async ({ page }) => {
    const { parent, trigger, originalOverflow } = await openParent(page);
    const first = page.getByRole('textbox', { name: 'Parent draft' });
    const nestedTrigger = page.getByRole('button', { name: 'Open nested confirmation', exact: true });
    const cancel = page.getByRole('button', { name: 'Cancel parent', exact: true });
    const last = page.getByRole('button', { name: 'Confirm parent', exact: true });
    await step(page, 'Tab', last);
    await step(page, 'Tab', first);
    await step(page, 'Tab', nestedTrigger);
    await step(page, 'Tab', cancel);
    await step(page, 'Shift+Tab', nestedTrigger);
    await step(page, 'Shift+Tab', first);
    await step(page, 'Shift+Tab', last);
    await step(page, 'Shift+Tab', cancel);
    // Native background inertness must reject a programmatic focus attempt too.
    await page.getByRole('button', { name: 'After dialog', includeHidden: true }).evaluate(node => node.focus());
    await expect(cancel).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(parent).toHaveCount(0);
    await expect(trigger).toBeFocused();
    expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe(originalOverflow);
    await step(page, 'Tab', page.getByRole('button', { name: 'After dialog' }));
  });

  const cases = [
    { dismissal: 'Escape', forceMount: false },
    { dismissal: 'Cancel', forceMount: false },
    { dismissal: 'Confirm', forceMount: false },
    { dismissal: 'Escape', forceMount: true },
  ] as const;
  for (const { dismissal, forceMount } of cases) {
    test(`nested Alert Dialog wraps focus and ${dismissal} restores its parent${forceMount ? ' with force-mounted content' : ''}`, async ({ page }) => {
      const { parent, trigger, originalOverflow } = await openParent(page, forceMount);
      const draft = page.getByRole('textbox', { name: 'Parent draft' });
      await draft.fill('Edited parent draft');
      const nestedTrigger = page.getByRole('button', { name: 'Open nested confirmation', exact: true });
      await step(page, 'Tab', nestedTrigger);
      await page.keyboard.press('Enter');
      const child = page.getByRole('alertdialog', { name: 'Nested confirmation', exact: true });
      const cancel = page.getByRole('button', { name: 'Cancel nested', exact: true });
      const action = page.getByRole('button', { name: 'Confirm nested', exact: true });
      await expect(child).toBeVisible();
      await expect(child).toHaveAttribute('aria-modal', 'true');
      await expect(child).toHaveAccessibleDescription('Only this confirmation closes when you choose an action or press Escape.');
      await expect(cancel).toBeFocused();
      await step(page, 'Shift+Tab', action);
      await step(page, 'Shift+Tab', cancel);
      await step(page, 'Tab', action);
      await step(page, 'Tab', cancel);
      // Even the underlying modal is inert until its child closes.
      await page.locator('#parent-draft').evaluate(node => (node as HTMLInputElement).focus());
      await expect(cancel).toBeFocused();
      if (dismissal === 'Confirm') await step(page, 'Tab', action);
      await page.keyboard.press(dismissal === 'Escape' ? 'Escape' : 'Enter');
      await expect(child).toBeHidden();
      if (forceMount) await expect(page.getByTestId('nested-content')).toBeAttached();
      else await expect(page.getByTestId('nested-content')).toHaveCount(0);
      await expect(parent).toBeVisible();
      await expect(nestedTrigger).toBeFocused();
      await expect(draft).toHaveValue('Edited parent draft');
      expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe('hidden');
      await step(page, 'Shift+Tab', draft);
      await step(page, 'Shift+Tab', page.getByRole('button', { name: 'Confirm parent', exact: true }));
      await step(page, 'Tab', draft);
      // Reopen after cleanup, then cancel the child and parent through separate owners.
      await step(page, 'Tab', nestedTrigger);
      await page.keyboard.press('Enter');
      await expect(cancel).toBeFocused();
      await page.keyboard.press('Enter');
      await expect(nestedTrigger).toBeFocused();
      await step(page, 'Tab', page.getByRole('button', { name: 'Cancel parent', exact: true }));
      await page.keyboard.press('Enter');
      await expect(parent).toHaveCount(0);
      await expect(trigger).toBeFocused();
      expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe(originalOverflow);
      await step(page, 'Shift+Tab', page.getByRole('button', { name: 'Before dialog' }));
    });
  }

  test('a queued native close event cannot dismiss a reopened force-mounted Alert Dialog', async ({ page }, testInfo) => {
    const { parent, trigger, originalOverflow } = await openParent(page, true);
    const draft = page.getByRole('textbox', { name: 'Parent draft' });
    await draft.fill('Draft survives rapid reopen');
    const draftNode = await draft.elementHandle();
    const nestedTrigger = page.getByRole('button', { name: 'Open nested confirmation', exact: true });
    await nestedTrigger.press('Enter');
    const cancel = page.getByRole('button', { name: 'Cancel nested', exact: true });
    await expect(cancel).toBeFocused();
    // Reopen as soon as native close removes `open`, before its queued close event.
    // Only timing is controlled: the browser's close(), event and showModal() stay real.
    const observation = await page.getByTestId('nested-content').evaluate(async content => {
      const dialog = content.closest('dialog')!;
      const opener = dialog.parentElement!.querySelector<HTMLButtonElement>('[aria-controls="' + content.id + '"]')!;
      const cancelButton = content.querySelector<HTMLButtonElement>('[data-slot="alert-dialog-cancel"]')!;
      let reopened = false;
      const observer = new MutationObserver(() => {
        if (!dialog.open && !reopened) {
          reopened = true;observer.disconnect();opener.click();
        }
      });
      observer.observe(dialog, { attributes: true, attributeFilter: ['open'] });
      const delivered = new Promise<{ trusted: boolean; openWhenDelivered: boolean }>(resolve => {
        dialog.addEventListener('close', event => resolve({ trusted: event.isTrusted, openWhenDelivered: dialog.open }), { once: true, capture: true });
      });
      cancelButton.click();
      const event = await delivered;
      await new Promise<void>(done => requestAnimationFrame(() => done()));
      await new Promise<void>(done => requestAnimationFrame(() => done()));
      observer.disconnect();
      return { ...event, reopened, openAfterDelivery: dialog.open };
    });
    await testInfo.attach('native-close-order', { body: JSON.stringify(observation), contentType: 'application/json' });
    expect(observation).toEqual({ trusted: true, openWhenDelivered: true, reopened: true, openAfterDelivery: true });
    await expect(cancel).toBeFocused();await expect(nestedTrigger).toHaveAttribute('aria-expanded', 'true');
    await expect(draft).toHaveValue('Draft survives rapid reopen');
    expect(await draft.evaluate((node, original) => node === original, draftNode)).toBe(true);
    expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe('hidden');
    // A genuine external close still reaches the owner, then keyboard reopening remains usable.
    await page.getByTestId('nested-content').evaluate(content => content.closest('dialog')!.close());
    await expect(nestedTrigger).toHaveAttribute('aria-expanded', 'false');await expect(nestedTrigger).toBeFocused();
    await expect(parent).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe('hidden');
    await nestedTrigger.press('Enter');await expect(cancel).toBeFocused();
    await page.keyboard.press('Enter');await expect(nestedTrigger).toBeFocused();
    await expect(parent).toBeVisible();
    await page.getByRole('button', { name: 'Cancel parent', exact: true }).press('Enter');
    await expect(parent).toHaveCount(0);await expect(trigger).toBeFocused();
    expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe(originalOverflow);
  });

}
