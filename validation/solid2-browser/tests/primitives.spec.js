// Kobalte behavior/cleanup probes on Solid 2; evidence for the D19 library choice.
import { test, expect } from '@playwright/test';
/** Record browser failures and diagnostics independently from interaction assertions. */
test.beforeEach(async ({page}) => {
  page.probeErrors=[];page.probeWarnings=[];
  page.on('pageerror',error=>page.probeErrors.push(error.stack));
  page.on('console',message=>{if(['warning','error'].includes(message.type()))page.probeWarnings.push(message.text())});
  await page.addInitScript(() => {
    // Track Drawer/OTP document listeners and OTP DOM listeners; this is not a heap-wide leak detector.
    const watched=new Set(['pointermove','touchmove','pointerup','touchend','contextmenu']);
    const listeners=new Map();
    const otpListeners=[];
    const add=EventTarget.prototype.addEventListener;
    const remove=EventTarget.prototype.removeEventListener;
    EventTarget.prototype.addEventListener=function(type,listener,options) {
      if((this===document&&type==='selectionchange')||(this instanceof HTMLInputElement&&type==='copy')||(this instanceof HTMLFormElement&&type==='reset')) otpListeners.push({target:this,type,listener});
      if(this===document && watched.has(type)) {
        const rows=listeners.get(type)||[];
        const capture=typeof options==='boolean'?options:!!options?.capture;
        if(!rows.some(row=>row.listener===listener && row.capture===capture))rows.push({listener,capture});
        listeners.set(type,rows);
      }
      return add.call(this,type,listener,options);
    };
    EventTarget.prototype.removeEventListener=function(type,listener,options) {
      const index=otpListeners.findIndex(row=>row.target===this&&row.type===type&&row.listener===listener);
      if(index!==-1)otpListeners.splice(index,1);
      if(this===document && watched.has(type)) {
        const capture=typeof options==='boolean'?options:!!options?.capture;
        listeners.set(type,(listeners.get(type)||[]).filter(row=>row.listener!==listener||row.capture!==capture));
      }
      return remove.call(this,type,listener,options);
    };
    window.__otpListenerCount=()=>otpListeners.filter(row=>row.target===document || (row.target instanceof HTMLInputElement && row.type==='copy')).length;
    window.__drawerListenerCount=()=>[...listeners.values()].reduce((sum,rows)=>sum+rows.length,0);
    const nativeObserver=window.ResizeObserver;
    const observed=new Set();
    window.__observed=observed;
    window.ResizeObserver=class extends nativeObserver {
      targets=new Set();
      observe(target,options){this.targets.add(target);observed.add(target);super.observe(target,options)}
      unobserve(target){this.targets.delete(target);observed.delete(target);super.unobserve(target)}
      disconnect(){for(const target of this.targets)observed.delete(target);this.targets.clear();super.disconnect()}
    };
  });
});
/** Preserve diagnostics for every case and reject uncaught browser exceptions. */
test.afterEach(async ({page},info) => {
  await info.attach('browser-diagnostics',{body:JSON.stringify({errors:page.probeErrors,warnings:page.probeWarnings},null,2),contentType:'application/json'});
  expect(page.probeErrors,'uncaught browser exceptions').toEqual([]);
  if(info.title.startsWith('drawer:')) expect(page.probeWarnings,'all Drawer interaction diagnostics').toEqual([]);
  if(info.title.startsWith('otp:')) expect(page.probeWarnings,'all OTP interaction diagnostics').toEqual([]);
  if(info.title.startsWith('dialog:')) expect(page.probeWarnings,'all Dialog interaction diagnostics').toEqual([]);
  expect(page.probeWarnings.filter(message=>/\[(NO_OWNER_\w+|SETTLED_CLEANUP_UNOWNED|RUN_WITH_DISPOSED_OWNER|CLEANUP_IN_FORBIDDEN_SCOPE)\]/.test(message)), 'ownership diagnostics across the full interaction').toEqual([]);
});
/** Wait for the fixture to mount, rather than treating network readiness as rendering. */
async function open(page,name,suffix='') {
  await page.goto(`/?case=${name}${suffix}`);
  await expect(page.locator('#app')).not.toBeEmpty();
}
/** Ensure effects have crossed two paint opportunities without an arbitrary long sleep. */
async function settle(page) { await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))); }
for(const name of ['drawer','resizable','calendar','otp','direction']) {
  test(`${name}: mount without Solid development diagnostics`,async({page})=>{
    await open(page,name);await settle(page);
    expect(page.probeWarnings,'warnings/errors emitted during mount').toEqual([]);
  });
}
test('drawer: keyboard focus, Escape and controlled reopen',async({page})=>{
  await open(page,'drawer');const trigger=page.getByRole('button',{name:'Open drawer'});
  await trigger.click();const dialog=page.getByRole('dialog',{name:'Drawer probe'});
  await expect(dialog).toBeVisible();await expect(page.getByTestId('snap')).toHaveText('1');await expect(dialog).not.toHaveAttribute('data-transitioning');await expect(page.getByTestId('open')).toHaveText('true');
  await expect(page.getByRole('textbox',{name:'Drawer input'})).toBeFocused();
  await page.getByRole('button',{name:'Dismiss'}).focus();await page.keyboard.press('Tab');
  expect(await dialog.evaluate(el=>el.contains(document.activeElement))).toBe(true);
  await page.keyboard.press('Escape');await expect(dialog).toBeHidden();await expect(trigger).toBeFocused();
  await trigger.click();await expect(dialog).toBeVisible();await page.getByRole('button',{name:'Dismiss'}).click();await expect(dialog).toBeHidden();
});
test('drawer: mouse drag snaps halfway then dismisses',async({page})=>{
  await open(page,'drawer');await page.getByRole('button',{name:'Open drawer'}).click();
  await expect(page.getByTestId('snap')).toHaveText('1');await expect(page.getByTestId('drawer')).not.toHaveAttribute('data-transitioning');
  const box=await page.getByTestId('grip').boundingBox();
  await page.mouse.move(box.x+box.width/2,box.y+20);await page.mouse.down();await page.mouse.move(box.x+box.width/2,box.y+220,{steps:20});
  await page.waitForTimeout(250);await page.mouse.up();await expect(page.getByTestId('snap')).toHaveText('0.5');
  await expect(page.getByTestId('drawer')).not.toHaveAttribute('data-snapping');
  const half=await page.getByTestId('grip').boundingBox();
  await page.mouse.move(half.x+half.width/2,half.y+20);await page.mouse.down();await page.mouse.move(half.x+half.width/2,half.y+180,{steps:20});await page.waitForTimeout(250);await page.mouse.up();
  await expect(page.getByRole('dialog')).toBeHidden();await expect(page.getByTestId('open')).toHaveText('false');
});
test('drawer: scrollable child and portal/scroll-lock cleanup',async({page})=>{
  await open(page,'drawer');const before=await page.locator('body').getAttribute('style');
  await page.getByRole('button',{name:'Open drawer'}).click();await page.getByTestId('drawer-scroll').hover();await page.mouse.wheel(0,180);
  await expect.poll(()=>page.getByTestId('drawer-scroll').evaluate(el=>el.scrollTop)).toBeGreaterThan(0);
  await page.evaluate(()=>window.harness.unmount());await settle(page);
  await expect(page.getByRole('dialog')).toHaveCount(0);await expect(page.getByTestId('overlay')).toHaveCount(0);
  expect(await page.locator('body').getAttribute('style')).toBe(before);
  expect(await page.evaluate(()=>[...window.__observed].filter(el=>!el.isConnected).length)).toBe(0);
});
test('resizable: keyboard sizing, constraints and collapse/expand',async({page})=>{
  await open(page,'resizable');const handle=page.getByRole('separator',{name:'Resize panels'});
  await handle.focus();await page.keyboard.press('ArrowRight');await expect(page.getByTestId('sizes')).toHaveText('[0.6,0.4]');
  for(let i=0;i<8;i++)await page.keyboard.press('ArrowRight');
  await expect(page.getByTestId('sizes')).toHaveText('[0.8,0.2]');
  await handle.focus();await page.keyboard.press('Enter');await expect(page.getByTestId('panel-one')).toHaveAttribute('data-collapsed','');
  await page.keyboard.press('Enter');await expect(page.getByTestId('panel-one')).toHaveAttribute('data-expanded','');
});
test('resizable: mouse drag updates controlled sizes and geometry',async({page})=>{
  await open(page,'resizable');const handle=page.getByRole('separator',{name:'Resize panels'});const box=await handle.boundingBox();
  const before=await page.getByTestId('panel-one').boundingBox();await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();await page.mouse.move(box.x+box.width/2+90,box.y+box.height/2,{steps:12});await page.mouse.up();
  await expect.poll(async()=>JSON.parse(await page.getByTestId('sizes').innerText())[0]).toBeGreaterThan(0.6);
  expect((await page.getByTestId('panel-one').boundingBox()).width).toBeGreaterThan(before.width+60);
});
test('resizable: vertical keyboard and observer cleanup',async({page})=>{
  await open(page,'resizable','&orientation=vertical');const handle=page.getByRole('separator',{name:'Resize panels'});
  await handle.focus();await page.keyboard.press('ArrowDown');await expect(page.getByTestId('sizes')).toHaveText('[0.6,0.4]');
  await page.evaluate(()=>window.harness.unmount());await settle(page);
  expect(await page.evaluate(()=>[...window.__observed].filter(el=>!el.isConnected).length)).toBe(0);
});
test('calendar: pointer selection, unavailable day and month navigation',async({page})=>{
  await open(page,'calendar');await page.locator('[data-type="day"][data-value="2026-10-07"]').click();await expect(page.getByTestId('date')).toHaveText('2026-10-07');
  const disabled=page.locator('[data-type="day"][data-value="2026-10-10"]');await expect(disabled).toHaveAttribute('aria-disabled','true');await disabled.click({force:true});await expect(page.getByTestId('date')).toHaveText('2026-10-07');
  await page.getByRole('button',{name:'Next',exact:true}).click();await expect(page.getByRole('heading',{name:'November 2026'})).toBeVisible();
});
test('calendar: keyboard focus and Enter selection',async({page})=>{
  await open(page,'calendar');await page.locator('[data-type="day"][data-value="2026-10-07"]').focus();await page.keyboard.press('ArrowRight');await expect(page.locator('[data-type="day"][data-value="2026-10-08"]')).toBeFocused();await page.keyboard.press('Enter');await expect(page.getByTestId('date')).toHaveText('2026-10-08');
});
test('calendar: range and multiple controlled selection',async({page})=>{
  await open(page,'calendar','&mode=range');await page.locator('[data-type="day"][data-value="2026-10-05"]').click();await page.locator('[data-type="day"][data-value="2026-10-08"]').click();await expect(page.getByTestId('date')).toHaveText('2026-10-05/2026-10-08');
  await open(page,'calendar','&mode=multiple');await page.locator('[data-type="day"][data-value="2026-10-05"]').click();await page.locator('[data-type="day"][data-value="2026-10-08"]').click();await expect(page.getByTestId('date')).toHaveText('2026-10-05,2026-10-08');await page.locator('[data-type="day"][data-value="2026-10-05"]').click();await expect(page.getByTestId('date')).toHaveText('2026-10-08');
});
test('otp: typing, completion and external controlled value',async({page})=>{
  await open(page,'otp');const input=page.locator('[data-kb-otp-field-input]');await input.focus();await page.keyboard.type('123456');await expect(page.getByTestId('otp-value')).toHaveText('123456');expect(await page.evaluate(()=>window.__otpCompletions)).toEqual(['123456']);
  await page.getByRole('button',{name:'Set external value'}).click();await expect(input).toHaveValue('987654');await page.getByRole('button',{name:'Toggle disabled'}).click();await expect(input).toBeDisabled();
});
test('otp: invalid characters, deletion, length and cleanup',async({page})=>{
  await open(page,'otp');const input=page.locator('[data-kb-otp-field-input]');await input.focus();await page.keyboard.type('12a');await expect(input).toHaveValue('12');await page.keyboard.press('Backspace');await expect(input).toHaveValue('1');
  await input.fill('1234567');await expect(input).toHaveValue('123456');
  await page.evaluate(()=>window.harness.unmount());await settle(page);
  expect(await page.locator('head style').evaluateAll(nodes=>nodes.filter(el=>el.textContent.includes('data-kb-otp-field-input')).length)).toBe(0);
  await page.evaluate(()=>window.harness.mount());await expect(page.locator('[data-kb-otp-field-input]')).toHaveValue('');
});
test('direction: locale RTL, nested LTR and dynamic locale keyboard behavior',async({page})=>{
  await open(page,'direction');await expect(page.getByTestId('arabic-direction')).toHaveText('rtl');await expect(page.getByTestId('nested-english-direction')).toHaveText('ltr');
  const rtl=page.getByTestId('arabic');await rtl.getByRole('tab',{name:'One',exact:true}).focus();await page.keyboard.press('ArrowLeft');await expect(rtl.getByRole('tab',{name:'Two',exact:true})).toBeFocused();
  await page.getByRole('button',{name:'Set Arabic locale'}).click();await expect(page.getByTestId('dynamic-direction')).toHaveText('rtl');
  const dynamic=page.getByTestId('dynamic');await dynamic.getByRole('tab',{name:'One',exact:true}).focus();await page.keyboard.press('ArrowLeft');await expect(dynamic.getByRole('tab',{name:'Two',exact:true})).toBeFocused();
});
test('direction: explicit DOM RTL must agree with consumer keyboard direction',async({page})=>{
  await open(page,'direction');const fixture=page.getByTestId('explicit-rtl');expect(await fixture.evaluate(el=>getComputedStyle(el).direction)).toBe('rtl');
  await fixture.getByRole('tab',{name:'One',exact:true}).focus();await page.keyboard.press('ArrowLeft');await expect(fixture.getByRole('tab',{name:'Two',exact:true})).toBeFocused();
});

