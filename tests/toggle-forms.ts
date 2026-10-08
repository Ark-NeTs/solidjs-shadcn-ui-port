// CHK-1/SWT-1 native reset cancellation, association and disposal contracts; D19/D90.
import type { Page } from '@playwright/test';
import { test, expect } from './browser-fixture';

/** Read actual successful controls from both forms, independently of visual state. */
async function expectValues(page: Page, first: string | null, second: string | null) {
  const values = await page.locator('form').evaluateAll(forms => forms.map(form => new FormData(form as HTMLFormElement).get('preference')));
  expect(values).toEqual([first, second]);
}

/** Assert native checked/mixed state and the public ARIA/styling contract together. */
async function expectState(page: Page, state: boolean | 'indeterminate', requests: Array<boolean | 'indeterminate'>) {
  // Cross a browser task boundary before checking that deferred work had no effect.
  await page.evaluate(() => new Promise<void>(resolve => setTimeout(resolve, 0)));
  const input = page.getByLabel('Preference', { exact: true });
  await expect(input).toHaveJSProperty('checked', state === true);
  await expect(input).toHaveJSProperty('indeterminate', state === 'indeterminate');
  await expect(input).toHaveAttribute('aria-checked', state === 'indeterminate' ? 'mixed' : String(state));
  await expect(input).toHaveAttribute('data-state', state === 'indeterminate' ? state : state ? 'checked' : 'unchecked');
  await expect(page.getByTestId('requests')).toHaveText(JSON.stringify(requests.map(String)));
}

/** Run identical native-browser contracts through source and built package exports. */
export function toggleForms() {
  for (const kind of ['Checkbox', 'Switch']) {
    const url = `/?toggle-forms${kind === 'Switch' ? '&switch' : ''}`;
    test(`${kind} honors bubbling reset cancellation and recovers on an allowed reset`, async ({ page }) => {
      await page.goto(url);
      const input = page.getByLabel('Preference', { exact: true });
      await expectState(page, true, []);
      await expectValues(page, 'yes', null);
      await input.focus();
      await page.keyboard.press('Space');
      await expectState(page, false, [false]);
      await page.getByRole('button', { name: 'Reset first', exact: true }).click();
      await expectState(page, false, [false]);
      await expectValues(page, null, null);
      await page.getByRole('button', { name: 'Allow resets' }).click();
      await page.getByRole('button', { name: 'Reset first', exact: true }).click();
      await expectState(page, true, [false, true]);
      await expectValues(page, 'yes', null);
      await page.getByRole('button', { name: 'Reset first', exact: true }).click();
      await expectState(page, true, [false, true]);
    });

    test(`${kind} rebinds explicit ownership, detaches and returns to its ancestor without remounting`, async ({ page }) => {
      await page.goto(url);
      await page.getByRole('button', { name: 'Allow resets' }).click();
      const input = page.getByLabel('Preference', { exact: true });
      const original = await input.elementHandle();
      if (!original) throw new Error('Expected a native preference control');
      await page.getByRole('button', { name: 'Own by second' }).click();
      expect(await input.evaluate(node => (node as HTMLInputElement).form?.id)).toBe('second');
      await expectValues(page, null, 'yes');
      await input.click();
      await page.getByRole('button', { name: 'Reset first', exact: true }).click();
      await expectState(page, false, [false]);
      await page.getByRole('button', { name: 'Reset second', exact: true }).click();
      await expectState(page, true, [false, true]);
      await input.click();
      await page.getByRole('button', { name: 'Detach from forms' }).click();
      await expect(input).toHaveJSProperty('form', null);
      await page.getByRole('button', { name: 'Reset first', exact: true }).click();
      await page.getByRole('button', { name: 'Reset second', exact: true }).click();
      await expectState(page, false, [false, true, false]);
      await input.click();
      await expectValues(page, null, null);
      await page.getByRole('button', { name: 'Use ancestor form' }).click();
      expect(await input.evaluate(node => (node as HTMLInputElement).form?.id)).toBe('first');
      await expectValues(page, 'yes', null);
      await input.click();
      await page.getByRole('button', { name: 'Reset second', exact: true }).click();
      await expectState(page, false, [false, true, false, true, false]);
      await page.getByRole('button', { name: 'Reset first', exact: true }).click();
      await expectState(page, true, [false, true, false, true, false, true]);
      expect(await input.evaluate((node, saved) => node === saved, original)).toBe(true);
    });

    test(`${kind} discards queued reset work after reassociation or unmount and remounts cleanly`, async ({ page }) => {
      await page.goto(url);
      await page.getByRole('button', { name: 'Allow resets' }).click();
      await page.getByRole('button', { name: 'Own by second' }).click();
      const input = page.getByLabel('Preference', { exact: true });
      await input.click();
      await page.getByRole('button', { name: 'Reset second then reassign' }).click();
      // The native reset already changed checked; local/ARIA must stay authoritative.
      await expectState(page, false, [false]);
      await expectValues(page, null, null);
      await page.getByRole('button', { name: 'Own by second' }).click();
      await page.getByRole('button', { name: 'Reset second then unmount' }).click();
      await expect(input).toHaveCount(0);
      await page.evaluate(() => new Promise<void>(resolve => setTimeout(resolve, 0)));
      await expect(page.getByTestId('requests')).toHaveText('["false"]');
      await page.getByRole('button', { name: 'Reset second', exact: true }).click();
      await expect(page.getByTestId('requests')).toHaveText('["false"]');
      await page.getByRole('button', { name: 'Remount' }).click();
      await expectState(page, true, [false]);
      await expectValues(page, null, 'yes');
      await input.click();
      await page.getByRole('button', { name: 'Reset second', exact: true }).click();
      await expectState(page, true, [false, false, true]);
    });
  }

  test('Checkbox preserves mixed semantics on canceled reset and restores them on allowed reset', async ({ page }) => {
    await page.goto('/?toggle-forms&mixed');
    await expectState(page, 'indeterminate', []);
    await page.getByLabel('Preference', { exact: true }).click();
    await expectState(page, true, [true]);
    await page.getByRole('button', { name: 'Reset first', exact: true }).click();
    await expectState(page, true, [true]);
    await expectValues(page, 'yes', null);
    await page.getByRole('button', { name: 'Allow resets' }).click();
    await page.getByRole('button', { name: 'Reset first', exact: true }).click();
    await expectState(page, 'indeterminate', [true, 'indeterminate']);
    await expectValues(page, null, null);
  });
}
