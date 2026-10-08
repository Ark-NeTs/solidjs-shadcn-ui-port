// Retain behavior and every development diagnostic before choosing an implementation; D19/D90.
import { chromium, firefox, expect } from '@playwright/test';
import { writeFileSync } from 'node:fs';
const reports=[];
for(const [name,engine] of Object.entries({chromium,firefox})){
 const browser=await engine.launch();
 for(const kind of ['radio','toggle','group']){
  const page=await browser.newPage();page.setDefaultTimeout(3000);const diagnostics=[];const checks={};
  page.on('console',m=>{if(['warning','error'].includes(m.type()))diagnostics.push({type:m.type(),text:m.text()});});page.on('pageerror',e=>diagnostics.push({type:'pageerror',text:String(e)}));
  await page.goto(`http://127.0.0.1:4405/?kind=${kind}`);
  try{
   if(kind==='toggle'){const button=page.getByRole('button',{name:'Bold'});await button.click();checks.click=await button.getAttribute('aria-pressed')==='true';await button.press('Space');checks.space=await button.getAttribute('aria-pressed')==='false';const canceled=page.getByRole('button',{name:'Canceled'});await canceled.click();checks.canceledClick=await canceled.getAttribute('aria-pressed')==='false';}
   else if(kind==='radio'){const a=page.getByRole('radio',{name:'Alpha'});const c=page.getByRole('radio',{name:'Gamma'});await a.focus();await a.press('ArrowRight');checks.keyboard=await c.isChecked();checks.form=await page.locator('form').evaluate(f=>new FormData(f).get('choice')==='c');await page.getByRole('button',{name:'Reset'}).click();try{await expect(a).toBeChecked({timeout:1000});checks.reset=true;}catch{checks.reset=false;}}
   else {const a=page.getByRole('button',{name:'Alpha'});const c=page.getByRole('button',{name:'Gamma'});await a.focus();await a.press('ArrowRight');checks.navigation=await c.evaluate(n=>n===document.activeElement);await c.press('Space');checks.multiple=await a.getAttribute('aria-pressed')==='true'&&await c.getAttribute('aria-pressed')==='true';}
  }catch(error){checks.error=String(error);}
  reports.push({browser:name,kind,checks,diagnostics});await page.close();
 }
 await browser.close();
}
writeFileSync('unpatched.json',JSON.stringify(reports,null,2)+'\n');console.log(reports.map(r=>({...r,diagnostics:r.diagnostics.length})));
