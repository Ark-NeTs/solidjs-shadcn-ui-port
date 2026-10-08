// Compare native focus and positioned component geometry across engines; D19/D90.
import { chromium, webkit } from 'playwright';
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const results=[];
/** Capture focus and geometry without changing document state. */
async function snapshot(page, step) {
 return {step,...await page.evaluate(()=>({focus:document.activeElement?.outerHTML.slice(0,500),scrollY,dialogs:Array.from(document.querySelectorAll('[role=dialog],[role=alertdialog]')).map(node=>({name:node.getAttribute('aria-label'),open:node.open,popover:node.matches(':popover-open'),box:node.getBoundingClientRect().toJSON(),style:node.getAttribute('style')}))}))};
}
for (const engine of [chromium,webkit]) {
 const launch=engine===webkit&&process.platform==='darwin'?{executablePath:fileURLToPath(new URL('../../scripts/webkit-macos.sh',import.meta.url)),env:{...process.env,THEME_WEBKIT_EXECUTABLE:webkit.executablePath()}}:{};
 const browser=await engine.launch(launch);const page=await browser.newPage();const steps=[];
 await page.goto('http://127.0.0.1:4403/?alert-dialog-focus');
 await page.getByRole('button',{name:'Open parent confirmation',exact:true}).press('Enter');
 await page.getByRole('textbox',{name:'Parent draft'}).fill('Draft');
 await page.keyboard.press('Tab');steps.push(await snapshot(page,'tab from parent draft'));
 await page.keyboard.press('Enter');steps.push(await snapshot(page,'open nested'));
 for(const key of ['Shift+Tab','Shift+Tab','Tab','Tab']){await page.keyboard.press(key);steps.push(await snapshot(page,key));}
 await page.locator('#parent-draft').evaluate(node=>node.focus());steps.push(await snapshot(page,'focus inert parent'));
 await page.keyboard.press('Escape');await page.waitForTimeout(100);steps.push(await snapshot(page,'close nested'));
 await page.goto('http://127.0.0.1:4403/');
 await page.getByRole('combobox',{name:'Restricted fruit'}).fill('Ban');
 await page.waitForTimeout(250);steps.push(await snapshot(page,'restricted fruit'));
 const option=page.getByRole('option',{name:'Banana',exact:true});steps.push({step:'option',box:await option.boundingBox()});
 results.push({engine:engine.name(),version:browser.version(),steps});await browser.close();
}
await writeFile(new URL('./webkit-differences-probe.json',import.meta.url),JSON.stringify(results,null,2)+'\n');
console.log(JSON.stringify(results));
