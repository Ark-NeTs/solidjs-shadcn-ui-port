// Preserve every browser warning/error and fail noisy component interactions; D19.
import { test as base, expect } from '@playwright/test';
export const test=base.extend<{ diagnostics: string[] }>({
  diagnostics: [async ({page},use,testInfo)=>{
    const messages:string[]=[];
    page.on('pageerror',error=>messages.push(error.stack || error.message));
    page.on('console',message=>{if(['warning','error'].includes(message.type()))messages.push(message.text());});
    await use(messages);
    await testInfo.attach('browser-diagnostics',{body:JSON.stringify(messages),contentType:'application/json'});
    expect(messages,'No browser errors or development diagnostics').toEqual([]);
  },{auto:true}],
});
export { expect };