test('otp: provided Label must associate with its input',async({page})=>{
  await open(page,'otp');await expect(page.getByLabel('Verification code')).toHaveCount(1);
});

test('otp: Root name must participate in native FormData',async({page})=>{
  await open(page,'otp');await page.locator('[data-kb-otp-field-input]').fill('123456');await page.getByRole('button',{name:'Submit code'}).click();await expect(page.getByTestId('submitted')).toHaveText('123456');
});

test('otp: explicit input id/name restores label and form wiring',async({page})=>{
  await open(page,'otp','&wire=explicit');const input=page.getByLabel('Verification code');await input.fill('123456');await page.getByRole('button',{name:'Submit code'}).click();await expect(page.getByTestId('submitted')).toHaveText('123456');
});
test('drawer: browser touch events dismiss the fully opened drawer',async({page,browserName})=>{
  test.skip(browserName!=='chromium','CDP touch injection is Chromium-only; no native Firefox touchscreen probe.');
  await open(page,'drawer');await page.getByRole('button',{name:'Open drawer'}).click();await expect(page.getByTestId('snap')).toHaveText('1');await expect(page.getByTestId('drawer')).not.toHaveAttribute('data-transitioning');
  const box=await page.getByTestId('grip').boundingBox();const session=await page.context().newCDPSession(page);const x=box.x+box.width/2;const y=box.y+10;
  await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
  for(let step=1;step<=20;step++)await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:y+step*17}]});
  await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await expect(page.getByRole('dialog')).toBeHidden();await expect(page.getByTestId('open')).toHaveText('false');await session.detach();
});

