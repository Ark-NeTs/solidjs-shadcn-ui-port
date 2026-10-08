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
  const fruit = page.getByRole('combobox', { name: 'Fruit', exact: true });
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


test('hydrates disclosures with stable owner IDs, retained drafts and ordinary remounts', async ({ page }) => {
  await hydratePage(page);
  const trigger = page.getByRole('button', { name: 'Hydrated draft section' });
  const draft = page.getByLabel('Accordion draft');const original = await draft.elementHandle();
  await draft.fill('Keep hydrated disclosure edits');
  await page.getByRole('button', { name: 'Change IDs' }).click();
  await expect(trigger).toHaveAttribute('id', 'disclosure-trigger-client');
  await expectControls(page, '#disclosure-trigger-client', '#disclosure-content-client');
  await expect(page.locator('#disclosure-content-client')).toHaveAttribute('aria-labelledby', 'disclosure-trigger-client');
  await trigger.press('ArrowDown');const other = page.getByRole('button', { name: 'Hydrated other section' });
  await expect(other).toBeFocused();await other.press('Enter');await expect(draft).toBeHidden();
  await trigger.press('Space');await expect(draft).toHaveValue('Keep hydrated disclosure edits');
  expect(await draft.evaluate((node, before) => node === before, original)).toBe(true);
  const optional = page.getByRole('button', { name: 'Hydrated optional section' });
  const temporary = page.getByLabel('Collapsible draft');const removed = await temporary.elementHandle();
  await temporary.fill('Discard this draft');await optional.press('Enter');await expect(temporary).toHaveCount(0);
  expect(await removed!.evaluate(node => node.isConnected)).toBe(false);
  await optional.press('Space');await expect(temporary).toHaveValue('Server collapsible draft');
  await page.getByRole('button', { name: 'Dispose components', exact: true }).click();
  await expect(page.locator('#hydration-root')).toBeEmpty();
});


