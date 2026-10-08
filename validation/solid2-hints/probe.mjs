// Capture pointer, keyboard and diagnostic outcomes without library patches; D19/D90.
import { chromium,firefox } from '@playwright/test';
import { writeFileSync } from 'node:fs';
const reports=[];
for(const [name,engine] of Object.entries({chromium,firefox})){
 const browser=await engine.launch();
 for(const kind of ['tooltip','hover-card']){
  const page=await browser.newPage();page.setDefaultTimeout(3000);const diagnostics=[];const checks={};
  page.on('console',message=>{if(['warning','error'].includes(message.type()))diagnostics.push({type:message.type(),text:message.text()});});page.on('pageerror',error=>diagnostics.push({type:'pageerror',text:String(error)}));
  await page.goto(`http://127.0.0.1:4405/?kind=${kind}`);const trigger=page.getByText('Preview trigger',{exact:true});const content=page.getByText('Preview content',{exact:true});
  try{await trigger.hover();await content.waitFor({state:'visible'});checks.pointerOpen=true;await page.keyboard.press('Escape');await content.waitFor({state:'hidden'});checks.escape=true;}catch(error){checks.pointerError=String(error);}
  await page.mouse.move(1000,700);
  try{await trigger.focus();await content.waitFor({state:'visible'});checks.focusOpen=true;await page.getByRole('button',{name:'Outside'}).focus();await content.waitFor({state:'hidden'});checks.blurClose=true;}catch(error){checks.focusError=String(error);}
  reports.push({browser:name,kind,checks,diagnostics});await page.close();
 }
 await browser.close();
}
writeFileSync('unpatched.json',JSON.stringify(reports,null,2)+'\n');console.log(reports.map(r=>({...r,diagnostics:r.diagnostics.length})));