test('drawer: close button restores focus and permits reopening',async({page})=>{
  await open(page,'drawer');const trigger=page.getByRole('button',{name:'Open drawer'});
  for(let cycle=0;cycle<2;cycle++) {
    await trigger.click();await expect(page.getByTestId('snap')).toHaveText('1');await expect(page.getByTestId('drawer')).not.toHaveAttribute('data-transitioning');
    await page.getByRole('button',{name:'Dismiss'}).click();await expect(page.getByRole('dialog')).toHaveCount(0);await expect(trigger).toBeFocused();await expect(page.getByTestId('open')).toHaveText('false');
  }
});

/** Exercise stacked layers after both delayed content refs become available. */
test('drawer: Escape dismisses only the topmost nested layer',async({page})=>{
  await open(page,'drawer','&nested');await page.getByRole('button',{name:'Open drawer',exact:true}).click();
  await expect(page.getByTestId('snap')).toHaveText('1');await expect(page.getByTestId('drawer')).not.toHaveAttribute('data-transitioning');
  await page.getByRole('button',{name:'Open nested drawer'}).click();
  const inner=page.getByRole('dialog',{name:'Nested drawer',exact:true});
  await expect(inner).toBeVisible();await expect(page.getByTestId('nested-snap')).toHaveText('1');await expect(inner).not.toHaveAttribute('data-transitioning');
  await page.keyboard.press('Escape');await expect(inner).toHaveCount(0);
  await expect(page.getByTestId('open')).toHaveText('true');
  await expect(page.getByRole('button',{name:'Open nested drawer'})).toBeFocused();
  await page.keyboard.press('Escape');await expect(page.getByTestId('open')).toHaveText('false');
  await expect(page.getByRole('button',{name:'Open drawer',exact:true})).toBeFocused();
});
/** Respect a consumer veto without corrupting subsequent close and reopen. */
test('drawer: prevented Escape keeps its layer registered',async({page})=>{
  await open(page,'drawer','&preventEscape');await page.getByRole('button',{name:'Open drawer'}).click();
  await expect(page.getByTestId('snap')).toHaveText('1');await expect(page.getByTestId('drawer')).not.toHaveAttribute('data-transitioning');
  await page.keyboard.press('Escape');await expect(page.getByTestId('open')).toHaveText('true');
  await page.getByRole('button',{name:'Dismiss'}).click();await expect(page.getByRole('dialog')).toHaveCount(0);
});
/** Detect listener accumulation and body lock leakage over fresh owner lifetimes. */
test('drawer: repeated Escape and unmount dispose document listeners',async({page})=>{
  await open(page,'drawer');await settle(page);
  const baseline=await page.evaluate(()=>window.__drawerListenerCount());
  const bodyStyle=await page.locator('body').getAttribute('style');
  for(let cycle=0;cycle<3;cycle++) {
    await page.getByRole('button',{name:'Open drawer'}).click();
    await expect(page.getByTestId('snap')).toHaveText('1');await expect(page.getByTestId('drawer')).not.toHaveAttribute('data-transitioning');
    expect(await page.evaluate(()=>window.__drawerListenerCount())).toBeGreaterThan(baseline);
    if(cycle%2===0) { await page.keyboard.press('Escape');await expect(page.getByRole('dialog')).toHaveCount(0); }
    await page.evaluate(()=>window.harness.unmount());await settle(page);
    expect(await page.evaluate(()=>window.__drawerListenerCount())).toBe(baseline);
    expect(await page.locator('body').getAttribute('style')).toBe(bodyStyle);
    await page.evaluate(()=>window.harness.mount());await settle(page);
  }
});
/** A retained signal must no longer notify a disposed panel's onResize effect. */
test('resizable: disposed panels stop resize callbacks and remount cleanly',async({page})=>{
  await open(page,'resizable');await settle(page);
  await page.evaluate(()=>window.__changeRetainedSizes([0.6,0.4]));await settle(page);
  expect(await page.evaluate(()=>window.__resizeEvents.at(-1))).toBe(0.6);
  await page.evaluate(()=>window.harness.unmount());await settle(page);
  const count=await page.evaluate(()=>window.__resizeEvents.length);
  await page.evaluate(()=>window.__changeRetainedSizes([0.7,0.3]));await settle(page);
  expect(await page.evaluate(()=>window.__resizeEvents.length)).toBe(count);
  await page.evaluate(()=>window.harness.mount());await settle(page);
  const handle=page.getByRole('separator',{name:'Resize panels'});await handle.focus();await page.keyboard.press('ArrowRight');
  await expect(page.getByTestId('sizes')).toHaveText('[0.6,0.4]');
  expect(page.probeWarnings).toEqual([]);
});

