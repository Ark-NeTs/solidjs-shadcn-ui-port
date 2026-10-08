// Compare minimal native mutations that refresh cached label associations; D19/D90.
import { chromium, firefox } from '@playwright/test';
import { writeFileSync } from 'node:fs';
const results = [];
for (const [name, engine] of [['chromium', chromium], ['firefox', firefox]]) {
  const browser = await engine.launch();
  for (const method of ['none', 'label-comment', 'label-empty-text', 'parent-comment', 'same-id', 'label-title']) {
    const page = await browser.newPage();
    await page.setContent('<div><label for="first"><span>Active draft</span></label><input id="first"><textarea id="second"></textarea></div>');
    results.push({ browser: name, version: browser.version(), method, ...await page.evaluate(method => {
      const label = document.querySelector('label');
      const first = document.querySelector('input');
      const second = document.querySelector('textarea');
      const child = label.firstChild;
      const before = [first.labels.length, second.labels.length];
      second.focus(); second.value = 'Keep draft'; second.setSelectionRange(2, 5);
      label.htmlFor = 'second';
      if (method === 'label-comment' || method === 'parent-comment') {
        const marker = document.createComment('');
        (method === 'label-comment' ? label : label.parentNode).append(marker); marker.remove();
      } else if (method === 'label-empty-text') {
        const marker = document.createTextNode(''); label.append(marker); marker.remove();
      } else if (method === 'same-id') second.id = second.id;
      else if (method === 'label-title') { label.title = 'temporary'; label.removeAttribute('title'); }
      return { before, after: [first.labels.length, second.labels.length], target: label.control?.id,
        sameChild: label.firstChild === child, focus: document.activeElement.id, value: second.value,
        selection: [second.selectionStart, second.selectionEnd] };
    }, method) });
    await page.close();
  }
  await browser.close();
}
writeFileSync(new URL('./label-refresh-probe.json', import.meta.url), JSON.stringify(results, null, 2) + '\n');
console.log(JSON.stringify(results, null, 2));
