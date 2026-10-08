// Prove SSR nodes are claimed before exercising live forms, panels and native layers; D19/D90.
import type { Page } from '@playwright/test';
import { test, expect } from '../browser-fixture';

/** Require SSR node reuse for every component, including all Tabs descendants. */
async function hydratePage(page: Page, initiallyOpen: false | 'popover' | 'alert' = false) {
  await page.goto(initiallyOpen ? `/${initiallyOpen}/` : '/');
  await expect(page.locator('#hydrate')).toHaveAttribute('data-ready', 'true');
  await expect(page.getByLabel('Email')).toHaveValue('server@example.com');
  await expect(page.getByRole('tab', { name: 'Profile', exact: true })).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('[data-slot="alert-dialog-shell"]')).not.toHaveAttribute('open');
  const selector = '[data-slot]';
  const nodes = await page.locator('#hydration-root').evaluateHandle((root, selector) => Array.from(root.querySelectorAll(selector)), selector);
  const ids = await page.locator('#hydration-root [id]').evaluateAll(elements => elements.map(element => element.id));
  expect(ids.length).toBeGreaterThan(10);
  expect(new Set(ids).size).toBe(ids.length);
  await page.getByRole('button', { name: 'Hydrate components', exact: true }).click();
  await expect(page.locator('#hydration-root')).toHaveAttribute('data-hydrated', 'true');
  expect(await nodes.evaluate(elements => elements.length)).toBeGreaterThan(30);
  expect(await nodes.evaluate(elements => elements.filter(element => !element.isConnected).map(element => element.outerHTML.slice(0, 200)))).toEqual([]);
  expect(await page.locator('#hydration-root [id]').evaluateAll(elements => elements.map(element => element.id))).toEqual(ids);
  expect(await page.locator('#hydration-root').locator(selector).count()).toBe(await nodes.evaluate(elements => elements.length));
  await nodes.dispose();
}

/** Check a live controller points at the exact panel or layer that its user operates. */
async function expectControls(page: Page, controller: string, target: string) {
  const id = await page.locator(target).getAttribute('id');
  expect(id).toBeTruthy();
  await expect(page.locator(controller)).toHaveAttribute('aria-controls', id!);
}

test('hydrates server nodes, edits native forms, rewires labels and resets canonical values', async ({ page }) => {
  await hydratePage(page);
  const email = page.getByLabel('Email');
  const original = await email.elementHandle();
  await page.getByRole('button', { name: 'Change IDs' }).click();
  await expect(email).toHaveAttribute('id', 'email-client');
  expect(await email.evaluate((node, before) => node === before, original)).toBe(true);
  await page.locator('label[for="email-client"]').click();
  await expect(email).toBeFocused();
  await email.fill('edited@example.com');
  await page.getByLabel('Notes', { exact: true }).fill('Edited notes');
  const terms = page.getByRole('checkbox', { name: 'Terms' });
  await expect(terms).toHaveJSProperty('indeterminate', true);
  await terms.press('Space');
  await expect(terms).toBeChecked();
  const updates = page.getByRole('switch', { name: 'Updates' });
  await expect(updates).toBeChecked();
  await updates.press('Space');
  const fruit = page.getByRole('combobox', { name: 'Fruit' });
  await fruit.fill('Ban');await fruit.press('ArrowDown');await fruit.press('Enter');
  await page.getByRole('button', { name: 'Submit preferences' }).click();
  await expect(page.getByTestId('submitted')).toHaveText(JSON.stringify({ email: 'edited@example.com', notes: 'Edited notes', terms: 'on', fruit: 'Banana' }));
  await expect(page.getByTestId('submissions')).toHaveText('1');
  await email.fill('');await page.getByRole('button', { name: 'Submit preferences' }).click();
  await expect(email).toBeFocused();await expect(page.getByTestId('submissions')).toHaveText('1');
  await page.getByRole('button', { name: 'Reset preferences' }).click();
  await expect(email).toHaveValue('server@example.com');await expect(page.getByLabel('Notes', { exact: true })).toHaveValue('Server notes');
  await expect(terms).toHaveJSProperty('indeterminate', true);await expect(terms).not.toBeChecked();await expect(updates).toBeChecked();await expect(fruit).toHaveValue('Apple');
  await page.getByRole('button', { name: 'Submit preferences' }).click();
  await expect(page.getByTestId('submissions')).toHaveText('2');
  await expect(page.getByTestId('submitted')).toHaveText(JSON.stringify({ email: 'server@example.com', notes: 'Server notes', updates: 'on', fruit: 'Apple' }));
});

