// Isolate macOS WebKit keyboard preferences with native HTML only; D19/D90.
import { webkit } from 'playwright';
import { writeFile } from 'node:fs/promises';
const results = [];
for (const args of [[], ['-AppleKeyboardUIMode', '2'], ['-AppleKeyboardUIMode', '2', '-WebKit2TabsToLinks', 'YES']]) {
  const browser = await webkit.launch(args.length ? { ignoreDefaultArgs: true, args: ['--inspector-pipe', '--headless', '--no-startup-window', ...args] } : {});
  const page = await browser.newPage();
  await page.setContent('<input id="draft" aria-label="Draft"><button id="first">First</button><a id="link" href="#target">Link</a><button id="second">Second</button>');
  await page.locator('#first').focus();
  await page.keyboard.press('Tab');
  const afterTab = await page.evaluate(() => document.activeElement?.id);
  await page.locator('#first').focus();
  await page.keyboard.press('Alt+Tab');
  const afterOptionTab = await page.evaluate(() => document.activeElement?.id);
  await page.locator('#draft').focus();
  await page.locator('#second').click();
  const afterClick = await page.evaluate(() => document.activeElement?.id);
  results.push({ version: browser.version(), args, afterTab, afterOptionTab, afterClick });
  await browser.close();
}
await writeFile(new URL('./webkit-keyboard-probe.json', import.meta.url), JSON.stringify(results, null, 2) + '\n');
console.log(JSON.stringify(results));