for(const [label,query] of [['controlled',''],['initially open','&initial'],['uncontrolled','&uncontrolled']]) {
  /** Cover public open contracts while keeping presence feedback visible in the shared hook. */
  test(`dialog: ${label} open, Escape, focus and cleanup`,async({page})=>{
    await open(page,'dialog',query);
    const trigger=page.getByRole('button',{name:'Open plain dialog'});
    const dialog=page.getByRole('dialog',{name:'Plain dialog',exact:true});
    if(!query.includes('initial'))await trigger.click();
    await expect(dialog).toBeVisible();await expect(page.getByRole('textbox',{name:'Plain input'})).toBeFocused();
    await page.keyboard.press('Escape');await expect(dialog).toHaveCount(0);await expect(trigger).toBeFocused();
    await trigger.click();await expect(dialog).toBeVisible();
    await page.getByRole('button',{name:'Dismiss'}).click();await expect(dialog).toHaveCount(0);await expect(trigger).toBeFocused();
    await page.evaluate(()=>window.harness.unmount());await settle(page);
    await expect(page.getByTestId('plain-overlay')).toHaveCount(0);
    expect(await page.locator('body').evaluate(el=>el.style.pointerEvents)).toBe('');
    expect(await page.evaluate(()=>window.__dialogEvents)).toEqual(['open-focus','close-focus','open-focus','close-focus']);
  });
}
/** Toggle forceMount while closed and verify that the derived predicate stays reactive. */
test('dialog: forceMount keeps closed content until explicitly released',async({page})=>{
  await open(page,'dialog','&force');const content=page.getByTestId('plain-dialog');
  await expect(content).toHaveCount(1);await expect(content).toHaveAttribute('data-closed','');await expect(content).toBeHidden();
  await page.getByRole('button',{name:'Open plain dialog'}).click();await expect(content).toBeVisible();
  await page.keyboard.press('Escape');await expect(content).toBeHidden();await expect(content).toHaveCount(1);
  await page.evaluate(()=>window.dialogControl.setForceMount(false));await expect(content).toHaveCount(0);
  await page.evaluate(()=>window.dialogControl.setForceMount(true));await expect(content).toHaveCount(1);
  await page.evaluate(()=>window.harness.unmount());await settle(page);await expect(content).toHaveCount(0);
});
/** Exercise source reversals across flushes so an old presence timer cannot remove new content. */
test('dialog: rapid controlled reopen has no delayed disappearance',async({page})=>{
  await open(page,'dialog');const dialog=page.getByRole('dialog',{name:'Plain dialog',exact:true});
  for(let cycle=0;cycle<3;cycle++) {
    await page.evaluate(()=>window.dialogControl.setOpen(true));await expect(dialog).toBeVisible();
    await page.evaluate(()=>window.dialogControl.setOpen(false));await settle(page);
    await page.evaluate(()=>window.dialogControl.setOpen(true));await expect(dialog).toBeVisible();
  }
  await page.waitForTimeout(200);await expect(dialog).toBeVisible();
  await page.keyboard.press('Escape');await expect(dialog).toHaveCount(0);
});
/** Keep Drawer mounted through its own exit transition and cancel a close by reopening. */
test('drawer: derived Dialog presence preserves exit animation and interrupted closing',async({page})=>{
  await open(page,'drawer');await page.addStyleTag({content:'.drawer { transition-duration: 400ms; }'});
  await page.getByRole('button',{name:'Open drawer'}).click();
  const drawer=page.getByTestId('drawer');await expect(page.getByTestId('snap')).toHaveText('1');await expect(drawer).not.toHaveAttribute('data-transitioning');
  await page.keyboard.press('Escape');await expect(page.getByTestId('open')).toHaveText('false');await expect(drawer).toHaveAttribute('data-closing','');await expect(drawer).toBeVisible();
  await page.evaluate(()=>window.drawerControl.setOpen(true));await expect(page.getByTestId('open')).toHaveText('true');
  await expect(page.getByTestId('snap')).toHaveText('1');await expect(drawer).not.toHaveAttribute('data-transitioning');
  await page.waitForTimeout(600);await expect(drawer).toBeVisible();
  await page.keyboard.press('Escape');await expect(drawer).toHaveAttribute('data-closing','');await expect(drawer).toBeVisible();
  await expect(drawer).toHaveCount(0);await expect(page.getByRole('button',{name:'Open drawer'})).toBeFocused();
});

