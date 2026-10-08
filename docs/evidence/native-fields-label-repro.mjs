// Reproduce cached native label collections independently of Solid; D19/D90 evidence.
import { chromium, firefox, expect } from '@playwright/test';
import { writeFileSync } from 'node:fs';
const results = [];
for (const [name, engine] of [['chromium', chromium], ['firefox', firefox]]) {
  const browser = await engine.launch();
  for (const method of ['property', 'attribute', 'remove-attribute', 'move-label']) {
    const page = await browser.newPage();
    await page.setContent('<div><label for="first">Active draft</label><input id="first"><textarea id="second"></textarea></div>');
    await expect(page.locator('#first')).toHaveAccessibleName('Active draft');
    await page.locator('#second').fill('Draft');
    await expect(page.locator('#second')).toHaveAccessibleName('');
    await page.evaluate(method => {
      const label = document.querySelector('label');
      if (method === 'property') label.htmlFor = 'second';
      else {
        if (method === 'remove-attribute') label.removeAttribute('for');
        label.setAttribute('for', 'second');
        if (method === 'move-label') { label.remove(); document.querySelector('div').prepend(label); }
      }
    }, method);
    await page.locator('label').click();
    let accessible = true;
    try { await expect(page.locator('#second')).toHaveAccessibleName('Active draft', { timeout: 200 }); }
    catch { accessible = false; }
    results.push({ browser: name, version: browser.version(), method, accessible, ...await page.evaluate(() => ({
      target: document.querySelector('label').control?.id,
      firstLabels: [...document.querySelector('input').labels].map(node => node.textContent),
      secondLabels: [...document.querySelector('textarea').labels].map(node => node.textContent),
      focus: document.activeElement.id,
    })) });
    await page.close();
  }
  await browser.close();
}
writeFileSync(new URL('./native-fields-label-cached-probe.json', import.meta.url), JSON.stringify(results, null, 2) + '\n');
console.log(JSON.stringify(results, null, 2));
