// POP-1 geometry contracts shared by source and built browser suites; D19/D90.
import type { Page } from '@playwright/test';
import { test, expect } from './browser-fixture';

/** Read actual layout in one browser task; never mock Floating UI or force visibility. */
async function geometry(page: Page) {
  return page.evaluate(() => {
    const anchor = document.querySelector('[data-testid="placement-anchor"]')!.getBoundingClientRect();
    const content = document.querySelector('[data-slot="popover-content"]')!;
    const popup = content.getBoundingClientRect();
    return {
      anchor: { x: anchor.x, y: anchor.y, width: anchor.width, height: anchor.height },
      popup: { x: popup.x, y: popup.y, width: popup.width, height: popup.height },
      side: content.getAttribute('data-side'), nativeOpen: content.matches(':popover-open'),
    };
  });
}

/** Wait for settled bottom placement with the declared eight-pixel gap and alignment. */
async function expectAttached(page: Page, center = false) {
  await expect.poll(async () => {
    const { anchor, popup, side, nativeOpen } = await geometry(page);
    const alignment = center ? anchor.x + anchor.width / 2 - popup.x - popup.width / 2 : anchor.x - popup.x;
    return nativeOpen && side === 'bottom' && Math.abs(alignment) < 1 && Math.abs(popup.y - anchor.y - anchor.height - 8) < 1;
  }).toBe(true);
}

/** Open a named scenario through the same public exports used by the gallery. */
async function openPreview(page: Page, mode: string) {
  await page.goto(`/?popover-placement&placement-case=${mode}`);
  await page.getByRole('button', { name: 'Open placement preview' }).click();
  await expect(page.getByRole('dialog', { name: 'Placement preview' })).toBeVisible();
}