/** Check that all mounted IDs and their ARIA consumers agree after a source update. */
async function expectDialogIds(page, ids) {
  const content=page.getByTestId('plain-dialog');
  await expect(content).toHaveAttribute('id',ids.content);
  await expect(page.getByTestId('plain-title')).toHaveAttribute('id',ids.title);
  await expect(page.getByTestId('plain-description')).toHaveAttribute('id',ids.description);
  await expect(content).toHaveAttribute('aria-labelledby',ids.title);
  await expect(content).toHaveAttribute('aria-describedby',ids.description);
  await expect(page.getByRole('button',{name:'Open plain dialog',includeHidden:true})).toHaveAttribute('aria-controls',ids.content);
}
/** An inherited ID is live input, including while content stays mounted. */
test('dialog: generated IDs follow a changing root and keep ARIA links',async({page})=>{
  await open(page,'dialog');await page.getByRole('button',{name:'Open plain dialog'}).click();
  const content=page.getByTestId('plain-dialog');await expect(content).toHaveAttribute('id',/^dialog-.+-content$/);
  await content.evaluate(el=>{window.__originalDialogElement=el});
  for(const root of ['renamed-dialog','renamed-again']) {
    await page.evaluate(id=>window.dialogControl.setRootId(id),root);
    await expectDialogIds(page,{content:root+'-content',title:root+'-title',description:root+'-description'});
    expect(await content.evaluate(el=>el===window.__originalDialogElement)).toBe(true);
    await expect(page.getByRole('textbox',{name:'Plain input'})).toBeFocused();
  }
  await page.keyboard.press('Escape');await expect(content).toHaveCount(0);
  await page.evaluate(()=>window.dialogControl.setRootId('closed-update'));
  await page.getByRole('button',{name:'Open plain dialog'}).click();
  await expectDialogIds(page,{content:'closed-update-content',title:'closed-update-title',description:'closed-update-description'});
});
/** Explicit part IDs override inherited defaults and can return to those defaults. */
test('dialog: explicit part IDs stay authoritative and can be removed',async({page})=>{
  await open(page,'dialog');
  await page.evaluate(()=>{window.dialogControl.setRootId('root-one');window.dialogControl.setPartIds({content:'custom-content',title:'custom-title',description:'custom-description'})});
  await page.getByRole('button',{name:'Open plain dialog'}).click();
  const explicit={content:'custom-content',title:'custom-title',description:'custom-description'};
  await expectDialogIds(page,explicit);
  await page.evaluate(()=>window.dialogControl.setRootId('root-two'));await expectDialogIds(page,explicit);
  await page.evaluate(()=>window.dialogControl.setPartIds({content:'new-content',title:'new-title',description:'new-description'}));
  await expectDialogIds(page,{content:'new-content',title:'new-title',description:'new-description'});
  await page.evaluate(()=>window.dialogControl.setPartIds({}));
  await expectDialogIds(page,{content:'root-two-content',title:'root-two-title',description:'root-two-description'});
});
/** Removed descriptive nodes must not leave dangling references in a mounted dialog. */
test('dialog: title and description unregister and restore after root changes',async({page})=>{
  await open(page,'dialog');await page.getByRole('button',{name:'Open plain dialog'}).click();
  const content=page.getByTestId('plain-dialog');
  await page.evaluate(()=>window.dialogControl.setShowText(false));
  await expect(page.getByTestId('plain-title')).toHaveCount(0);await expect(page.getByTestId('plain-description')).toHaveCount(0);
  await expect(content).not.toHaveAttribute('aria-labelledby');await expect(content).not.toHaveAttribute('aria-describedby');
  await page.evaluate(()=>{window.dialogControl.setRootId('restored');window.dialogControl.setShowText(true)});
  await expectDialogIds(page,{content:'restored-content',title:'restored-title',description:'restored-description'});
  await page.evaluate(()=>window.harness.unmount());await settle(page);
  await expect(content).toHaveCount(0);
});

