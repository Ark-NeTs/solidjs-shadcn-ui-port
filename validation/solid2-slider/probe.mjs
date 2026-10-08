// Record native Slider interaction and all development diagnostics; D19/D90.
import { chromium,firefox,expect } from '@playwright/test';
import { writeFileSync } from 'node:fs';
const report=[];
for(const [name,engine] of Object.entries({chromium,firefox})){
 const browser=await engine.launch();const page=await browser.newPage();page.setDefaultTimeout(3000);const diagnostics=[];const checks={};page.on('console',m=>{if(['warning','error'].includes(m.type()))diagnostics.push({type:m.type(),text:m.text()});});page.on('pageerror',e=>diagnostics.push({type:'pageerror',text:String(e)}));await page.goto('http://127.0.0.1:4405/');
 try{const low=page.getByRole('slider',{name:'Minimum'});await low.press('ArrowRight');try{await expect(low).toHaveAttribute('aria-valuenow','21',{timeout:1000});checks.arrow=true;}catch{checks.arrow=await low.getAttribute('aria-valuenow');}await low.press('End');try{await expect(low).toHaveAttribute('aria-valuenow','70',{timeout:1000});checks.gap=true;}catch{checks.gap=await low.getAttribute('aria-valuenow');}checks.form=await page.locator('form').evaluate(f=>Array.from(new FormData(f).entries()));await page.getByRole('button',{name:'Reset'}).click();try{await expect(low).toHaveAttribute('aria-valuenow','20',{timeout:1000});checks.reset=true;}catch{checks.reset=false;}const box=await page.getByRole('slider',{name:'Maximum'}).boundingBox();await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();await page.mouse.move(box.x-30,box.y+box.height/2);await page.mouse.up();try{await expect(page.getByRole('slider',{name:'Maximum'})).not.toHaveAttribute('aria-valuenow','80',{timeout:1000});checks.drag=true;}catch{checks.drag=false;}}catch(error){checks.error=String(error);}
 report.push({browser:name,checks,diagnostics});await browser.close();
}
writeFileSync('unpatched.json',JSON.stringify(report,null,2)+'\n');console.log(report.map(x=>({...x,diagnostics:x.diagnostics.length})));
