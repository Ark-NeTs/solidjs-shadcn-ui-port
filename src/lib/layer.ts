// Native top-layer lifecycle, controlled ownership, accessible names and cleanup; D19/D90.
import { createEffect, createUniqueId, onCleanup, untrack, type Accessor } from 'solid-js';
import type { JSX } from '@solidjs/web';
import { createControllable } from './controllable';
import { createRegistration } from './registration';
export type LayerProps={children?: JSX.Element; open?:boolean; defaultOpen?:boolean; onOpenChange?:(open:boolean)=>void};
export type LayerContext=ReturnType<typeof createLayer>;
export type FocusProps={onOpenAutoFocus?:(event:Event)=>void; onCloseAutoFocus?:(event:Event)=>void; onEscapeKeyDown?:(event:Event)=>void};
/** Share open state and accessor-based title/description IDs without delayed mirror effects. */
export function createLayer(props:LayerProps){
  const id=createUniqueId();const [open,request]=createControllable(()=>props.open,()=>props.defaultOpen??false,value=>props.onOpenChange?.(value));
  const [trigger,setTrigger]=createRegistration<HTMLElement|undefined>(undefined);
  const [anchor,setAnchor]=createRegistration<HTMLElement|undefined>(undefined);
  const [contentId,setContentId]=createRegistration<Accessor<string>>(()=>`layer-${id}`);
  const [title,setTitle]=createRegistration<Accessor<string>|undefined>(undefined);
  const [description,setDescription]=createRegistration<Accessor<string>|undefined>(undefined);
  return {id,open,request,trigger,setTrigger,anchor,setAnchor,contentId:()=>contentId()(),title:()=>title()?.(),description:()=>description()?.(),restoreFocus:true,
    register(kind:'content'|'title'|'description',value:Accessor<string>){
      if(kind==='content'){setContentId(value);return;}
      const setter=kind==='title'?setTitle:setDescription;setter(value);onCleanup(()=>setter(undefined));
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
/** Keep initial focus within this layer; mounted descendants own their own focus targets. */
function findOwnedTarget(node:HTMLElement,selector:string){
  return Array.from(node.querySelectorAll<HTMLElement>(selector)).find(target=>target.closest('[role=dialog],[role=alertdialog]')===node);
}
const modalOwners=new WeakMap<Document,HTMLElement[]>();
/** Guard native modal focus when an engine allows focus into an underlying modal. */
function containModalFocus(node:HTMLElement){
  const document=node.ownerDocument;
  const owners=modalOwners.get(document)??[];
  owners.push(node);modalOwners.set(document,owners);
  let previous:HTMLElement=node;
  let restoring=false;
  /** Only the most recently opened modal may recover an escaped focus target. */
  function remember(event:FocusEvent){
    if(owners.at(-1)!==node||restoring)return;
    const target=event.target as HTMLElement;
    if(node.contains(target)){previous=target;return;}
    const destination=previous.isConnected&&!previous.matches(':disabled')?previous:node;
    restoring=true;
    try{destination.focus({preventScroll:true});}finally{restoring=false;}
  }
  document.addEventListener('focusin',remember,true);
  return()=>{
    document.removeEventListener('focusin',remember,true);
    owners.splice(owners.indexOf(node),1);
    if(!owners.length)modalOwners.delete(document);
  };
}
/** Let the browser own modality and dismissal; synchronize only accepted state changes. */
export function useNativeLayer(context:LayerContext, element:Accessor<HTMLElement|undefined>, modal:Accessor<boolean>, props:FocusProps){
  createEffect(()=>[element(),context.open(),modal()] as const,([node,open,isModal])=>{
    if(!node||!open)return;
    let active=true;
    const document=node.ownerDocument;
    const unlock=isModal?lockScroll(document):()=>undefined;
    const releaseFocus=isModal?containModalFocus(node):()=>undefined;
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
    function closed(){
      const dialog=node as HTMLDialogElement;
      // close() queues its event; a force-mounted dialog may have reopened before delivery.
      if(dialog.open)return;
      context.request(false);queueMicrotask(()=>{if(active)dialog.showModal();});
    }
    /** Escape hooks for nonmodal popovers can cancel the native dismissal. */
    function keydown(event:KeyboardEvent){
      if((event.target as Element).closest('[role=dialog],[role=alertdialog]')!==node)return;
      if(!isModal&&event.key==='Escape'){context.restoreFocus=true;untrack(()=>props.onEscapeKeyDown?.(event));}
      if(isModal&&event.key==='Tab'&&!event.defaultPrevented){
        const targets=Array.from(node!.querySelectorAll<HTMLElement>('button,input,select,textarea,a[href],[tabindex]')).filter(item=>item.tabIndex>=0&&!item.matches(':disabled')&&item.getClientRects().length>0);
        const fallback=node!.querySelector<HTMLElement>('[data-slot=alert-dialog-content],[data-layer-content]')??node!;
        const first=targets[0]??fallback;const last=targets.at(-1)??fallback;
        if(event.shiftKey&&(document.activeElement===first||document.activeElement===node)){event.preventDefault();last.focus();}
        else if(!event.shiftKey&&(document.activeElement===last||document.activeElement===node)){event.preventDefault();first.focus();}
      }
    }
    if(isModal){node.addEventListener('cancel',cancel);node.addEventListener('close',closed);(node as HTMLDialogElement).showModal();}
    else {node.addEventListener('toggle',toggled);document.addEventListener('pointerdown',pointer,true);node.showPopover();}
    node.addEventListener('keydown',keydown);
    untrack(()=>{if(!notify(props.onOpenAutoFocus)){const focus=findOwnedTarget(node,'[autofocus],button:not(:disabled),input:not(:disabled),[tabindex="0"]');(findOwnedTarget(node,'[data-slot="alert-dialog-cancel"]:not(:disabled)')??focus??findOwnedTarget(node,'[data-slot=alert-dialog-content],[data-layer-content]')??node).focus();}});
    return ()=>{
      active=false;releaseFocus();
      node.removeEventListener('cancel',cancel);node.removeEventListener('close',closed);node.removeEventListener('toggle',toggled);node.removeEventListener('keydown',keydown);document.removeEventListener('pointerdown',pointer,true);
      if(isModal)(node as HTMLDialogElement).close();else if(node.matches(':popover-open'))node.hidePopover();
      unlock();untrack(()=>{if(!notify(props.onCloseAutoFocus)&&context.restoreFocus&&context.trigger()?.isConnected)context.trigger()?.focus();});
    };
  });
}
