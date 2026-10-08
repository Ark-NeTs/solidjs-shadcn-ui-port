// Preserve unpatched Progress behavior and all diagnostics in two engines; D19/D90.
import { chromium,firefox,expect } from '@playwright/test';
import { writeFileSync } from 'node:fs';
const reports=[];
for(const [name,engine] of Object.entries({chromium,firefox})){
 const browser=await engine.launch();const page=await browser.newPage();const diagnostics=[];const checks={};
 page.on('console',m=>{if(['warning','error'].includes(m.type()))diagnostics.push({type:m.type(),text:m.text()});});page.on('pageerror',e=>diagnostics.push({type:'pageerror',text:String(e)}));await page.goto('http://127.0.0.1:4405/');
 try{const root=page.locator('#probe');await expect(root).toHaveAttribute('aria-valuenow','25');await page.getByRole('button',{name:'Advance',exact:true}).click();await expect(root).toHaveAttribute('aria-valuenow','75');checks.value=true;checks.fill=await page.getByTestId('fill').evaluate(n=>getComputedStyle(n).width);await page.getByRole('button',{name:'Unknown',exact:true}).click();await expect(root).not.toHaveAttribute('aria-valuenow');checks.indeterminate=true;await page.getByRole('button',{name:'Unknown',exact:true}).click();await page.getByRole('button',{name:'Scale',exact:true}).click();await expect(root).toHaveAttribute('aria-valuemax','200');await page.getByRole('button',{name:'Complete',exact:true}).click();await expect(root).toHaveAttribute('data-progress','complete');checks.complete=true;checks.externalLabel=await page.locator('#external').getAttribute('aria-labelledby');await page.getByRole('button',{name:'Mount',exact:true}).click();await expect(root).toHaveCount(0);await page.getByRole('button',{name:'Mount',exact:true}).click();await expect(root).toHaveAttribute('aria-valuenow','200');checks.remount=true;}catch(e){checks.error=String(e);}
 reports.push({browser:name,checks,diagnostics});await browser.close();
}
writeFileSync('unpatched.json',JSON.stringify(reports,null,2)+'\n');console.log(reports.map(r=>({...r,diagnostics:r.diagnostics.length})));
