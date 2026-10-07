// Native top-layer lifecycle, controlled ownership, accessible names and cleanup; D19/D90.
import { createEffect, createSignal, createUniqueId, onCleanup, untrack, type Accessor } from 'solid-js';
import type { JSX } from '@solidjs/web';
import { createControllable } from './controllable';
export type LayerProps={children?: JSX.Element; open?:boolean; defaultOpen?:boolean; onOpenChange?:(open:boolean)=>void};
export type LayerContext=ReturnType<typeof createLayer>;
export type FocusProps={onOpenAutoFocus?:(event:Event)=>void; onCloseAutoFocus?:(event:Event)=>void; onEscapeKeyDown?:(event:Event)=>void};
/** Share open state and accessor-based title/description IDs without delayed mirror effects. */
export function createLayer(props:LayerProps){
  const id=createUniqueId();const [open,request]=createControllable(()=>props.open,()=>props.defaultOpen??false,value=>props.onOpenChange?.(value));
  const [trigger,setTrigger]=createSignal<HTMLElement|undefined>(undefined,{ownedWrite:true});
  const [anchor,setAnchor]=createSignal<HTMLElement|undefined>(undefined,{ownedWrite:true});
  const [contentId,setContentId]=createSignal<Accessor<string>>(()=>()=>`layer-${id}`,{ownedWrite:true});
  const [title,setTitle]=createSignal<Accessor<string>|undefined>(undefined,{ownedWrite:true});
  const [description,setDescription]=createSignal<Accessor<string>|undefined>(undefined,{ownedWrite:true});
  return {id,open,request,trigger,setTrigger,anchor,setAnchor,contentId:()=>contentId()(),title:()=>title()?.(),description:()=>description()?.(),restoreFocus:true,
    register(kind:'content'|'title'|'description',value:Accessor<string>){
      if(kind==='content'){setContentId(()=>value);return;}
      const setter=kind==='title'?setTitle:setDescription;setter(()=>value);onCleanup(()=>setter(undefined));
    },
  };
}
/** Dispatch cancellable lifecycle hooks outside reactive dependency tracking. */
export function notify(callback:((event:Event)=>void)|undefined){const event=new Event('autofocus',{cancelable:true});callback?.(event);return event.defaultPrevented;}
const locks=new WeakMap<Document,{count:number;overflow:string}>();
/** Restore the original scroll style only after the last modal releases it. */
function lockScroll(document:Document){
  const lock=locks.get(document)??{count:0,overflow:document.documentElement.style.overflow};lock.count++;locks.set(document,lock);document.documentElement.style.overflow='hidden';
  return ()=>{if(--lock.count===0){document.documentElement.style.overflow=lock.overflow;locks.delete(document);}};
}
/** Let the browser own modality and dismissal; synchronize only accepted state changes. */
export function useNativeLayer(context:LayerContext, element:Accessor<HTMLElement|undefined>, modal:Accessor<boolean>, props:FocusProps){
  createEffect(()=>[element(),context.open(),modal()] as const,([node,open,isModal])=>{
    if(!node||!open)return;
    let active=true;
    const document=node.ownerDocument;
    const unlock=isModal?lockScroll(document):()=>undefined;
    /** Native Escape requests are cancellable for dialogs and controlled owners. */
    function cancel(event:Event){event.preventDefault();
      // The native cancel was prevented above; use a separate event for the public cancellation contract.
      const requestEvent=new Event('escapeKeyDown',{cancelable:true});untrack(()=>props.onEscapeKeyDown?.(requestEvent));if(!requestEvent.defaultPrevented){context.restoreFocus=true;context.request(false);}
    }
    /** Record whether light dismissal should keep the newly clicked outside control focused. */
    function pointer(event:PointerEvent){const target=event.target as Node;context.restoreFocus=node!.contains(target)||Boolean(context.trigger()?.contains(target));}
    /** Request a close after native light dismissal, restoring controlled rejections safely. */
    function toggled(event:Event){
      if((event as ToggleEvent).newState!=='closed')return;
      context.request(false);queueMicrotask(()=>{if(active)node!.showPopover();});
    }
    /** Preserve controlled authority even when application markup calls dialog.close(). */
    function closed(){context.request(false);queueMicrotask(()=>{if(active)(node as HTMLDialogElement).showModal();});}
    /** Escape hooks for nonmodal popovers can cancel the native dismissal. */
    function keydown(event:KeyboardEvent){
      if((event.target as Element).closest('[role=dialog],[role=alertdialog]')!==node)return;
      if(!isModal&&event.key==='Escape'){context.restoreFocus=true;untrack(()=>props.onEscapeKeyDown?.(event));}
      if(isModal&&event.key==='Tab'&&!event.defaultPrevented){
        const targets=Array.from(node!.querySelectorAll<HTMLElement>('button,input,select,textarea,a[href],[tabindex]')).filter(item=>item.tabIndex>=0&&!item.matches(':disabled')&&item.getClientRects().length>0);
        const fallback=node!.querySelector<HTMLElement>('[data-slot=alert-dialog-content]')??node!;
        const first=targets[0]??fallback;const last=targets.at(-1)??fallback;
        if(event.shiftKey&&(document.activeElement===first||document.activeElement===node)){event.preventDefault();last.focus();}
        else if(!event.shiftKey&&(document.activeElement===last||document.activeElement===node)){event.preventDefault();first.focus();}
      }
    }
    if(isModal){node.addEventListener('cancel',cancel);node.addEventListener('close',closed);(node as HTMLDialogElement).showModal();}
    else {node.addEventListener('toggle',toggled);document.addEventListener('pointerdown',pointer,true);node.showPopover();}
    node.addEventListener('keydown',keydown);
    untrack(()=>{if(!notify(props.onOpenAutoFocus)){const focus=node.querySelector<HTMLElement>('[data-slot="alert-dialog-cancel"]:not(:disabled),[autofocus],button:not(:disabled),input:not(:disabled),[tabindex="0"]');(node.querySelector<HTMLElement>('[data-slot="alert-dialog-cancel"]:not(:disabled)')??focus??node.querySelector<HTMLElement>('[data-slot=alert-dialog-content]')??node).focus();}});
    return ()=>{
      active=false;
      node.removeEventListener('cancel',cancel);node.removeEventListener('close',closed);node.removeEventListener('toggle',toggled);node.removeEventListener('keydown',keydown);document.removeEventListener('pointerdown',pointer,true);
      if(isModal)(node as HTMLDialogElement).close();else if(node.matches(':popover-open'))node.hidePopover();
      unlock();untrack(()=>{if(!notify(props.onCloseAutoFocus)&&context.restoreFocus&&context.trigger()?.isConnected)context.trigger()?.focus();});
    };
  });
}
