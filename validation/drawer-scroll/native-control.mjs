// Reproduce native Firefox editor scrolling without Solid or Drawer; D19/D90.
import {firefox} from '@playwright/test';
import {writeFile} from 'node:fs/promises';
const browser=await firefox.launch();const results=[];
for(const modal of [false,true])for(let run=0;run<24;run++){
 const page=await browser.newPage({viewport:{width:1200,height:900}});
 await page.setContent(`<style>*{box-sizing:border-box}body{margin:0}dialog{margin:0;padding:0;border:0;max-width:none;max-height:none;width:100vw;height:100vh}#panel{position:fixed;top:0;left:0;width:384px;height:900px;display:flex;transform:translateX(0)}#body{overflow:auto;width:352px;height:900px;padding:16px}input{height:32px;width:100%}</style>${modal?'<dialog>':''}<div id="panel"><div id="body"><div style="height:160px">Native control</div><input aria-label="Draft"><p style="height:4500px">Long content</p><button id="close">Close native control</button></div></div>${modal?'</dialog>':''}`);
 if(modal)await page.locator('dialog').evaluate(node=>node.showModal());
 await page.getByRole('textbox',{name:'Draft'}).fill('Retained draft');const before=await page.locator('#body').evaluate(node=>{node.scrollTop=node.scrollHeight;return node.scrollTop;});
 const after=await page.locator('#close').evaluate(node=>new Promise(resolve=>{const observer=new IntersectionObserver(entries=>{const body=node.closest('#body');observer.disconnect();resolve({ratio:entries[0].intersectionRatio,scroll:body.scrollTop,rect:node.getBoundingClientRect().toJSON()});});observer.observe(node);}));results.push({modal,run,before,after});await page.close();if(after.ratio===0)break;
}
await browser.close();await writeFile('native-control.json',JSON.stringify(results,null,2));console.log(results.filter(x=>!x.after.ratio));