/** Preserve the existing public string-registration contract alongside internal accessors. */
test('dialog: public string ID registration and cleanup remain supported',async({page})=>{
  await open(page,'dialog');
  await page.evaluate(()=>{
    const state=window.dialogIdRegistration;
    window.__idCleanups=[state.registerContentId('manual-content'),state.registerTitleId('manual-title'),state.registerDescriptionId('manual-description')];
  });
  await settle(page);
  expect(await page.evaluate(()=>{
    const state=window.dialogIdRegistration;
    return [state.contentId(),state.titleId(),state.descriptionId()];
  })).toEqual(['manual-content','manual-title','manual-description']);
  await page.evaluate(()=>{for(const cleanup of window.__idCleanups)cleanup()});
  await settle(page);
  expect(await page.evaluate(()=>{
    const state=window.dialogIdRegistration;
    return [state.contentId(),state.titleId(),state.descriptionId()].every(id=>id===undefined);
  })).toBe(true);
  await page.getByRole('button',{name:'Open plain dialog'}).click();
  await expect(page.getByRole('dialog',{name:'Plain dialog',exact:true})).toBeVisible();
  await page.keyboard.press('Escape');await expect(page.getByTestId('plain-dialog')).toHaveCount(0);
});

/** Check live ID/ARIA relationships without replacing the actual input node. */
test('otp: live IDs, names and explicit ARIA overrides stay associated',async({page})=>{
  await open(page,'otp');const input=page.locator('[data-kb-otp-field-input]');
  await input.fill('123456');await input.evaluate(el=>{window.__originalOtpInput=el});
  await page.evaluate(()=>{window.otpControl.setShowText(true);window.otpControl.setInvalid(true)});
  for(const root of ['otp-one','otp-two']) {
    await page.evaluate(id=>window.otpControl.setRootId(id),root);
    await expect(input).toHaveAttribute('id',`${root}-field`);
    await expect(page.getByTestId('otp-label')).toHaveAttribute('for',`${root}-field`);
    await expect(input).toHaveAttribute('aria-labelledby',`${root}-label`);
    await expect(input).toHaveAttribute('aria-describedby',`${root}-description ${root}-error-message`);
    await expect(input).toHaveAttribute('aria-invalid','true');
    expect(await input.evaluate(el=>el===window.__originalOtpInput)).toBe(true);
  }
  await page.evaluate(()=>{window.otpControl.setName('renamed');window.otpControl.setInputProps({id:'custom-input','aria-label':'Short code','aria-labelledby':'external-otp-label','aria-describedby':'external-otp-hint'})});
  await expect(input).toHaveAttribute('name','renamed');
  await expect(page.getByTestId('otp-label')).toHaveAttribute('for','custom-input');
  await expect(input).toHaveAttribute('aria-labelledby','external-otp-label otp-two-label custom-input');
  await expect(input).toHaveAttribute('aria-describedby','otp-two-description otp-two-error-message external-otp-hint');
  expect(await input.evaluate(el=>[...new FormData(el.form)])).toEqual([['renamed','123456']]);
  await page.evaluate(()=>window.otpControl.setInputProps({id:'custom-input',name:'input-name'}));
  expect(await input.evaluate(el=>[...new FormData(el.form)])).toEqual([['input-name','123456']]);
  await page.evaluate(()=>{window.otpControl.setInputProps({});window.otpControl.setInvalid(false)});
  await expect(input).toHaveAttribute('id','otp-two-field');await expect(input).toHaveAttribute('aria-describedby','otp-two-description');
  await expect(page.getByTestId('otp-error')).toHaveCount(0);
  await page.evaluate(()=>window.otpControl.setShowText(false));await expect(input).not.toHaveAttribute('aria-describedby');
  await page.getByTestId('otp-label').click();await expect(input).toBeFocused();
});

