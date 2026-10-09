// Exercise application draft ownership and async races with an injected service.
import {createRoot,flush} from 'solid-js';
import {afterEach,expect,it,vi} from 'vitest';
import {createAdminMenu,menuSeed,validateMenuDraft,type MenuApi,type MenuItem} from '../../playground/admin-menu-model';
const disposers:(()=>void)[]=[];
afterEach(()=>{for(const dispose of disposers.splice(0))dispose();});
/** Resolve requests explicitly so race tests do not depend on timer scheduling. */
function deferred<T>(){let resolve!:(value:T)=>void;let reject!:(error:Error)=>void;const promise=new Promise<T>((accept,fail)=>{resolve=accept;reject=fail;});return {promise,resolve,reject};}
function setup(api:MenuApi){return createRoot(dispose=>{disposers.push(dispose);return {menu:createAdminMenu(api),dispose};});}
it('validates names, decimal cents and notes without mutating the draft',()=>{
 const draft={...menuSeed[0]!,name:'  Updated dish  ',price:'12.35'};
 expect(validateMenuDraft(draft)).toMatchObject({errors:{},item:{name:'Updated dish',priceCents:1235}});expect(draft.name).toBe('  Updated dish  ');
 for(const price of ['','0','-1','1.234','1e2','Infinity','100000','12,50'])expect(validateMenuDraft({...draft,price}).errors.price).toBeTruthy();
 expect(validateMenuDraft({...draft,name:' ',notes:'x'.repeat(241)}).errors).toMatchObject({name:expect.any(String),notes:expect.any(String)});
});
it('retains confirmed rows and failed drafts, guards duplicate saves, then accepts an explicit retry',async()=>{
 const first=deferred<MenuItem>();const second=deferred<MenuItem>();const save=vi.fn().mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);
 const {menu}=setup({list:vi.fn(),save});menu.edit(menuSeed[0]!);flush();menu.update({price:'15.25',name:'Seasonal pizza'});flush();const request=menu.save();const duplicate=menu.save();flush();await duplicate;
 expect(menu.saving()).toBe(true);expect(menu.rows()[0]!.name).toBe('Margherita pizza');await menu.save();menu.close();menu.update({name:'Ignored while pending'});expect(save).toHaveBeenCalledOnce();expect(menu.draft()?.name).toBe('Seasonal pizza');
 first.reject(new Error('Rejected'));await request;flush();expect(menu.saveError()).toContain('draft is preserved');expect(menu.draft()?.price).toBe('15.25');expect(menu.rows()[0]!.priceCents).toBe(800);
 const retry=menu.save();second.resolve({...menuSeed[0]!,name:'Seasonal pizza',priceCents:1525});expect(await retry).toBe(true);flush();expect(menu.draft()).toBeNull();expect(menu.rows()[0]!.priceCents).toBe(1525);expect(menu.notice()).toBe('Saved Seasonal pizza.');
});
it('invalid submissions never call the API, reset and cancel restore confirmed values',async()=>{
 const save=vi.fn();const {menu}=setup({list:vi.fn(),save});menu.edit(menuSeed[0]!);flush();menu.update({name:'',price:'-1'});flush();await menu.save();expect(save).not.toHaveBeenCalled();expect(menu.errors().name).toBeTruthy();menu.reset();flush();expect(menu.draft()?.name).toBe('Margherita pizza');expect(menu.errors()).toEqual({});menu.update({name:'Discarded'});menu.close();menu.edit(menuSeed[1]!);flush();expect(menu.draft()?.name).toBe('Roasted vegetable bowl');
});
it('ignores older refresh results and retains records after a failed refresh',async()=>{
 const first=deferred<MenuItem[]>();const second=deferred<MenuItem[]>();const list=vi.fn().mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise).mockRejectedValueOnce(new Error('Offline'));
 const {menu}=setup({list,save:vi.fn()});const a=menu.refresh();const b=menu.refresh();second.resolve([{...menuSeed[0]!,name:'Newest menu'}]);await b;first.resolve(menuSeed);await a;expect(menu.rows()[0]!.name).toBe('Newest menu');await menu.refresh();expect(menu.rows()[0]!.name).toBe('Newest menu');expect(menu.loadError()).toContain('retained');expect(menu.loading()).toBe(false);
});
it('editing invalidates a pending read; disposal ignores a service that settles despite cancellation',async()=>{
 const read=deferred<MenuItem[]>();const write=deferred<MenuItem>();const api={list:vi.fn(()=>read.promise),save:vi.fn<MenuApi['save']>(()=>write.promise)};const {menu,dispose}=setup(api);
 const refresh=menu.refresh();menu.edit(menuSeed[0]!);read.resolve([]);await refresh;expect(menu.rows()).toHaveLength(12);expect(menu.loading()).toBe(false);
 menu.update({name:'Detached update'});flush();const request=menu.save();dispose();expect(api.save.mock.calls[0]![1].aborted).toBe(true);write.resolve({...menuSeed[0]!,name:'Detached update'});expect(await request).toBe(false);expect(menu.rows()[0]!.name).toBe('Margherita pizza');
});

it('disposal aborts outstanding reads and ignores late rejection without publishing an error',async()=>{
 const read=deferred<MenuItem[]>();const list=vi.fn<MenuApi['list']>(()=>read.promise);const {menu,dispose}=setup({list,save:vi.fn()});const request=menu.refresh();dispose();expect(list.mock.calls[0]![0].aborted).toBe(true);read.reject(new Error('Late transport rejection'));await request;expect(menu.loadError()).toBe('');expect(menu.rows()).toHaveLength(12);
});