test('hydrates preview shells and IDs before focus, dismissal, link navigation and disposal', async ({ page }) => {
  await hydratePage(page);
  const trigger = page.getByRole('button', { name: 'Hydrated help' });
  const tip = page.locator('#hydrated-tip-server');const original = await tip.elementHandle();
  await page.getByRole('button', { name: 'Change IDs' }).click();await trigger.focus();
  await expect(trigger).toHaveAttribute('aria-describedby', 'hydrated-tip-client');
  await expect(page.getByRole('tooltip')).toHaveText('Hydrated description');
  expect(await page.locator('#hydrated-tip-client').evaluate((node, before) => node === before, original)).toBe(true);
  await page.keyboard.press('Escape');await expect(trigger).toBeFocused();await expect(page.getByRole('tooltip')).toBeHidden();
  const link = page.getByRole('link', { name: 'Hydrated profile', exact: true });await link.focus();
  await expect(link).toHaveAttribute('aria-describedby', 'hydrated-card-client');
  await expect(page.getByRole('link', { name: 'View hydrated profile' })).toBeVisible();
  await link.press('Enter');await expect(page).toHaveURL(/#hydrated-profile$/);
  await page.getByRole('button', { name: 'Dispose components' }).click();await expect(page.locator('#hydration-root')).toBeEmpty();
});


test('hydrates radios and pressed buttons before keyboard selection, owner updates and disposal',async({page})=>{
 await hydratePage(page);const pickup=page.getByRole('radio',{name:'Hydrated pickup'});const shipping=page.getByRole('radio',{name:'Hydrated shipping'});await expect(pickup).toBeChecked();await pickup.focus();await pickup.press('ArrowDown');await expect(shipping).toBeFocused();await expect(shipping).toBeChecked();
 const bold=page.getByRole('button',{name:'Hydrated bold'});await expect(bold).toHaveAttribute('aria-pressed','true');await bold.press('Space');await expect(bold).toHaveAttribute('aria-pressed','false');
 const left=page.getByRole('button',{name:'Hydrated left'});const right=page.getByRole('button',{name:'Hydrated right'});await left.focus();await left.press('ArrowRight');await expect(right).toBeFocused();await expect(right).toHaveAttribute('aria-pressed','false');await right.press('Enter');await expect(left).toHaveAttribute('aria-pressed','true');await expect(right).toHaveAttribute('aria-pressed','true');await page.getByRole('button',{name:'Dispose components'}).click();await expect(page.locator('#hydration-root')).toBeEmpty();
});


test('hydrates Select labels and native values before selecting, resetting, dismissing and disposal',async({page})=>{
 await hydratePage(page);const trigger=page.getByRole('combobox',{name:'Hydrated fruit',exact:true});await expect(trigger).toHaveText('Apple⌄');await trigger.press('ArrowDown');await trigger.press('End');await trigger.press('Enter');await expect(trigger).toHaveText('Cherry⌄');expect(await page.locator('#hydrated-select-form').evaluate((form:HTMLFormElement)=>new FormData(form).get('fruit'))).toBe('cherry');await page.getByRole('button',{name:'Reset hydrated fruit'}).click();await expect(trigger).toHaveText('Apple⌄');await trigger.press('Space');await trigger.press('Escape');await expect(trigger).toHaveAttribute('aria-expanded','false');await expect(trigger).toBeFocused();await page.getByRole('button',{name:'Dispose components'}).click();await expect(page.locator('#hydration-root')).toBeEmpty();
});

test('hydrates Slider thumbs and values before keyboard adjustment, form reset and disposal',async({page})=>{
 await hydratePage(page);const low=page.getByRole('slider',{name:'Hydrated minimum',exact:true});const high=page.getByRole('slider',{name:'Hydrated maximum',exact:true});await low.press('End');await expect(low).toHaveAttribute('aria-valuenow','70');await low.press('Tab');await expect(high).toBeFocused();await high.press('End');expect(await page.locator('#hydrated-slider-form').evaluate((f:HTMLFormElement)=>new FormData(f).getAll('range'))).toEqual(['70','100']);await page.getByRole('button',{name:'Reset hydrated range'}).click();await expect(low).toHaveAttribute('aria-valuenow','20');await expect(high).toHaveAttribute('aria-valuenow','80');await page.getByRole('button',{name:'Dispose components'}).click();await expect(page.locator('#hydration-root')).toBeEmpty();
});

test('hydrates Progress naming and fill before owner updates, label changes and disposal',async({page})=>{
 await hydratePage(page);const root=page.getByRole('progressbar',{name:'Hydrated progress',exact:true});const fill=root.locator('[data-slot=progress-indicator]');const node=await root.elementHandle();await expect(root).toHaveAttribute('aria-valuenow','25');await page.getByRole('button',{name:'Complete hydrated progress'}).click();await expect(root).toHaveAttribute('data-state','complete');await expect.poll(()=>fill.evaluate(n=>(n as HTMLElement).style.width)).toBe('100%');await page.getByRole('button',{name:'Change IDs'}).click();await expect(root).toHaveAttribute('aria-labelledby','progress-label-client');await page.getByRole('button',{name:'Unknown hydrated progress'}).click();await expect(root).not.toHaveAttribute('aria-valuenow');await expect.poll(()=>fill.evaluate(n=>(n as HTMLElement).style.width)).toBe('40%');expect(await node!.evaluate(n=>n.isConnected)).toBe(true);await page.getByRole('button',{name:'Dispose components'}).click();await expect(page.locator('#hydration-root')).toBeEmpty();
});


test('hydrates native catalog nodes then preserves draft recovery and native form reset',async({page})=>{
 await hydratePage(page);const draft=page.getByRole('textbox',{name:'Contact address'});const node=await draft.elementHandle();await draft.fill('Hydrated draft');await page.getByRole('combobox',{name:'Language'}).selectOption('tr');await page.getByRole('button',{name:'Retry preview',exact:true}).click();await expect(draft).toHaveValue('Hydrated draft');await expect(page.locator('[data-slot=field-error]')).toHaveCount(0);await page.getByRole('button',{name:'Submit catalog form'}).click();await expect(page.getByTestId('catalog-result')).toHaveText('{"address":"Hydrated draft","notes":"Keep this draft","language":"tr"}');await page.getByRole('button',{name:'Reset catalog form'}).click();await expect(draft).toHaveValue('hello');await expect(page.getByRole('combobox',{name:'Language'})).toHaveValue('en');expect(await node!.evaluate(element=>element===document.getElementById('catalog-address'))).toBe(true);
});
