// CRD-1/SEP-1 real geometry, wrapping, actions and separator semantics; D19/D90.
import type { Locator } from '@playwright/test';
import { test, expect } from './browser-fixture';

/** Reject content that visually escapes a clipped card, not just document overflow. */
async function expectContained(card: Locator) {
  const failures = await card.evaluate(root => {
    const bounds = root.getBoundingClientRect();
    const failures: string[] = [];
    for (const node of root.querySelectorAll<HTMLElement>('[data-slot], h2, p, button')) {
      const box = node.getBoundingClientRect();
      if (box.left < bounds.left - 1 || box.right > bounds.right + 1 || box.top < bounds.top - 1 || box.bottom > bounds.bottom + 1) failures.push(`${node.tagName}: outside card`);
      if (node.scrollWidth > node.clientWidth + 1) failures.push(`${node.tagName}: horizontal content overflow`);
    }
    return failures;
  });
  expect(failures).toEqual([]);
}

/** Require visible token-driven color and a specific vertical line size. */
async function expectVertical(separator: Locator, height: number, width: number) {
  const box = (await separator.boundingBox())!;
  expect(box.width).toBeCloseTo(width, 1);
  expect(box.height).toBeCloseTo(height, 1);
  await expect(separator).toHaveAttribute('data-orientation', 'vertical');
  const color = await separator.evaluate(node => getComputedStyle(node).backgroundColor);
  expect(color).not.toBe('rgba(0, 0, 0, 0)');
  expect(color).not.toBe('transparent');
}

/** Run identical layout contracts against source and built component exports. */
export function cardLayout() {
  for (const dark of [false, true]) {
    for (const narrow of [false, true]) {
      test(`${dark ? 'dark' : 'light'} ${narrow ? 'narrow enlarged' : 'desktop'} cards wrap long content and retain compact spacing and usable actions`, async ({ page }) => {
        if (narrow) await page.setViewportSize({ width: 390, height: 844 });
        await page.goto(`/?card-layout${dark ? '&dark' : ''}`);
        if (narrow) await page.evaluate(() => { document.documentElement.style.fontSize = '24px'; });
        await page.evaluate(() => document.fonts.ready);
        const rootFont = narrow ? 24 : 16;
        for (const size of ['default', 'sm']) {
          const card = page.getByTestId(`card-${size}`);
          const spacing = rootFont * (size === 'sm' ? 0.75 : 1);
          await expect(card).toHaveAttribute('data-size', size);
          expect(await card.evaluate(node => parseFloat(getComputedStyle(node).paddingTop))).toBe(spacing);
          for (const slot of ['card-header', 'card-content', 'card-footer']) {
            expect(await card.locator(`[data-slot="${slot}"]`).evaluate(node => parseFloat(getComputedStyle(node).paddingLeft))).toBe(spacing);
          }
          expect(await card.locator('[data-slot="card-title"]').evaluate(node => parseFloat(getComputedStyle(node).fontSize))).toBe(rootFont * (size === 'sm' ? 0.875 : 1));
          await expectContained(card);
          const cardBox = (await card.boundingBox())!;
          const footer = (await card.locator('[data-slot="card-footer"]').boundingBox())!;
          expect(cardBox.y + cardBox.height - footer.y - footer.height).toBeCloseTo(0, 1);
          const title = (await card.locator('[data-slot="card-title"]').boundingBox())!;
          const action = (await card.locator('[data-slot="card-action"]').boundingBox())!;
          expect(title.x + title.width).toBeLessThanOrEqual(action.x + 1);
          const filename = page.getByTestId(`filename-${size}`);
          expect(await filename.evaluate(node => node.clientHeight / parseFloat(getComputedStyle(node).lineHeight))).toBeGreaterThan(1);
          await page.getByRole('button', { name: `Edit ${size} schedule` }).click();
          const review = page.getByRole('button', { name: `Review ${size} schedule` });
          await review.focus();
          await page.keyboard.press('Enter');
          await expectVertical(page.getByTestId(`separator-${size}`), rootFont * 3, 1);
        }
        await expect(page.getByTestId('layout-actions')).toHaveText('4');
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      });
    }

    test(`${dark ? 'dark' : 'light'} vertical separators stretch, accept overrides, expose semantics and skip keyboard navigation`, async ({ page }) => {
      await page.goto(`/?card-layout${dark ? '&dark' : ''}`);
      const decorative = page.getByTestId('decorative-separator');
      await expectVertical(decorative, 64, 1);
      await expect(decorative).toHaveAttribute('role', 'none');
      await expect(decorative).toHaveAttribute('aria-hidden', 'true');
      await expect(decorative).not.toHaveAttribute('aria-orientation');
      const semantic = page.getByRole('separator', { name: 'default status boundary' });
      await expect(semantic).toHaveAttribute('aria-orientation', 'vertical');
      await expect(semantic).not.toHaveAttribute('aria-hidden');
      const custom = page.getByRole('separator', { name: 'Custom boundary' });
      await expectVertical(custom, 32, 2);
      const customBox = (await custom.boundingBox())!;
      const customRow = (await page.getByTestId('custom-row').boundingBox())!;
      expect(customBox.y - customRow.y).toBeCloseTo((customRow.height - customBox.height) / 2, 1);
      const colors = await Promise.all([decorative, custom].map(node => node.evaluate(el => getComputedStyle(el).backgroundColor)));
      expect(colors[0]).not.toBe(colors[1]);
      await page.getByRole('button', { name: 'Previous', exact: true }).focus();
      await page.keyboard.press('Tab');
      await expect(page.getByRole('button', { name: 'Next', exact: true })).toBeFocused();
      const changing = page.getByTestId('changing-separator');
      await expectVertical(changing, 48, 1);
      await page.getByRole('button', { name: 'Change separator orientation' }).click();
      await expect(changing).toHaveAttribute('aria-orientation', 'horizontal');
      const horizontal = (await changing.boundingBox())!;
      expect(horizontal.height).toBe(1);
      expect(horizontal.width).toBeCloseTo((await page.getByTestId('changing-row').boundingBox())!.width, 1);
      await page.getByRole('button', { name: 'Change separator orientation' }).click();
      await expectVertical(changing, 48, 1);
    });
  }
}
