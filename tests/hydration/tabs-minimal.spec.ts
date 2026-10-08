// Compare native Solid and package Tabs with exactly two tabs and one input; D19/D90.
import { test, expect } from '../browser-fixture';
const modes = ['plain', 'context', 'registration', 'registration-spread', 'registration-read', 'package-shell', 'package-triggers', 'package-panels', 'package-controlled', 'package-uncontrolled'] as const;
for (const mode of modes) test(`minimal hydration: ${mode}${mode === 'registration-read' ? ' (unsafe-pattern characterization)' : ''}`, async ({ page }, testInfo) => {
  await page.goto(`/tabs-${mode}/`);
  await expect(page.locator('#hydrate')).toHaveAttribute('data-ready', 'true');
  await expect(page.getByRole('tab')).toHaveCount(2);
  await expect(page.locator('#hydration-root input')).toHaveCount(1);
  const nodes = await page.locator('#hydration-root').evaluateHandle(root => Array.from(root.querySelectorAll('*')));
  await page.getByLabel('Draft').fill('Draft before hydration');
  await page.getByRole('button', { name: 'Hydrate components' }).click();
  await expect(page.locator('#hydration-root')).toHaveAttribute('data-hydrated', 'true');
  const replaced = await nodes.evaluate(elements => elements.filter(node => !node.isConnected).map(node => ({ tag: node.tagName, role: node.getAttribute('role'), slot: node.getAttribute('data-slot') })));
  const draft = await page.getByLabel('Draft').inputValue();
  await testInfo.attach('minimal-before-interaction', { body: JSON.stringify({ mode, replaced, draft }), contentType: 'application/json' });
  await nodes.dispose();
  if (mode === 'registration-read') {
    // Deliberate negative control: reproduce the unsafe algorithm without package components.
    expect(replaced.map(node => node.tag)).toEqual(['DIV', 'BUTTON', 'BUTTON', 'DIV', 'INPUT', 'DIV']);
    expect(draft).toBe('Server draft');
    return;
  }
  expect(replaced, 'Hydration must reuse the server elements').toEqual([]);
  expect(draft, 'Hydration must preserve the native draft typed before it starts').toBe('Draft before hydration');
  await page.getByLabel('Draft').fill('Draft after hydration');
  await page.getByRole('tab', { name: 'History' }).click();
  await expect(page.getByRole('tab', { name: 'History' })).toHaveAttribute('aria-selected', 'true');
  await page.getByRole('tab', { name: 'Profile' }).click();
  await expect(page.getByLabel('Draft')).toHaveValue('Draft after hydration');
  await testInfo.attach('minimal-hydration', { body: JSON.stringify({ mode, replaced, draft, interaction: 'passed' }), contentType: 'application/json' });
  await page.getByRole('button', { name: 'Dispose components' }).click();
  await expect(page.locator('#hydration-root')).toBeEmpty();
});
