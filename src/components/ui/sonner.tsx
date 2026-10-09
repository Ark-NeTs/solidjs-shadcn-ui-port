// Imperative notification composition behind the package boundary; D19/D90.
import {createEffect,createSignal,For,Show} from 'solid-js';
import type {JSX} from '@solidjs/web';
import {ToastProvider,ToastViewport,Toast,ToastTitle,ToastDescription,ToastAction,ToastClose} from './toast';
import {defaultToastStore,type ToastStore,type ToastRecord} from '../../lib/notifications';
import {cn} from '../../lib/utils';
export {toast,createToastStore,type ToastStore,type ToastOptions,type ToastRecord} from '../../lib/notifications';
export type ToasterProps={store?:ToastStore;duration?:number;visibleToasts?:number;position?:'top-left'|'top-center'|'top-right'|'bottom-left'|'bottom-center'|'bottom-right';theme?:'light'|'dark'|'system';class?:string;style?:JSX.CSSProperties;closeButton?:boolean;'aria-label'?:string};
/** Render a bounded FIFO queue; queued notifications start their clocks only when visible. */
export function Toaster(props:ToasterProps){const [items,setItems]=createSignal<ToastRecord[]>([],{ownedWrite:true});createEffect(()=>props.store??defaultToastStore,store=>store.subscribe(next=>setItems(next)));
 /** Map logical positioning without removing semantic theme customization. */
 function position(){const value=props.position??'bottom-right';const vertical=value.startsWith('top')?'top-0 bottom-auto':'bottom-0';if(value.endsWith('left'))return `${vertical} start-0 end-auto`;if(value.endsWith('center'))return `${vertical} start-1/2 end-auto -translate-x-1/2`;return `${vertical} end-0`;}
 return <ToastProvider duration={props.duration}><ToastViewport aria-label={props['aria-label']} style={props.style} class={cn('toaster group',props.theme==='dark'&&'dark',position(),props.class)}><For each={items().slice(0,Math.max(1,props.visibleToasts??3))}>{item=><Toast duration={item.kind==='loading'?Infinity:item.duration} variant={item.kind==='error'?'destructive':'default'} priority={item.kind==='error'?'foreground':'background'} dismissible={item.dismissible} onOpenChange={(_,reason)=>(props.store??defaultToastStore).dismiss(item.id,reason==='timeout')}><ToastTitle><span aria-hidden="true" class="me-2">{{normal:'•',success:'✓',info:'ⓘ',warning:'!',error:'×',loading:'…'}[item.kind]}</span>{item.title}</ToastTitle><Show when={item.description}><ToastDescription>{item.description}</ToastDescription></Show><Show when={item.action}>{action=><ToastAction onClick={()=>action().onClick()}>{action().label}</ToastAction>}</Show><Show when={props.closeButton!==false&&item.dismissible!==false}><ToastClose/></Show></Toast>}</For></ToastViewport></ToastProvider>;}
