// Owner-neutral notification records; no reactive roots or server-global writes; D19/D90.
import {isServer} from '@solidjs/web';
export type ToastKind='normal'|'success'|'info'|'warning'|'error'|'loading';
export type ToastOptions={id?:string|number;description?:string;duration?:number;dismissible?:boolean;action?:{label:string;onClick:()=>void};onDismiss?:()=>void;onAutoClose?:()=>void};
export type ToastRecord=ToastOptions&{id:string|number;title:string;kind:ToastKind;revision:number};
/** Create an isolated store for a root; calls during SSR intentionally have no effects. */
export function createToastStore(){let records:ToastRecord[]=[];let nextId=0;let revision=0;const listeners=new Set<(records:ToastRecord[])=>void>();
 /** Publish immutable snapshots without coupling producers to a Solid owner. */
 function publish(){for(const listener of listeners)listener([...records]);}
 /** Insert or replace a named notification; replacement invalidates pending promise results. */
 function show(title:string,options:ToastOptions={},kind:ToastKind='normal'){let id=options.id;if(id===undefined){do{id=++nextId;}while(records.some(item=>item.id===id));}if(isServer)return id;const entry={...options,id,title,kind,revision:++revision};const index=records.findIndex(item=>item.id===id);if(index<0)records=[...records,entry];else records=records.map(item=>item.id===id?entry:item);publish();return id;}
 /** Dismiss one notification or clear the queue, firing the requested lifecycle callback. */
 function dismiss(id?:string|number,automatic=false){const removed=records.filter(item=>id===undefined||item.id===id);records=records.filter(item=>!removed.includes(item));publish();for(const item of removed){if(automatic)item.onAutoClose?.();else item.onDismiss?.();}}
 /** Subscribe under a UI owner and release only that observer when it unmounts. */
 function subscribe(listener:(records:ToastRecord[])=>void){listeners.add(listener);listener([...records]);return ()=>{listeners.delete(listener);};}
 /** Resolve only the still-current loading record, never reviving dismissed or replaced work. */
 function promise<T>(work:Promise<T>,options:ToastOptions&{loading:string;success:string|((value:T)=>string);error:string|((error:unknown)=>string)}){const id=show(options.loading,options,'loading');const ticket=records.find(item=>item.id===id);void work.then(value=>{if(ticket&&records.includes(ticket))show(typeof options.success==='function'?options.success(value):options.success,{...options,id},'success');},error=>{if(ticket&&records.includes(ticket))show(typeof options.error==='function'?options.error(error):options.error,{...options,id},'error');});return id;}
 return {show,dismiss,subscribe,promise,getSnapshot:()=>[...records]};}
export type ToastStore=ReturnType<typeof createToastStore>;
export const defaultToastStore=createToastStore();
/** Callable service with named semantic variants and cancellation-safe promise handling. */
export const toast=Object.assign((title:string,options?:ToastOptions)=>defaultToastStore.show(title,options),{success:(title:string,options?:ToastOptions)=>defaultToastStore.show(title,options,'success'),info:(title:string,options?:ToastOptions)=>defaultToastStore.show(title,options,'info'),warning:(title:string,options?:ToastOptions)=>defaultToastStore.show(title,options,'warning'),error:(title:string,options?:ToastOptions)=>defaultToastStore.show(title,options,'error'),loading:(title:string,options?:ToastOptions)=>defaultToastStore.show(title,options,'loading'),dismiss:defaultToastStore.dismiss,promise:defaultToastStore.promise});
