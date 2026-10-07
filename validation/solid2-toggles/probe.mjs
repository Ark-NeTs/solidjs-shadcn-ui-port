// Capture unpatched behavior and diagnostics without suppressing acceptance failures; D19.
import { chromium, firefox } from '@playwright/test';
import { writeFileSync } from 'node:fs';
const reports=[];
for(const [name,engine] of Object.entries({chromium,firefox})) {
 const browser=await engine.launch();const page=await browser.newPage();const diagnostics=[];
 page.on('console',message=>{if(['warning','error'].includes(message.type()))diagnostics.push({type:message.type(),text:message.text()});});page.on('pageerror',error=>diagnostics.push({type:'pageerror',text:String(error)}));
 await page.goto('http://127.0.0.1:4401/');const checkbox=page.getByRole('checkbox');const toggle=page.getByRole('switch');
 const initial={checkbox:await checkbox.isChecked(),switch:await toggle.isChecked()};
 await checkbox.focus();await page.keyboard.press('Space');await toggle.focus();await page.keyboard.press('Space');
 const changed={checkbox:await checkbox.isChecked(),switch:await toggle.isChecked()};await page.getByRole('button',{name:'Reset'}).click();
 await page.waitForTimeout(50);
 reports.push({browser:name,initial,changed,reset:{checkbox:await checkbox.isChecked(),switch:await toggle.isChecked()},diagnostics});await browser.close();
}
writeFileSync('unpatched.json',JSON.stringify(reports,null,2)+'\n');console.log(JSON.stringify(reports,null,2));
