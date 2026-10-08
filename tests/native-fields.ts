// INP-1/TXT-1/LBL-1 native constraints, textarea geometry and label ownership; D19/D90.
import type { Locator, Page } from '@playwright/test';
import { test, expect } from './browser-fixture';

/** Read the browser's validity flags rather than duplicating HTML validation rules. */
async function expectValidity(input: Locator, flag: keyof ValidityState) {
  expect(await input.evaluate((node, key) => (node as HTMLInputElement).validity[key], flag)).toBe(true);
}

/** Submit the real form and inspect only the field under test. */
async function expectSubmitted(page: Page, key: string, value: string) {
  await page.getByRole('button', { name: 'Submit native values' }).click();
  await expect.poll(async () => JSON.parse(await page.getByTestId('native-values').textContent() || '{}')[key]).toBe(value);
}

/** Register browser-owned field contracts through source and built exports. */
export function nativeFields() {
  test('number Input enforces required, bounds and step and restores its native default', async ({ page }) => {
    await page.goto('/?native-fields');
    const input = page.getByRole('spinbutton', { name: 'Quantity' });
    for (const [value, flag] of [['', 'valueMissing'], ['0', 'rangeUnderflow'], ['10', 'rangeOverflow'], ['4', 'stepMismatch']] as const) {
      await input.fill(value);
      await expectValidity(input, flag);
      await page.getByRole('button', { name: 'Submit native values' }).click();
      await expect(input).toBeFocused();
      await expect(page.getByTestId('native-values')).toBeEmpty();
    }
    await input.fill('5');
    await input.press('ArrowUp');
    await expect(input).toHaveValue('7');
    await expectSubmitted(page, 'quantity', '7');
    await page.getByRole('button', { name: 'Reset native values' }).click();
    await expect(input).toHaveValue('3');
    await expectSubmitted(page, 'quantity', '3');
  });

  for (const field of [
    { name: 'Date', key: 'date', type: 'date', invalid: '2026-10-11', valid: '2026-10-09', initial: '2026-10-08' },
    { name: 'Time', key: 'time', type: 'time', invalid: '19:00', valid: '10:30', initial: '09:00' },
    { name: 'Local date and time', key: 'local', type: 'datetime-local', invalid: '2026-10-08T19:00', valid: '2026-10-08T10:30', initial: '2026-10-08T09:00' },
  ]) {
    test(`${field.type} Input validates bounds and submits and resets its native string value`, async ({ page }) => {
      await page.goto('/?native-fields');
      const input = page.getByLabel(field.name, { exact: true });
      await expect(input).toHaveJSProperty('type', field.type);
      await input.fill(field.invalid);
      await expectValidity(input, 'rangeOverflow');
      await page.getByRole('button', { name: 'Submit native values' }).click();
      await expect(input).toBeFocused();
      await expect(page.getByTestId('native-values')).toBeEmpty();
      await input.fill(field.valid);
      await expectValidity(input, 'valid');
      await expectSubmitted(page, field.key, field.valid);
      await page.getByRole('button', { name: 'Reset native values' }).click();
      await expect(input).toHaveValue(field.initial);
      await expectSubmitted(page, field.key, field.initial);
    });
  }

  test('range Input uses keyboard steps and limits and serializes and resets its value', async ({ page }) => {
    await page.goto('/?native-fields');
    const input = page.getByRole('slider', { name: 'Level' });
    await input.focus();
    await input.press('ArrowRight');
    await expect(input).toHaveValue('6');
    await input.press('End');
    await input.press('ArrowRight');
    await expect(input).toHaveValue('10');
    await expectSubmitted(page, 'range', '10');
    await input.press('Home');
    await input.press('ArrowLeft');
    await expect(input).toHaveValue('0');
    await expectSubmitted(page, 'range', '0');
    await page.getByRole('button', { name: 'Reset native values' }).click();
    await expect(input).toHaveValue('4');
  });

  test('text-like Input types retain native values and email and URL reject invalid submission', async ({ page }) => {
    await page.goto('/?native-fields');
    const values = { text: 'Draft name', search: 'Find delivery', tel: '+90 555 010 0200', url: 'https://example.com/notes', password: 'local-example-only', email: 'team@example.com' };
    for (const [type, value] of Object.entries(values)) {
      const input = page.getByLabel(`${type} value`, { exact: true });
      await expect(input).toHaveJSProperty('type', type);
      await input.fill(value);
    }
    for (const type of ['url', 'email'] as const) {
      const input = page.getByLabel(`${type} value`, { exact: true });
      await input.fill('invalid');
      await expectValidity(input, 'typeMismatch');
      await page.getByRole('button', { name: 'Submit native values' }).click();
      await expect(input).toBeFocused();
      await expect(page.getByTestId('native-values')).toBeEmpty();
      await input.fill(values[type]);
    }
    await page.getByRole('button', { name: 'Submit native values' }).click();
    expect(JSON.parse(await page.getByTestId('native-values').textContent() || '{}')).toMatchObject(values);
    await page.getByRole('button', { name: 'Reset native values' }).click();
    for (const type of Object.keys(values)) await expect(page.getByLabel(`${type} value`, { exact: true })).toHaveValue('');
  });

  test('read-only Textarea remains focusable, scrollable and submitted, then accepts edits when unlocked', async ({ page }) => {
    await page.goto('/?native-fields&textarea');
    const notes = page.getByRole('textbox', { name: 'Scrollable notes' });
    const original = await notes.inputValue();
    await page.locator('label[for="notes"]').click();
    await expect(notes).toBeFocused();
    await page.keyboard.type('Cannot replace the draft');
    await expect(notes).toHaveValue(original);
    expect(await notes.evaluate(node => node.scrollHeight > node.clientHeight)).toBe(true);
    await notes.hover();
    await page.mouse.wheel(0, 300);
    await expect.poll(() => notes.evaluate(node => node.scrollTop)).toBeGreaterThan(0);
    await page.getByRole('button', { name: 'Submit notes' }).click();
    await expect(page.getByTestId('notes-value')).toHaveText(original);
    await page.getByRole('button', { name: 'Allow editing' }).click();
    await notes.fill('Edited after unlocking');
    await page.getByRole('button', { name: 'Submit notes' }).click();
    await expect(page.getByTestId('notes-value')).toHaveText('Edited after unlocking');
  });

  for (const narrow of [false, true]) {
    test(`Textarea supports actual pointer resizing in ${narrow ? 'narrow enlarged' : 'desktop'} layout`, async ({ page }) => {
      if (narrow) await page.setViewportSize({ width: 390, height: 844 });
      await page.goto('/?native-fields&textarea');
      if (narrow) await page.evaluate(() => { document.documentElement.style.fontSize = '24px'; });
      const notes = page.getByRole('textbox', { name: 'Scrollable notes' });
      const value = await notes.inputValue();
      const before = await notes.boundingBox();
      if (!before) throw new Error('Expected a visible textarea');
      await page.mouse.move(before.x + before.width - 3, before.y + before.height - 3);
      await page.mouse.down();
      await page.mouse.move(before.x + before.width - 3, before.y + before.height + 70, { steps: 12 });
      await page.mouse.up();
      await expect.poll(async () => (await notes.boundingBox())!.height).toBeGreaterThan(before.height + 30);
      const after = (await notes.boundingBox())!;
      expect(Math.abs(after.width - before.width)).toBeLessThan(2);
      await expect(notes).toHaveValue(value);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.getByRole('button', { name: 'Allow editing' }).click();
      await notes.fill('Still usable after resizing');
    });
  }

  test('Label follows live for and ID reassociation without losing drafts or activating a disabled target', async ({ page, browserName }) => {
    await page.goto('/?native-fields&labels');
    const label = page.getByTestId('live-label');
    const first = page.getByTestId('first-draft');
    const second = page.getByTestId('second-draft');
    const firstNode = await first.elementHandle();
    const secondNode = await second.elementHandle();
    if (!firstNode || !secondNode) throw new Error('Expected both native draft fields');
    await label.click();
    await expect(first).toBeFocused();
    await expect(first).toHaveAccessibleName('Active draft');
    await first.fill('Keep input edits');
    await second.fill('Keep textarea edits');
    await page.getByRole('button', { name: 'Move label' }).click();
    await label.click();
    await expect(second).toBeFocused();
    expect(await label.evaluate((node, target) => (node as HTMLLabelElement).control === target, secondNode)).toBe(true);
    // Firefox retains stale native labels collections after reassociation; see delivery evidence.
    if (browserName === 'chromium') {
      await expect(second).toHaveAccessibleName('Active draft');
      await expect(first).toHaveAccessibleName('');
    }
    await page.getByRole('button', { name: 'Rename textarea ID' }).click();
    await expect(label).toHaveAttribute('for', 'renamed-notes');
    await expect(second).toHaveAttribute('id', 'renamed-notes');
    await label.click();
    await expect(second).toBeFocused();
    await page.getByRole('button', { name: 'Disable textarea' }).click();
    // Locator clicks reject labels whose target is disabled before dispatching input.
    const labelBox = await label.boundingBox();
    if (!labelBox) throw new Error('Expected a visible label');
    await page.mouse.click(labelBox.x + labelBox.width / 2, labelBox.y + labelBox.height / 2);
    await expect(second).toBeDisabled();
    await expect(second).not.toBeFocused();
    await page.getByRole('button', { name: 'Enable textarea' }).click();
    await label.click();
    await expect(second).toBeFocused();
    await page.getByRole('button', { name: 'Move label' }).click();
    await label.click();
    await expect(first).toBeFocused();
    expect(await label.evaluate((node, target) => (node as HTMLLabelElement).control === target, firstNode)).toBe(true);
    if (browserName === 'chromium') {
      await expect(first).toHaveAccessibleName('Active draft');
      await expect(second).toHaveAccessibleName('');
    }
    await expect(first).toHaveValue('Keep input edits');
    await expect(second).toHaveValue('Keep textarea edits');
    expect(await first.evaluate((node, saved) => node === saved, firstNode)).toBe(true);
    expect(await second.evaluate((node, saved) => node === saved, secondNode)).toBe(true);
  });
}
