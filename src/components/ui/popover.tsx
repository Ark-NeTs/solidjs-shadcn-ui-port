// Native top-layer popover with Floating UI positioning and shared shadcn styling; D19/D90.
import { createContext, createEffect, createSignal, omit, onCleanup, Show, useContext } from 'solid-js';
import { Dynamic, type JSX } from '@solidjs/web';
import { autoUpdate, computePosition, offset, flip, shift, size } from '@floating-ui/dom';
import { cn } from '../../lib/utils';
import { callHandler } from '../../lib/controllable';
import { createLayer, useNativeLayer, type LayerContext, type LayerProps, type FocusProps } from '../../lib/layer';
const Context=createContext<(LayerContext & {modal:()=>boolean})|null>(null);
/** Require the root so IDs, open state and focus stay within one owner. */
function usePopover(){const value=useContext(Context);if(!value)throw new Error('Popover parts must be inside Popover.');return value;}
export type PopoverProps=LayerProps & {modal?:boolean};
/** Keep content in its theme ancestry while the browser renders it in the top layer. */
export function Popover(props:PopoverProps){const context={...createLayer(props),modal:()=>props.modal??false};return <Context value={context}>{props.children}</Context>;}
/** Use a native button as the anchor and accessible popup controller. */
export function PopoverTrigger(props:JSX.ButtonHTMLAttributes<HTMLButtonElement>){
 const context=usePopover();const rest=omit(props,'ref','onClick');
 return <button {...rest} ref={node=>{context.setTrigger(node);if(typeof props.ref==='function')props.ref(node);}} type="button" data-slot="popover-trigger" aria-haspopup="dialog" aria-expanded={context.open()?'true':'false'} aria-controls={context.contentId()} data-state={context.open()?'open':'closed'}
 onClick={event=>{callHandler(props.onClick,event);if(!event.defaultPrevented){context.restoreFocus=true;context.request(!context.open());}}}/>;
}
/** Optional noninteractive positioning anchor; the trigger remains the focus-return target. */
export function PopoverAnchor(props:JSX.HTMLAttributes<HTMLDivElement>){const context=usePopover();onCleanup(()=>context.setAnchor(undefined));const rest=omit(props,'ref');return <div {...rest} data-slot="popover-anchor" ref={node=>{context.setAnchor(node);if(typeof props.ref==='function')props.ref(node);}}/>;}
export type PopoverContentProps=JSX.HTMLAttributes<HTMLDivElement | HTMLDialogElement> & FocusProps & {side?:'top'|'right'|'bottom'|'left';align?:'start'|'center'|'end';sideOffset?:number;alignOffset?:number;collisionPadding?:number;avoidCollisions?:boolean;forceMount?:boolean};
/** Mount only active content by default, with an explicit forceMount option. */
export function PopoverContent(props:PopoverContentProps){const context=usePopover();context.register('content',()=>props.id||`popover-${context.id}`);return <Show when={context.open()||props.forceMount}><PopoverView {...props}/></Show>;}
/** Synchronize native lifetime and observer-backed placement; reject stale async coordinates. */
function PopoverView(props:PopoverContentProps){
 const context=usePopover();const [element,setElement]=createSignal<HTMLElement|undefined>(undefined,{ownedWrite:true});
 const rest=omit(props,'id','class','ref','style','side','align','sideOffset','alignOffset','collisionPadding','avoidCollisions','forceMount','onOpenAutoFocus','onCloseAutoFocus','onEscapeKeyDown');
 useNativeLayer(context,element,context.modal,props);
 createEffect(()=>[element(),context.open(),context.anchor()??context.trigger(),props.side??'bottom',props.align??'center',props.sideOffset??4,props.alignOffset??0,props.collisionPadding??8,props.avoidCollisions??true] as const,([node,open,anchor,side,align,gap,cross,padding,collide])=>{
  if(!node||!open||!anchor)return;
  let active=true;let version=0;
  const initialMaxWidth=node.style.maxWidth;const initialMaxHeight=node.style.maxHeight;
  /** Recompute on scroll/resize without retaining outdated asynchronous results. */
  async function update(){const ticket=++version;const result=await computePosition(anchor!,node!,{strategy:'fixed',placement:align==='center'?side:`${side}-${align}`,middleware:[offset({mainAxis:gap,crossAxis:cross}),...(collide?[flip({padding}),shift({padding}),size({padding,apply({availableWidth,availableHeight,elements}){if(!active||ticket!==version)return;Object.assign(elements.floating.style,{'maxWidth':`${Math.max(0,availableWidth)}px`,'maxHeight':`${Math.max(0,availableHeight)}px`});}})]:[])]});if(active&&ticket===version){Object.assign(node!.style,{left:`${result.x}px`,top:`${result.y}px`});node!.dataset.side=result.placement.split('-')[0];}}
  // Track anchor geometry per frame: scroll-event writes can lag compositor scrolling.
  const dispose=autoUpdate(anchor,node,()=>{void update();},{ancestorScroll:false,animationFrame:true});return()=>{active=false;dispose();node.style.maxWidth=initialMaxWidth;node.style.maxHeight=initialMaxHeight;};
 });
 return <Dynamic component={context.modal()?'dialog':'div'} {...rest} ref={(node:HTMLElement)=>{setElement(node);if(typeof props.ref==='function')props.ref(node as HTMLDivElement | HTMLDialogElement);}} id={context.contentId()} role="dialog" tabindex={-1} popover={context.modal()?undefined:'auto'} aria-modal={context.modal()?'true':undefined} aria-labelledby={props['aria-labelledby']??context.title()} aria-describedby={props['aria-describedby']??context.description()} data-slot="popover-content" data-state={context.open()?'open':'closed'} data-open={context.open()?'':undefined} data-closed={!context.open()?'':undefined} data-side={props.side??'bottom'}
 class={cn("z-50 flex w-72 origin-(--radix-popover-content-transform-origin) flex-col gap-2.5 rounded-lg bg-popover p-2.5 text-sm text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-hidden transition-none duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",'fixed m-0 overflow-auto border-0 [--radix-popover-content-transform-origin:center]',props.class)} style={props.style}/>;
}
/** Explicit close action, useful inside content without reaching into context. */
export function PopoverClose(props:JSX.ButtonHTMLAttributes<HTMLButtonElement>){const context=usePopover();const rest=omit(props,'onClick');return <button {...rest} type="button" data-slot="popover-close" onClick={event=>{callHandler(props.onClick,event);if(!event.defaultPrevented){context.restoreFocus=true;context.request(false);}}}/>;}
/** Compose the content heading group. */
export function PopoverHeader(props:JSX.HTMLAttributes<HTMLDivElement>){const rest=omit(props,'class');return <div {...rest} data-slot="popover-header" class={cn("flex flex-col gap-0.5 text-sm",props.class)}/>;}
/** Register a live heading ID for the content's accessible name. */
export function PopoverTitle(props:JSX.HTMLAttributes<HTMLHeadingElement>){const context=usePopover();const id=()=>props.id||`popover-${context.id}-title`;context.register('title',id);const rest=omit(props,'id','class');return <h2 {...rest} id={id()} data-slot="popover-title" class={cn("font-medium",props.class)}/>;}
/** Register a live description ID without copying it through an effect. */
export function PopoverDescription(props:JSX.HTMLAttributes<HTMLParagraphElement>){const context=usePopover();const id=()=>props.id||`popover-${context.id}-description`;context.register('description',id);const rest=omit(props,'id','class');return <p {...rest} id={id()} data-slot="popover-description" class={cn("text-muted-foreground",props.class)}/>;}