test('hydrates selected Tabs, preserves mounted drafts and updates both sides of live IDs', async ({ page }) => {
  await hydratePage(page);
  const draft = page.getByLabel('Panel draft');const original = await draft.elementHandle();
  await draft.fill('Hydrated panel draft');
  await page.getByRole('button', { name: 'Change IDs' }).click();
  const profile = page.getByRole('tab', { name: 'Profile', exact: true });
  await expect(profile).toHaveAttribute('id', 'preferences-client-profile-trigger');
  await expectControls(page, '#preferences-client-profile-trigger', '#preferences-client-profile-content');
  await expect(page.locator('#preferences-client-profile-content')).toHaveAttribute('aria-labelledby', 'preferences-client-profile-trigger');
  await profile.focus();await profile.press('ArrowRight');
  await expect(page.getByRole('tab', { name: 'History', exact: true })).toBeFocused();
  await expect(page.getByRole('tabpanel', { name: 'History' })).toHaveText('History content');
  await expect(page.locator('#preferences-client-profile-content')).toBeHidden();
  await page.keyboard.press('ArrowLeft');await expect(profile).toBeFocused();
  await expect(draft).toHaveValue('Hydrated panel draft');
  expect(await draft.evaluate((node, before) => node === before, original)).toBe(true);
});

test('hydrates closed overlays, updates naming, dismisses and restores focus without duplicate actions', async ({ page }) => {
  await hydratePage(page);
  await page.getByRole('button', { name: 'Change IDs' }).click();
  const trigger = page.getByRole('button', { name: 'Open details', exact: true });
  await expectControls(page, '[data-slot="popover-trigger"]:has-text("Open details")', '#details-client');
  await trigger.click();const popup = page.getByRole('dialog', { name: 'Preference details' });
  await expect(popup).toBeVisible();await expect(popup).toHaveAccessibleDescription('Local hydration preview');
  await expect(popup).toHaveAttribute('aria-labelledby', 'details-title-client');
  await expect(page.getByLabel('Popup draft')).toBeFocused();await page.getByLabel('Popup draft').fill('Hydrated popup draft');
  await page.keyboard.press('Escape');await expect(popup).toBeHidden();await expect(trigger).toBeFocused();
  await trigger.click();await expect(page.getByLabel('Popup draft')).toHaveValue('Hydrated popup draft');
  await page.getByLabel('Email').click();await expect(popup).toBeHidden();await expect(page.getByLabel('Email')).toBeFocused();
  const alertTrigger = page.getByRole('button', { name: 'Open confirmation', exact: true });
  await expectControls(page, '[data-slot="alert-dialog-trigger"]', '#confirmation-client');
  await alertTrigger.click();const alert = page.getByRole('alertdialog', { name: 'Confirm preferences' });
  await expect(alert).toHaveAccessibleDescription('Confirm this local preview');
  await expect(alert).toHaveAttribute('aria-labelledby', 'confirmation-title-client');
  await expect(page.getByRole('button', { name: 'Cancel confirmation' })).toBeFocused();
  await page.keyboard.press('Tab');await expect(page.getByRole('button', { name: 'Confirm changes' })).toBeFocused();
  await page.keyboard.press('Tab');await expect(page.getByLabel('Confirmation draft')).toBeFocused();
  await page.getByRole('button', { name: 'Confirm changes' }).click();
  await expect(alert).toBeHidden();await expect(alertTrigger).toBeFocused();await expect(page.getByTestId('confirmed')).toHaveText('1');
  await alertTrigger.click();await page.keyboard.press('Escape');await expect(alertTrigger).toBeFocused();
  await expect(page.locator('html')).not.toHaveCSS('overflow', 'hidden');
});

for (const kind of ['popover', 'alert'] as const) test(`hydrates initially open ${kind} and disposes active ownership`, async ({ page }) => {
  await hydratePage(page, kind);
  const popup = page.locator('#details-server');
  const alert = page.locator('[data-slot="alert-dialog-shell"]');
  const layer = kind === 'alert' ? alert : popup;
  const trigger = page.getByRole('button', { name: kind === 'alert' ? 'Open confirmation' : 'Open details', exact: true });
  await expect(layer).toBeVisible();
  if (kind === 'alert') {
    await expect(alert).toHaveAttribute('open');
    await expect(page.getByRole('button', { name: 'Cancel confirmation' })).toBeFocused();
    await expect(page.locator('html')).toHaveCSS('overflow', 'hidden');
  } else {
    expect(await popup.evaluate(node => node.matches(':popover-open'))).toBe(true);
    await expect(page.getByLabel('Popup draft')).toBeFocused();
  }
  await page.keyboard.press('Escape');await expect(layer).toBeHidden();await expect(trigger).toBeFocused();
  await trigger.click();await expect(layer).toBeVisible();
  // A modal blocks external harness clicks; call the same disposal command directly in both variants.
  await page.locator('#dispose').evaluate((node: HTMLButtonElement) => node.click());
  await expect(page.locator('#hydration-root')).toBeEmpty();await expect(page.locator('html')).not.toHaveCSS('overflow', 'hidden');
  await page.locator('#hydrate').evaluate((node: HTMLButtonElement) => { node.disabled = false;node.focus(); });
  await expect(page.locator('#hydrate')).toBeFocused();
});
