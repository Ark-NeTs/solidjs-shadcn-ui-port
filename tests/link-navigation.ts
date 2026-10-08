// BTN-1/BDG-1 native keyboard navigation and disabled-link contracts; D19/D90.
import type { Locator, Page } from '@playwright/test';
import { test, expect } from './browser-fixture';

/** Require a native keyboard focus destination with a rendered focus indicator. */
async function expectKeyboardFocus(link: Locator) {
  await expect(link).toBeFocused();
  expect(await link.evaluate(node => node.matches(':focus-visible'))).toBe(true);
  expect(await link.evaluate(node => getComputedStyle(node).boxShadow)).not.toBe('none');
}

/** Attempt a real pointer activation without Playwright's disabled-element guard. */
async function clickDisabledAnchor(page: Page) {
  const box = await page.getByTestId('button-link').boundingBox();
  if (!box) throw new Error('Expected a visible disabled anchor');
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
}

/** Check that a blocked activation neither navigates nor calls the owner/ancestor. */
async function expectNoActivation(page: Page) {
  expect(new URL(page.url()).hash).toBe('');
  await expect(page.getByTestId('button-clicks')).toHaveText('0');
  await expect(page.getByTestId('badge-clicks')).toHaveText('0');
  await expect(page.getByTestId('bubbled-clicks')).toHaveText('0');
}

/** Use macOS WebKit's native Option-Tab gesture to include links in navigation. */
function linkTabKey(browserName: string, reverse = false) {
  const modifier = browserName === 'webkit' && process.platform === 'darwin' ? 'Alt+' : '';
  return `${modifier}${reverse ? 'Shift+' : ''}Tab`;
}

/** Register identical native-browser assertions against both package export modes. */
export function linkNavigation() {
  for (const mode of ['light', 'dark']) {
    for (const kind of ['Button', 'Badge']) {
      test(`${kind} link has visible ${mode} keyboard focus and native Enter navigation`, async ({ page, browserName }) => {
        await page.goto(`/?link-navigation${mode === 'dark' ? '&dark' : ''}`);
        await page.getByRole('button', { name: 'Disable link', exact: true }).focus();
        await page.keyboard.press(linkTabKey(browserName));
        const button = page.getByRole('link', { name: 'Button destination', exact: true });
        const badge = page.getByRole('link', { name: 'Badge destination', exact: true });
        await expectKeyboardFocus(button);
        await page.keyboard.press(linkTabKey(browserName));
        // The informational span Badge contributes no extra tab stop.
        await expectKeyboardFocus(badge);
        await page.keyboard.press(linkTabKey(browserName));
        await expect(page.getByRole('button', { name: 'After links' })).toBeFocused();
        await page.keyboard.press(linkTabKey(browserName, true));
        await expectKeyboardFocus(badge);
        if (kind === 'Button') await page.keyboard.press(linkTabKey(browserName, true));
        const link = kind === 'Button' ? button : badge;
        await expectKeyboardFocus(link);
        await expect(link).toHaveJSProperty('tagName', 'A');
        await page.keyboard.press('Space');
        await expectNoActivation(page);
        await expect(link).toBeFocused();
        await page.keyboard.press('Enter');
        await expect(page).toHaveURL(new RegExp(`#${kind.toLowerCase()}-destination$`));
        await expect(page.getByTestId(`${kind.toLowerCase()}-clicks`)).toHaveText('1');
        await expect(page.getByTestId(kind === 'Button' ? 'badge-clicks' : 'button-clicks')).toHaveText('0');
        await expect(page.getByTestId('bubbled-clicks')).toHaveText('1');
        await expect(page.getByRole('heading', { name: `${kind} destination content` })).toBeVisible();
      });
    }
  }

  test('disabled Button anchor is skipped in both tab directions and blocks pointer activation', async ({ page, browserName }) => {
    await page.goto('/?link-navigation&disabled');
    const disabled = page.getByTestId('button-link');
    await expect(disabled).toHaveAttribute('aria-disabled', 'true');
    await expect(disabled).toHaveAttribute('tabindex', '-1');
    await expect(disabled).not.toHaveAttribute('href');
    const availability = page.getByRole('button', { name: 'Enable link', exact: true });
    await availability.focus();
    await page.keyboard.press(linkTabKey(browserName));
    await expectKeyboardFocus(page.getByRole('link', { name: 'Badge destination', exact: true }));
    await page.keyboard.press(linkTabKey(browserName, true));
    await expect(availability).toBeFocused();
    await clickDisabledAnchor(page);
    await expectNoActivation(page);
  });

  test('disabling a focused Button anchor blocks keyboard and pointer activation until re-enabled', async ({ page, browserName }) => {
    await page.goto('/?link-navigation');
    const anchor = page.getByTestId('button-link');
    const original = await anchor.elementHandle();
    if (!original) throw new Error('Expected a Button anchor');
    await page.getByRole('button', { name: 'Disable link', exact: true }).focus();
    await page.keyboard.press(linkTabKey(browserName));
    await expectKeyboardFocus(anchor);
    await page.keyboard.press('d');
    await expect(anchor).toHaveAttribute('aria-disabled', 'true');
    await expect(anchor).not.toHaveAttribute('href');
    await expect(anchor).toBeFocused();
    await page.keyboard.press('Enter');
    await page.keyboard.press('Space');
    await expectNoActivation(page);
    await clickDisabledAnchor(page);
    await expectNoActivation(page);
    await page.getByRole('button', { name: 'Enable link', exact: true }).click();
    await expect(anchor).not.toHaveAttribute('aria-disabled');
    await expect(anchor).toHaveAttribute('href', '#button-destination');
    await expect(anchor).not.toHaveAttribute('tabindex');
    expect(await anchor.evaluate((node, saved) => node === saved, original)).toBe(true);
    await page.keyboard.press(linkTabKey(browserName));
    await expectKeyboardFocus(anchor);
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/#button-destination$/);
    await expect(page.getByTestId('button-clicks')).toHaveText('1');
    await expect(page.getByTestId('bubbled-clicks')).toHaveText('1');
  });
}
