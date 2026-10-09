// Playground application state; persistence stays behind an injected API, outside UI components.
import {createSignal,onCleanup} from 'solid-js';
export type MenuItem={id:string;name:string;priceCents:number;category:string;notes:string;vegetarian:boolean;available:boolean};
export type MenuDraft=Omit<MenuItem,'priceCents'>&{price:string};
export type MenuErrors=Partial<Record<'name'|'price'|'notes',string>>;
export type MenuApi={list:(signal:AbortSignal)=>Promise<MenuItem[]>;save:(item:MenuItem,signal:AbortSignal)=>Promise<MenuItem>};
export const menuSeed:MenuItem[]=['Margherita pizza','Roasted vegetable bowl','Lemon chicken','Tomato soup','Garden salad','Mushroom risotto','Grilled salmon','Spinach pasta','Chocolate cake','Vanilla ice cream','Sparkling water','Fresh lemonade'].map((name,index)=>({id:`menu-${index+1}`,name,priceCents:800+index*125,category:index<8?'Kitchen':index<10?'Desserts':'Drinks',notes:'Prepared fresh to order.',vegetarian:index!==2&&index!==6,available:index!==5}));
/** Keep currency parsing explicit: decimal currency input becomes integer cents. */
export function validateMenuDraft(draft:MenuDraft):{errors:MenuErrors;item:MenuItem}{
 const errors:MenuErrors={};const name=draft.name.trim();const price=draft.price.trim();
 if(name.length<2||name.length>80)errors.name='Use 2 to 80 characters for the item name.';
 if(!/^\d{1,5}(?:\.\d{1,2})?$/.test(price)||Number(price)<=0)errors.price='Enter a price from 0.01 to 99999.99, with at most two decimals.';
 if(draft.notes.length>240)errors.notes='Keep kitchen notes within 240 characters.';
 return {errors,item:{id:draft.id,name,priceCents:Math.round(Number(price)*100),category:draft.category,notes:draft.notes,vegetarian:draft.vegetarian,available:draft.available}};
}
/** Separate confirmed rows, editable drafts and request lifetimes; never replay a failed save. */
export function createAdminMenu(api:MenuApi,initial:MenuItem[]=menuSeed){
 const [rows,setRows]=createSignal(initial.map(item=>({...item})));
 const [draft,setDraft]=createSignal<MenuDraft|null>(null);
 const [errors,setErrors]=createSignal<MenuErrors>({});
 const [saving,setSaving]=createSignal(false);const [loading,setLoading]=createSignal(false);
 const [saveError,setSaveError]=createSignal('');const [loadError,setLoadError]=createSignal('');const [notice,setNotice]=createSignal('');
 let alive=true;let epoch=0;let read:AbortController|undefined;let write:AbortController|undefined;
 onCleanup(()=>{alive=false;epoch++;read?.abort();write?.abort();});
 /** Open a snapshot of the selected confirmed record, never the previous item's draft. */
 function edit(item:MenuItem){if(!alive||write)return;epoch++;read?.abort();setLoading(false);setDraft({...item,price:(item.priceCents/100).toFixed(2)});setErrors({});setSaveError('');setNotice('');}
 /** Disabled controls are also guarded against programmatic or queued input. */
 function update(patch:Partial<MenuDraft>){if(alive&&!write)setDraft(current=>current?{...current,...patch}:null);}
 function close(){if(!alive||write)return;setDraft(null);setErrors({});setSaveError('');}
 function reset(){const current=draft();const item=rows().find(row=>row.id===current?.id);if(item)edit(item);}
 async function refresh(){if(!alive||write||draft())return;const token=++epoch;read?.abort();const request=new AbortController();read=request;setLoading(true);setLoadError('');
  try{const result=await api.list(request.signal);if(alive&&token===epoch)setRows(result);}
  catch{if(alive&&token===epoch&&!request.signal.aborted)setLoadError('Could not refresh the menu. Your current items are retained. Try again.');}
  finally{if(alive&&token===epoch)setLoading(false);}
 }
 async function save(){const current=draft();if(!alive||write||!current)return false;const parsed=validateMenuDraft(current);setErrors(parsed.errors);if(Object.keys(parsed.errors).length)return false;
  const token=++epoch;read?.abort();const request=new AbortController();write=request;setSaving(true);setSaveError('');
  try{const item=await api.save(parsed.item,request.signal);if(!alive||token!==epoch)return false;setRows(currentRows=>currentRows.map(row=>row.id===item.id?item:row));setDraft(null);setNotice(`Saved ${item.name}.`);return true;}
  catch{if(alive&&token===epoch&&!request.signal.aborted)setSaveError('Could not save this item. Your draft is preserved. Review it and try again.');return false;}
  finally{if(alive&&token===epoch){write=undefined;setSaving(false);}}
 }
 return {rows,draft,errors,saving,loading,saveError,loadError,notice,edit,update,close,reset,refresh,save};
}
/** An abortable demo delay models a request without reaching the network. */
function delay(ms:number,signal:AbortSignal){return new Promise<void>((resolve,reject)=>{if(signal.aborted){reject(new Error('Canceled'));return;}const timer=setTimeout(()=>{signal.removeEventListener('abort',abort);resolve();},ms);function abort(){clearTimeout(timer);signal.removeEventListener('abort',abort);reject(new Error('Canceled'));}signal.addEventListener('abort',abort,{once:true});});}
/** Injectable local service used only by the gallery; each page visit starts with fresh records. */
export function createDemoMenuApi(nextOutcome:()=>string,onRequest:(kind:'read'|'save')=>void):MenuApi{
 let records=menuSeed.map(item=>({...item}));
 return {async list(signal){onRequest('read');const outcome=nextOutcome();await delay(350,signal);if(outcome==='reject')throw new Error('Demo rejection');return records.map(item=>({...item}));},
 async save(item,signal){onRequest('save');const outcome=nextOutcome();await delay(outcome==='slow'?1800:350,signal);if(outcome==='reject')throw new Error('Demo rejection');records=records.map(row=>row.id===item.id?{...item}:row);return {...item};}};
}