/** Native validation and successful-control rules must agree with visual state. */
test('otp: required, disabled and readOnly follow native form rules',async({page})=>{
  await open(page,'otp');const input=page.getByLabel('Verification code');
  await page.evaluate(()=>window.otpControl.setRequired(true));await expect(input).toHaveAttribute('required','');
  expect(await input.evaluate(el=>el.validity.valueMissing)).toBe(true);
  await page.getByRole('button',{name:'Submit code'}).click();await expect(page.getByTestId('submitted')).toHaveText('');await expect(input).toBeFocused();
  await input.fill('123456');expect(await input.evaluate(el=>el.checkValidity())).toBe(true);
  await page.evaluate(()=>window.otpControl.setReadOnly(true));await expect(input).toHaveAttribute('readonly','');
  await input.focus();await page.keyboard.type('9');await expect(input).toHaveValue('123456');
  expect(await input.evaluate(el=>[...new FormData(el.form)])).toEqual([['code','123456']]);
  expect(await input.evaluate(el=>{let copied='';const event=new Event('copy',{bubbles:true,cancelable:true});Object.defineProperty(event,'clipboardData',{value:{setData:(type,value)=>{if(type==='text/plain')copied=value}}});el.dispatchEvent(event);return copied})).toBe('123456');
  await page.evaluate(()=>window.otpControl.setDisabled(true));await expect(input).toBeDisabled();
  expect(await input.evaluate(el=>[...new FormData(el.form)])).toEqual([]);
  await page.evaluate(()=>{window.otpControl.setDisabled(false);window.otpControl.setReadOnly(false);window.otpControl.setRequired(false)});
  await expect(input).not.toHaveAttribute('required');await expect(input).toBeEditable();
});

