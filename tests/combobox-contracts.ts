// Run the same native form/ownership contracts against source and built exports; D19/D90.
import { test, expect } from './browser-fixture';

/** Register CMB-1 browser scenarios without synthetic form or popover adapters. */
export function comboboxContracts() {
  for (const mode of ['Uncontrolled', 'Controlled']) {
    test(`${mode} multiple values submit, remove, clear and reset to their defaults`, async ({ page }) => {
      await page.goto('/?combobox-contracts');
      const form = page.getByRole('form', { name: `${mode} collection`, exact: true });
      const input = form.getByRole('combobox');
      const output = form.getByLabel('Submitted collection');
      await expect(form.getByRole('button', { name: 'Remove Apple' })).toBeVisible();
      await input.fill('Ban');
      await input.press('ArrowDown');
      await input.press('Enter');
      await expect(form.getByRole('button', { name: 'Remove Banana' })).toBeVisible();
      await input.press('Escape');
      await form.getByRole('button', { name: 'Submit collection' }).click();
      await expect(output).toHaveText('["Apple","Banana"]');
      await form.getByRole('button', { name: 'Remove Apple' }).click();
      await form.getByRole('button', { name: 'Submit collection' }).click();
      await expect(output).toHaveText('["Banana"]');
      await form.getByRole('button', { name: 'Reset collection' }).click();
      await expect(form.getByRole('button', { name: 'Remove Apple' })).toBeVisible();
      await expect(form.getByRole('button', { name: 'Remove Banana' })).toHaveCount(0);
      await expect(input).toHaveValue('');
      await form.getByRole('button', { name: 'Submit collection' }).click();
      await expect(output).toHaveText('["Apple"]');
      await form.getByRole('button', { name: 'Clear collection' }).click();
      await expect(form.locator('[data-slot="combobox-chip"]')).toHaveCount(0);
      await form.getByRole('button', { name: 'Submit collection' }).click();
      await expect(output).toHaveText('[]');
      await form.getByRole('button', { name: 'Reset collection' }).click();
      await expect(form.getByRole('button', { name: 'Remove Apple' })).toBeVisible();
      await form.getByRole('button', { name: 'Submit collection' }).click();
      await expect(output).toHaveText('["Apple"]');
    });
  }

  test('object result replacement preserves stable-key selection and native form reset', async ({ page }) => {
    await page.goto('/?combobox-contracts');
    const form = page.getByRole('form', { name: 'Object results', exact: true });
    const input = form.getByRole('combobox');
    const output = form.getByLabel('Submitted workspace');
    await form.getByRole('button', { name: 'Replace results' }).click();
    await input.press('ArrowDown');
    await expect(page.getByRole('option', { name: 'North studio refreshed', exact: true })).toHaveAttribute('aria-selected', 'true');
    await page.getByRole('option', { name: 'South studio refreshed', exact: true }).click();
    await expect(input).toHaveValue('South studio refreshed');
    await form.getByRole('button', { name: 'Submit workspace' }).click();
    await expect(output).toHaveText('["south"]');
    await form.getByRole('button', { name: 'Empty results' }).click();
    await input.press('ArrowDown');
    await expect(page.getByText('No workspaces available.')).toBeVisible();
    await expect(page.getByRole('option')).toHaveCount(0);
    await expect(input).toHaveValue('South studio refreshed');
    await input.press('Escape');
    await form.getByRole('button', { name: 'Submit workspace' }).click();
    await expect(output).toHaveText('["south"]');
    await form.getByRole('button', { name: 'Replace results' }).click();
    await input.press('ArrowDown');
    await expect(page.getByRole('option', { name: 'South studio refreshed', exact: true })).toHaveAttribute('aria-selected', 'true');
    await input.press('Escape');
    await form.getByRole('button', { name: 'Reset workspace' }).click();
    await expect(input).toHaveValue('North studio');
    await form.getByRole('button', { name: 'Submit workspace' }).click();
    await expect(output).toHaveText('["north"]');
  });

  test('rejected controlled opening, query and dismissal retain owner state until an owner update', async ({ page }) => {
    await page.goto('/?combobox-contracts');
    const form = page.getByRole('form', { name: 'Rejected controlled requests', exact: true });
    const input = form.getByRole('combobox');
    await input.press('ArrowDown');
    await expect(form.getByLabel('Requested open')).toHaveText('true');
    await expect(input).toHaveAttribute('aria-expanded', 'false');
    await expect(page.getByRole('listbox')).toHaveCount(0);
    await form.getByRole('button', { name: 'Owner opens', exact: true }).click();
    await expect(input).toBeFocused();
    await expect(input).toHaveAttribute('aria-expanded', 'true');
    await input.fill('Ban');
    await expect(form.getByLabel('Requested query')).toHaveText('"Ban"');
    await expect(input).toHaveValue('App');
    await expect(page.getByRole('option')).toHaveCount(1);
    await expect(page.getByRole('option')).toHaveAccessibleName('Apple');
    await input.press('Escape');
    await expect(form.getByLabel('Requested open')).toHaveText('false');
    await expect(input).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByRole('listbox')).toBeVisible();
    await expect(input).toHaveValue('App');
    await form.getByRole('button', { name: 'Owner searches Banana' }).click();
    await expect(input).toHaveValue('Ban');
    await page.getByRole('option', { name: 'Banana', exact: true }).click();
    await expect(form.getByLabel('Requested value')).toHaveText('Banana');
    await expect(input).toHaveValue('Ban');
    await expect(page.getByRole('option', { name: 'Banana', exact: true })).toHaveAttribute('aria-selected', 'false');
    await expect(input).toHaveAttribute('aria-expanded', 'true');
    await form.getByRole('button', { name: 'Owner closes', exact: true }).click();
    await expect(input).toHaveAttribute('aria-expanded', 'false');
    await expect(page.getByRole('listbox')).toHaveCount(0);
    await form.getByRole('button', { name: 'Submit owned fruit' }).click();
    await expect(form.getByLabel('Submitted owned fruit')).toHaveText('["Apple"]');
    await expect(input).toHaveValue('Ban');
  });
}
