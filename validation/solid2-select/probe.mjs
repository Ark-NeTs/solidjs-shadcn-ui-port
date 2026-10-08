// Record real interactions and every diagnostic before selecting the implementation; D19/D90.
import { chromium, firefox, expect } from '@playwright/test';
import { writeFileSync } from 'node:fs';
const reports=[];
for(const [name,engine] of Object.entries({chromium,firefox})){
 const browser=await engine.launch();const page=await browser.newPage();page.setDefaultTimeout(3000);const diagnostics=[];const checks={};
 page.on('console',m=>{if(['warning','error'].includes(m.type()))diagnostics.push({type:m.type(),text:m.text()});});page.on('pageerror',e=>diagnostics.push({type:'pageerror',text:String(e)}));
 await page.goto('http://127.0.0.1:4405/');
 try{const trigger=page.locator('button[aria-haspopup="listbox"]');await trigger.press('ArrowDown');checks.open=await page.getByRole('listbox').isVisible();await page.keyboard.press('End');await page.keyboard.press('Enter');checks.selection=await trigger.textContent();checks.form=await page.locator('form').evaluate(f=>new FormData(f).get('fruit'));await page.getByRole('button',{name:'Reset'}).click();try{await expect(trigger).toContainText('Apple',{timeout:1000});checks.reset=true;}catch{checks.reset=false;}await trigger.click();await page.keyboard.press('Escape');try{await expect(page.getByRole('listbox')).toHaveCount(0,{timeout:1000});checks.escape=true;}catch{checks.escape=false;}checks.focus=await trigger.evaluate(n=>n===document.activeElement);}catch(error){checks.error=String(error);}
 reports.push({browser:name,checks,diagnostics});await browser.close();
}
writeFileSync('unpatched.json',JSON.stringify(reports,null,2)+'\n');console.log(reports.map(r=>({...r,diagnostics:r.diagnostics.length})));