for(const mode of ['controlled','uncontrolled']) {
  /** Restore both DOM and library state after the browser has completed native reset. */
  test(`otp: ${mode} native reset restores default value`,async({page})=>{
    await open(page,'otp',`&default=12${mode==='uncontrolled'?'&uncontrolled':''}`);
    const input=page.getByLabel('Verification code');await expect(input).toHaveValue('12');
    await input.focus();await input.fill('123456');await expect(input).toHaveValue('123456');await page.getByRole('button',{name:'Reset code'}).click();
    await expect(input).toHaveValue('12');await expect(page.getByTestId('otp-value')).toHaveText('12');
    await settle(page);expect(await input.evaluate(el=>[...new FormData(el.form)])).toEqual([['code','12']]);
    expect(await page.evaluate(()=>window.__otpCompletions)).toEqual(['123456']);
    await page.getByRole('button',{name:'Reset code'}).click();await settle(page);await expect(input).toHaveValue('12');
  });
}

/** A cancelled native reset must leave the current editable code intact. */
test('otp: cancelled form reset preserves the current code',async({page})=>{
  await open(page,'otp','&default=12&cancelReset');const input=page.getByLabel('Verification code');
  await input.focus();await input.fill('123456');await expect(input).toHaveValue('123456');await page.getByRole('button',{name:'Reset code'}).click();await settle(page);
  await expect(input).toHaveValue('123456');await expect(page.getByTestId('otp-value')).toHaveText('123456');
});

/** Completion is an event log, not a second reactive copy of the input value. */
test('otp: completion callbacks and document resources respect owner lifetime',async({page})=>{
  await open(page,'otp');const input=page.getByLabel('Verification code');
  await input.fill('123');expect(await page.evaluate(()=>window.__otpCompletions)).toEqual([]);
  await input.fill('123456');await page.getByRole('button',{name:'Set external value'}).click();await expect(input).toHaveValue('987654');
  expect(await page.evaluate(()=>window.__otpCompletions)).toEqual(['123456','987654']);
  await page.evaluate(()=>window.otpControl.setRequired(true));await settle(page);
  expect(await page.evaluate(()=>window.__otpCompletions)).toEqual(['123456','987654']);
  expect(await page.evaluate(()=>[...window.__observed].some(el=>el.matches('[data-kb-otp-field-root]')))).toBe(true);
  for(let cycle=0;cycle<3;cycle++) {
    const changeCount=await page.evaluate(()=>window.__otpChanges.length);
    await page.evaluate(()=>{window.__oldOtpForm=document.querySelector('form');window.__oldOtpInput=document.querySelector('[data-kb-otp-field-input]');window.__oldOtpForm.reset();window.harness.unmount()});await settle(page);
    await page.evaluate(()=>window.__oldOtpForm.reset());await settle(page);
    expect(await page.evaluate(()=>window.__otpChanges.length)).toBe(changeCount);
    expect(await page.evaluate(()=>{let called=false;const event=new Event('copy',{cancelable:true});Object.defineProperty(event,'clipboardData',{value:{setData:()=>{called=true}}});window.__oldOtpInput.dispatchEvent(event);return called})).toBe(false);
    expect(await page.evaluate(()=>window.__otpCompletions)).toEqual(cycle===0?['123456','987654']:[]);
    expect(await page.evaluate(()=>[...window.__observed].filter(el=>!el.isConnected).length)).toBe(0);
    expect(await page.locator('head style').evaluateAll(nodes=>nodes.filter(el=>el.textContent.includes('data-kb-otp-field-input')).length)).toBe(0);
    expect(await page.evaluate(()=>window.__otpListenerCount())).toBe(0);
    await page.evaluate(()=>window.harness.mount());await expect(input).toHaveValue('');
    expect(await page.evaluate(()=>window.__otpListenerCount())).toBe(2);
  }
});

/** Keep the pre-existing public string registration API valid alongside live sources. */
test('otp: shared form context still supports string registration and cleanup',async({page})=>{
  await open(page,'otp');
  await page.evaluate(()=>{const c=window.otpFormControl;window.__otpIdCleanups=[c.registerLabel('manual-label'),c.registerField('manual-field'),c.registerDescription('manual-description'),c.registerErrorMessage('manual-error')]});
  await settle(page);
  expect(await page.evaluate(()=>{const c=window.otpFormControl;return [c.labelId(),c.fieldId(),c.descriptionId(),c.errorMessageId()]})).toEqual(['manual-label','manual-field','manual-description','manual-error']);
  await page.evaluate(()=>{for(const cleanup of window.__otpIdCleanups)cleanup()});await settle(page);
  expect(await page.evaluate(()=>{const c=window.otpFormControl;return [c.labelId(),c.fieldId(),c.descriptionId(),c.errorMessageId()].every(id=>id===undefined)})).toBe(true);
});
