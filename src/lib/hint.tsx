// Nonmodal pointer/focus previews with owner state, cancellable timers and native top-layer lifetime; D19/D90.
import { createContext, createEffect, createUniqueId, omit, onCleanup, Show, untrack, useContext } from 'solid-js';
import type { JSX } from '@solidjs/web';
import { autoUpdate, computePosition, offset, flip, shift, size } from '@floating-ui/dom';
import { createControllable, callHandler } from './controllable';
import { createRegistration } from './registration';
import { cn } from './utils';
export type HintProps={children?:JSX.Element;open?:boolean;defaultOpen?:boolean;onOpenChange?:(open:boolean)=>void;disabled?:boolean;contentId?:string;openDelay?:number;closeDelay?:number};
export type HintProviderProps={children?:JSX.Element;delayDuration?:number;skipDelayDuration?:number;disableHoverableContent?:boolean};
const Provider=createContext<{delay:()=>number;hoverable:()=>boolean;warm:()=>boolean;closed:()=>void}|null>(null);
/** Keep a provider's skip-delay window local to its mounted subtree. */
export function HintProvider(props:HintProviderProps){
 let closedAt=-Infinity;
 const context={delay:()=>props.delayDuration??0,hoverable:()=>!props.disableHoverableContent,warm:()=>Date.now()-closedAt<=(props.skipDelayDuration??300),closed:()=>{closedAt=Date.now();}};
 return <Provider value={context}>{props.children}</Provider>;
}
/** Model hover/focus intent without mirroring controlled state. */
function createHint(props:HintProps,kind:'tooltip'|'hover-card'){
 const provider=useContext(Provider);const id=createUniqueId();
 const [selected,request]=createControllable(()=>props.open,()=>props.defaultOpen??false,next=>props.onOpenChange?.(next));
 const [trigger,setTrigger]=createRegistration<HTMLElement|undefined>(undefined);const [content,setContent]=createRegistration<HTMLElement|undefined>(undefined);
 let timer:ReturnType<typeof setTimeout>|undefined;let pending:boolean|undefined;let pointerInside=false;let suppressed=false;
 const open=()=>!props.disabled&&selected();const hoverable=()=>kind==='hover-card'||(provider?.hoverable()??true);
 /** Invalidate pending opens/closes before a new interaction or disposal. */
 function clear(){clearTimeout(timer);timer=undefined;pending=undefined;}
 /** Native disabled triggers cannot begin a delayed preview. */
 function blocked(){return props.disabled||trigger()?.matches(':disabled')||trigger()?.getAttribute('aria-disabled')==='true';}
 /** Treat focus inside either part as continuing engagement. */
 function contains(target:EventTarget|null){return target instanceof Node&&(Boolean(trigger()?.contains(target))||Boolean(content()?.contains(target)));}
 /** Hover must not dismiss content while a keyboard user is still engaged. */
 function focused(){return contains(trigger()?.ownerDocument.activeElement??null);}
 /** A repeated pointer move must not restart the close countdown. */
 function schedule(next:boolean,delay:number){
  if(next&&blocked())return;
  if(pending===next)return;clear();pending=next;
  /** Recheck eligibility when the timer fires; disabled/unmounted owners cannot reopen. */
  function commit(){timer=undefined;pending=undefined;if(!next||!blocked())request(next);}
  if(delay<=0)commit();else timer=setTimeout(commit,delay);
 }
 /** Entering visible content keeps it hoverable; entering the trigger schedules opening. */
 function enter(event:PointerEvent,onContent=false){
  if(event.pointerType==='touch'||(onContent&&!hoverable()))return;
  pointerInside=true;clear();
  if(!onContent&&!suppressed){const delay=kind==='tooltip'?(provider?.warm()?0:props.openDelay??provider?.delay()??0):props.openDelay??700;schedule(true,delay);}
 }
 /** Allow travel across the gap, while canceled pending opens cannot flash later. */
 function leave(event:PointerEvent){
  if(event.pointerType==='touch')return;pointerInside=false;suppressed=false;clear();
  if(contains(event.relatedTarget)||focused())return;schedule(false,props.closeDelay??(kind==='tooltip'?100:300));
 }
 /** Keyboard focus opens immediately; pointer-down focus must not reopen a dismissed tooltip. */
 function focus(){untrack(()=>{if(suppressed||blocked())return;clear();request(true);});}
 /** Keep keyboard travel into the card alive; ordinary blur dismisses without moving focus. */
 function blur(event:FocusEvent){untrack(()=>{suppressed=false;if(contains(event.relatedTarget)||pointerInside)return;clear();request(false);});}
 /** Escape/click dismissal stays closed until a fresh focus or pointer entry. */
 function dismiss(){clear();suppressed=true;request(false);}
 let wasOpen=false;
 createEffect(()=>[open(),props.disabled] as const,([next,disabled])=>{if(disabled||!next)clear();if(wasOpen&&!next&&kind==='tooltip')provider?.closed();wasOpen=next;});
 onCleanup(clear);
 return {kind,open,trigger,setTrigger,content,setContent,hoverable,contains,focused,clear,schedule,enter,leave,focus,blur,dismiss,props,id:()=>props.contentId||`${kind}-${id}`,disabled:()=>Boolean(props.disabled)};
}
const Context=createContext<ReturnType<typeof createHint>|null>(null);
/** Share one preview owner across compound parts. */
export function HintRoot(props:HintProps & {kind:'tooltip'|'hover-card'}){const context=createHint(props,props.kind);return <Context value={context}>{props.children}</Context>;}
/** Fail explicitly when a compound part has no owner. */
export function useHint(){const context=useContext(Context);if(!context)throw new Error('Preview parts must be inside Tooltip or HoverCard.');return context;}
export type HintContentProps=Omit<JSX.HTMLAttributes<HTMLDivElement>,'id'> & {side?:'top'|'right'|'bottom'|'left';align?:'start'|'center'|'end';sideOffset?:number;alignOffset?:number;collisionPadding?:number;avoidCollisions?:boolean;forceMount?:boolean;onEscapeKeyDown?:(event:KeyboardEvent)=>void};
const layers=new WeakMap<Document,HTMLElement[]>();
/** Keep a stable shell for SSR descriptions; ordinary closed children are unmounted. */
export function HintContent(props:HintContentProps){
 const context=useHint();const [element,setElement]=createRegistration<HTMLDivElement|undefined>(undefined);
 const rest=omit(props,'class','ref','children','side','align','sideOffset','alignOffset','collisionPadding','avoidCollisions','forceMount','onEscapeKeyDown','onPointerEnter','onPointerLeave','onFocusIn','onFocusOut');
 createEffect(()=>[element(),context.trigger(),context.open(),props.side??(context.kind==='tooltip'?'top':'bottom'),props.align??'center',props.sideOffset??(context.kind==='tooltip'?6:4),props.alignOffset??0,props.collisionPadding??8,props.avoidCollisions??true,props.class,props.style] as const,([node,anchor,open,side,align,gap,cross,padding,collide])=>{
  if(!node||!anchor||!open)return;
  let active=true;let version=0;const document=node.ownerDocument;const stack=layers.get(document)??[];stack.push(node);layers.set(document,stack);
  const originalWidth=node.style.maxWidth;const originalHeight=node.style.maxHeight;let appliedWidth=originalWidth;let appliedHeight=originalHeight;
  const limits=getComputedStyle(node);const maxWidth=limits.maxWidth.replace('none','100vw');const maxHeight=limits.maxHeight.replace('none','100vh');
  /** Ignore obsolete coordinates after disposal or a newer geometry update. */
  async function update(){const ticket=++version;const result=await computePosition(anchor!,node!,{strategy:'fixed',placement:align==='center'?side:`${side}-${align}`,middleware:[offset({mainAxis:gap,crossAxis:cross}),...(collide?[flip({padding}),shift({padding}),size({padding,apply({availableWidth,availableHeight,elements}){if(active&&ticket===version){Object.assign(elements.floating.style,{maxWidth:`min(${Math.max(0,availableWidth)}px, ${maxWidth})`,maxHeight:`min(${Math.max(0,availableHeight)}px, ${maxHeight})`});appliedWidth=node!.style.maxWidth;appliedHeight=node!.style.maxHeight;}}})]:[])]});if(active&&ticket===version){Object.assign(node!.style,{left:`${result.x}px`,top:`${result.y}px`});node!.dataset.side=result.placement.split('-')[0];}}
  /** Topmost preview consumes Escape so the underlying modal remains open. */
  function keydown(event:KeyboardEvent){if(event.key!=='Escape'||stack.at(-1)!==node||event.defaultPrevented)return;untrack(()=>props.onEscapeKeyDown?.(event));if(!event.defaultPrevented)context.dismiss();event.preventDefault();event.stopPropagation();}
  /** Outside activation dismisses without stealing the destination's native focus. */
  function pointer(event:PointerEvent){if(!context.contains(event.target))context.dismiss();}
  /** A rectangular bridge allows slow pointer travel between trigger and preview. */
  function move(event:PointerEvent){
   if(event.pointerType==='touch'||!context.hoverable()||context.focused())return;
   const a=anchor!.getBoundingClientRect();const b=node!.getBoundingClientRect();
   const inside=event.clientX>=Math.min(a.left,b.left)&&event.clientX<=Math.max(a.right,b.right)&&event.clientY>=Math.min(a.top,b.top)&&event.clientY<=Math.max(a.bottom,b.bottom);
   if(inside)context.clear();else context.schedule(false,context.props.closeDelay??(context.kind==='tooltip'?100:300));
  }
  node.showPopover();const dispose=autoUpdate(anchor,node,()=>{void update();},{ancestorScroll:false,animationFrame:true});
  document.addEventListener('keydown',keydown,true);document.addEventListener('pointerdown',pointer,true);document.addEventListener('pointermove',move);
  return()=>{active=false;dispose();document.removeEventListener('keydown',keydown,true);document.removeEventListener('pointerdown',pointer,true);document.removeEventListener('pointermove',move);stack.splice(stack.indexOf(node),1);if(!stack.length)layers.delete(document);node.hidePopover();if(node.style.maxWidth===appliedWidth)node.style.maxWidth=originalWidth;if(node.style.maxHeight===appliedHeight)node.style.maxHeight=originalHeight;};
 });
 onCleanup(()=>context.setContent(undefined));
 const tooltip=()=>context.kind==='tooltip';
 return <div {...rest} ref={node=>{setElement(node);context.setContent(node);if(typeof props.ref==='function')props.ref(node);}} id={context.id()} popover="manual" role={tooltip()?'tooltip':props.role} hidden={!context.open()} data-slot={`${context.kind}-content`} data-state={context.open()?'open':'closed'} data-open={context.open()?'':undefined} data-closed={!context.open()?'':undefined} data-side={props.side??(tooltip()?'top':'bottom')}
 class={cn(tooltip()?'z-50 inline-flex w-fit max-w-xs items-center gap-1.5 rounded-md bg-foreground px-3 py-1.5 text-xs text-background':'z-50 w-64 rounded-lg bg-popover p-2.5 text-sm text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-hidden','fixed m-0 overflow-auto border-0 transition-none',props.class)}
 onPointerEnter={event=>{callHandler(props.onPointerEnter,event);if(!event.defaultPrevented)context.enter(event,true);}} onPointerLeave={event=>{callHandler(props.onPointerLeave,event);if(!event.defaultPrevented)context.leave(event);}} onFocusIn={event=>{callHandler(props.onFocusIn,event);if(!event.defaultPrevented)context.clear();}} onFocusOut={event=>{callHandler(props.onFocusOut,event);if(!event.defaultPrevented)context.blur(event);}}><Show when={context.open()||props.forceMount}>{props.children}</Show></div>;
}