/** Verify scrolling, element/viewport resize, transform movement and top-layer clipping. */
export function popoverPlacement() {
  test('follows two-axis ancestor scrolling and document scrolling while remaining open', async ({ page }) => {
    await openPreview(page, 'scroll');
    await expectAttached(page);
    const initial = await geometry(page);
    await page.getByTestId('placement-container').evaluate(node => node.scrollTo({ left: 80, top: 70 }));
    await expect.poll(async () => (await geometry(page)).anchor.x).toBeCloseTo(initial.anchor.x - 80, 0);
    await expect.poll(async () => (await geometry(page)).anchor.y).toBeCloseTo(initial.anchor.y - 70, 0);
    await expectAttached(page);
    await page.evaluate(() => window.scrollTo(0, 100));
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(100);
    await expect.poll(async () => (await geometry(page)).anchor.y).toBeCloseTo(initial.anchor.y - 170, 0);
    await expectAttached(page);
    await page.getByTestId('placement-container').evaluate(node => node.scrollTo(0, 0));
    await page.evaluate(() => window.scrollTo(0, 0));
    await expectAttached(page);
    await expect.poll(async () => (await geometry(page)).popup.y).toBeCloseTo(initial.popup.y, 0);
    await page.keyboard.press('Escape');
    await expect(page.getByRole('button', { name: 'Open placement preview' })).toBeFocused();
  });

  test('reanchors after viewport, anchor and popup resizing without reopening', async ({ page }) => {
    await openPreview(page, 'resize');
    await expectAttached(page, true);
    const initial = await geometry(page);
    await page.setViewportSize({ width: 720, height: 720 });
    await expect.poll(async () => (await geometry(page)).anchor.x).toBeCloseTo(initial.anchor.x - 240, 0);
    await expectAttached(page, true);
    await page.getByRole('button', { name: 'Resize anchor', exact: true }).click();
    await expect.poll(async () => (await geometry(page)).anchor.width).toBe(280);
    await expectAttached(page, true);
    await page.getByRole('button', { name: 'Resize content', exact: true }).click();
    await expect.poll(async () => (await geometry(page)).popup.width).toBe(340);
    await expectAttached(page, true);
    await page.getByRole('button', { name: 'Resize content', exact: true }).click();
    await page.getByRole('button', { name: 'Resize anchor', exact: true }).click();
    await page.setViewportSize({ width: 1200, height: 900 });
    await expectAttached(page, true);
    await expect.poll(async () => (await geometry(page)).popup.x).toBeCloseTo(initial.popup.x, 0);
  });

  test('tracks a transformed anchor during movement and returns to its original position', async ({ page }, testInfo) => {
    await openPreview(page, 'motion');
    await expectAttached(page);
    const initial = await geometry(page);
    await page.getByRole('button', { name: 'Move anchor' }).click();
    // Sample intermediate frames as well as the destination. Bound transient lag
    // to 12px and require subpixel attachment at rest; this is not a frame-rate claim.
    const samples = await page.evaluate(async () => {
      const anchor = document.querySelector('[data-testid="placement-anchor"]')!;
      const popup = document.querySelector('[data-slot="popover-content"]')!;
      const frames = [];
      for (let index = 0; index < 30; index++) {
        await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
        const a = anchor.getBoundingClientRect();
        const p = popup.getBoundingClientRect();
        frames.push({ time: performance.now(), popupX: p.x, popupY: p.y, anchorY: a.y, x: a.x, error: Math.max(Math.abs(p.x - a.x), Math.abs(p.y - a.bottom - 8)) });
      }
      return frames;
    });
    await testInfo.attach('movement-samples', { body: JSON.stringify(samples), contentType: 'application/json' });
    const moving = samples.filter(sample => sample.x > initial.anchor.x + 5 && sample.x < initial.anchor.x + 85);
    expect(moving.length).toBeGreaterThan(2);
    expect(Math.max(...moving.map(sample => sample.error))).toBeLessThan(12);
    await expect.poll(async () => (await geometry(page)).anchor.x).toBeCloseTo(initial.anchor.x + 90, 0);
    await expect.poll(async () => (await geometry(page)).anchor.y).toBeCloseTo(initial.anchor.y + 60, 0);
    await expectAttached(page);
    await page.getByRole('button', { name: 'Move anchor' }).click();
    await expect.poll(async () => (await geometry(page)).anchor.x).toBeCloseTo(initial.anchor.x, 0);
    await expectAttached(page);
  });

  test('flips and shifts at viewport edges, constrains oversized content and keeps its action reachable', async ({ page }) => {
    await openPreview(page, 'edge');
    const popup = page.getByRole('dialog', { name: 'Placement preview' });
    await expect(popup).toHaveAttribute('data-side', 'top');
    await expect.poll(async () => {
      const { anchor, popup } = await geometry(page);
      return Math.abs(anchor.y - popup.y - popup.height - 8) < 1 && Math.abs(popup.x + popup.width - anchor.x - anchor.width) < 1;
    }).toBe(true);
    await page.setViewportSize({ width: 320, height: 300 });
    await expect.poll(async () => {
      const { anchor, popup, side, nativeOpen } = await geometry(page);
      return nativeOpen && side === 'top' && Math.abs(anchor.y - popup.y - popup.height - 8) < 1 &&
        popup.x >= 11 && popup.y >= 11 && popup.x + popup.width <= 309 && popup.y + popup.height <= 289;
    }).toBe(true);
    await expect.poll(async () => (await geometry(page)).popup.width).toBe(296);
    expect(await popup.evaluate(node => node.scrollHeight > node.clientHeight)).toBe(true);
    const close = page.getByRole('button', { name: 'Close preview' });
    await close.click();
    await expect(popup).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Open placement preview' })).toBeFocused();
  });

  test('escapes a transformed paint-clipping ancestor and accepts clicks outside its bounds', async ({ page }) => {
    await openPreview(page, 'clip');
    await expectAttached(page);
    const close = page.getByRole('button', { name: 'Close preview' });
    const hit = await close.evaluate(node => {
      const rect = node.getBoundingClientRect();
      const clip = document.querySelector('[data-testid="placement-container"]')!.getBoundingClientRect();
      const x = rect.x + rect.width / 2;
      const y = rect.y + rect.height / 2;
      return { outside: y > clip.bottom, painted: node.contains(document.elementFromPoint(x, y)) };
    });
    expect(hit).toEqual({ outside: true, painted: true });
    await close.click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Open placement preview' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expectAttached(page);
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });
}
