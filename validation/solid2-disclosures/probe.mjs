// Capture every warning/error and open/close assertion before adoption; D19/D90.
import { chromium, firefox } from '@playwright/test';
import { writeFileSync } from 'node:fs';
const reports=[];
for(const [name,engine] of Object.entries({chromium,firefox})) {
 const browser=await engine.launch();
 for(const kind of ['accordion','collapsible']){
  const page=await browser.newPage();page.setDefaultTimeout(3000);const diagnostics=[];let error;
  page.on('console',message=>{if(['warning','error'].includes(message.type()))diagnostics.push({type:message.type(),text:message.text()});});page.on('pageerror',err=>diagnostics.push({type:'pageerror',text:String(err)}));
  try {
   await page.goto(`http://127.0.0.1:4405/?kind=${kind}`);
   const trigger=page.getByRole('button',{name:'Toggle details',exact:true});
   await trigger.click();await page.getByLabel('Draft').waitFor({state:'visible'});
   await trigger.click();await page.getByLabel('Draft').waitFor({state:'hidden'});
  }catch(err){error=String(err);}
  reports.push({browser:name,kind,error,diagnostics});await page.close();
 }
 await browser.close();
}
writeFileSync('unpatched.json',JSON.stringify(reports,null,2)+'\n');console.log(reports.map(r=>({browser:r.browser,kind:r.kind,warnings:r.diagnostics.length,error:r.error})));
