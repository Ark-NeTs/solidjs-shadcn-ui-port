// Capture all diagnostics and failed interactions without making process success imply acceptance; D19.
import {chromium,firefox} from '@playwright/test';
import {writeFileSync} from 'node:fs';
const reports=[];
for(const [name,engine] of Object.entries({chromium,firefox})){
 const browser=await engine.launch();const page=await browser.newPage();page.setDefaultTimeout(3000);const diagnostics=[];const observations={};
 page.on('console',m=>{if(['warning','error'].includes(m.type()))diagnostics.push({type:m.type(),text:m.text()});});page.on('pageerror',e=>diagnostics.push({type:'pageerror',text:String(e)}));
 try{await page.goto('http://127.0.0.1:4401/');const input=page.getByRole('combobox');observations.initial=await input.inputValue();await input.fill('Ban');await page.getByRole('option',{name:'Banana'}).click();observations.selected=await input.inputValue();observations.form=await page.locator('form').evaluate(e=>Object.fromEntries(new FormData(e)));await page.getByRole('button',{name:'Reset'}).click();observations.reset=await input.inputValue();}catch(e){observations.error=String(e);}
 reports.push({browser:name,observations,diagnostics});await browser.close();
}
writeFileSync('unpatched.json',JSON.stringify(reports,null,2)+'\n');console.log(reports.map(r=>({...r,diagnostics:r.diagnostics.length})));
