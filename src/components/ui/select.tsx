// Single selection with native form participation, owned keyboard state and a top-layer popup; D19/D90.
import { createContext, createEffect, createMemo, createSignal, createUniqueId, For, omit, onCleanup, Show, untrack, useContext } from 'solid-js';
import type { JSX } from '@solidjs/web';
import { autoUpdate, computePosition, flip, offset, shift, size } from '@floating-ui/dom';
import { callHandler, createControllable } from '../../lib/controllable';
import { createRegistration } from '../../lib/registration';
import { cn } from '../../lib/utils';
export type SelectOption={value:string;label:string;disabled?:boolean};
export type SelectProps={children?:JSX.Element;items:readonly SelectOption[];value?:string;defaultValue?:string;onValueChange?:(value:string)=>void;open?:boolean;defaultOpen?:boolean;onOpenChange?:(open:boolean)=>void;name?:string;form?:string;required?:boolean;disabled?:boolean;readOnly?:boolean};
/** Keep option data available to server markup, forms and labels even while the popup is closed. */
function createSelect(props:SelectProps){
 const id=createUniqueId();const initial=untrack(()=>props.defaultValue??'');
 const [value,requestValue]=createControllable(()=>props.value,()=>initial,next=>props.onValueChange?.(next));
 const [open,requestOpen]=createControllable(()=>props.open,()=>props.defaultOpen??false,next=>props.onOpenChange?.(next));
 const [trigger,setTrigger]=createRegistration<HTMLButtonElement|undefined>(undefined);const [viewport,setViewport]=createRegistration<HTMLDivElement|undefined>(undefined);const [native,setNative]=createRegistration<HTMLSelectElement|undefined>(undefined);
 const [triggerId,setTriggerId]=createRegistration<()=>string>(()=>`select-${id}-trigger`);
 const [highlight,setHighlight]=createSignal<string>();const [attempted,setAttempted]=createSignal(false);
 const enabled=createMemo(()=>props.items.filter(item=>!item.disabled));const selected=createMemo(()=>props.items.find(item=>item.value===value()));
 const active=()=>enabled().find(item=>item.value===highlight())??enabled().find(item=>item.value===value())??enabled()[0];
 let search='';let searchTimer:ReturnType<typeof setTimeout>|undefined;let dismissTimer:ReturnType<typeof setTimeout>|undefined;
 onCleanup(()=>{clearTimeout(searchTimer);clearTimeout(dismissTimer);});
 /** Keep a controlled rejection authoritative after native select activation. */
 function synchronize(node:HTMLSelectElement){node.value=value();}
 /** Selection requests close the popup; the owner may reject either request independently. */
 function choose(next:string){if(props.disabled||props.readOnly||!enabled().some(item=>item.value===next))return;requestValue(next);requestOpen(false);}
 /** Start at the selected item, or the first/last enabled option for an empty selection. */
 function show(last=false){clearTimeout(dismissTimer);if(props.disabled||props.readOnly)return;setHighlight(selected()?.disabled?undefined:selected()?.value??(last?enabled().at(-1)?.value:enabled()[0]?.value));requestOpen(true);}
 /** Match accumulated text, cycling repeated letters without moving DOM focus from the trigger. */
 function typeahead(key:string){
  clearTimeout(searchTimer);search+=key.toLocaleLowerCase();searchTimer=setTimeout(()=>{search='';},700);
  const repeated=[...search].every(char=>char===search[0]);const query=repeated?search[0]!:search;const items=enabled();const current=items.findIndex(item=>item.value===(open()?active()?.value:value()));
  const start=repeated?current+1:Math.max(current,0);const ordered=[...items.slice(start),...items.slice(0,start)];const match=ordered.find(item=>item.label.toLocaleLowerCase().startsWith(query));
  if(match){if(open())setHighlight(match.value);else requestValue(match.value);}
 }
 /** Implement the select-only combobox keys; Tab retains the browser's ordinary focus destination. */
 function keydown(event:KeyboardEvent){
  if(event.defaultPrevented||event.isComposing||props.disabled||props.readOnly)return;
  if(event.key==='Tab'){clearTimeout(dismissTimer);dismissTimer=setTimeout(()=>requestOpen(false),0);return;}
  if(event.key==='Escape'){if(open()){event.preventDefault();event.stopPropagation();requestOpen(false);}return;}
  if(['ArrowDown','ArrowUp','Home','End'].includes(event.key)){
   event.preventDefault();if(!open()){show(event.key==='ArrowUp'||event.key==='End');return;}
   const items=enabled();if(!items.length)return;const index=items.findIndex(item=>item.value===active()?.value);let next=index;
   if(event.key==='Home')next=0;else if(event.key==='End')next=items.length-1;else next=(index+(event.key==='ArrowDown'?1:-1)+items.length)%items.length;
   setHighlight(items[next]!.value);return;
  }
  if(event.key==='Enter'||(event.key===' '&&(!open()||!search))){event.preventDefault();if(open()){const item=active();if(item)choose(item.value);}else show();return;}
  if(event.key.length===1&&!event.altKey&&!event.ctrlKey&&!event.metaKey){event.preventDefault();typeahead(event.key);}
 }
 createEffect(()=>[native(),props.form] as const,([node,owner])=>{
  if(!node||owner==='')return;const form=owner===undefined?node.closest('form'):node.ownerDocument.getElementById(owner);if(!(form instanceof HTMLFormElement))return;
  const pending=new Set<ReturnType<typeof setTimeout>>();
  /** Wait for all reset listeners before applying a non-canceled default. */
  function reset(event:Event){const timer=setTimeout(()=>{pending.delete(timer);if(!event.defaultPrevented){requestValue(initial);setAttempted(false);queueMicrotask(()=>{if(node!.isConnected)synchronize(node!);});}},0);pending.add(timer);}
  form.addEventListener('reset',reset);return()=>{form.removeEventListener('reset',reset);for(const timer of pending)clearTimeout(timer);};
 });
 return {props,id,value,open,selected,active,enabled,trigger,setTrigger,viewport,setViewport,native,setNative,triggerId:()=>triggerId()(),setTriggerId,requestOpen,requestValue,setHighlight,choose,show,keydown,synchronize,attempted,setAttempted,optionId:(value:string)=>`select-${id}-option-${encodeURIComponent(value)}`};
}
const Context=createContext<ReturnType<typeof createSelect>|null>(null);
/** Require a single root so form, trigger and option state cannot drift apart. */
function useSelect(){const context=useContext(Context);if(!context)throw new Error('Select parts must be inside Select.');return context;}
/** Render a single native successful control while the visible trigger owns keyboard interaction. */
export function Select(props:SelectProps){const context=createSelect(props);return <Context value={context}>{props.children}<select ref={node=>context.setNative(node)} data-slot="select-native" aria-hidden="true" tabindex={-1} class="sr-only" name={props.name} form={props.form} required={props.required} disabled={props.disabled} value={context.value()} onFocus={()=>untrack(()=>context.trigger()?.focus())} onInvalid={event=>{event.preventDefault();context.setAttempted(true);context.trigger()?.focus();}} onChange={event=>{const node=event.currentTarget;if(!props.readOnly)context.requestValue(node.value);queueMicrotask(()=>{if(node.isConnected)context.synchronize(node);});}}><option value=""/><Show when={context.value()&&!context.selected()}><option value={context.value()}>{context.value()}</option></Show><For each={props.items}>{item=><option value={item.value} disabled={item.disabled} selected={context.value()===item.value}>{item.label}</option>}</For></select></Context>;}
export type SelectTriggerProps=JSX.ButtonHTMLAttributes<HTMLButtonElement> & {size?:'sm'|'default'};
/** Preserve focus on the named trigger and expose the active popup option through ARIA. */
export function SelectTrigger(props:SelectTriggerProps){const context=useSelect();context.setTriggerId(()=>props.id||`select-${context.id}-trigger`);const rest=omit(props,'id','class','size','children','ref','onClick','onKeyDown');return <button {...rest} ref={node=>{context.setTrigger(node);if(typeof props.ref==='function')props.ref(node);}} id={context.triggerId()} type="button" role="combobox" aria-haspopup="listbox" aria-expanded={context.open()?'true':'false'} aria-controls={`select-${context.id}-list`} aria-activedescendant={context.open()&&context.active()?context.optionId(context.active()!.value):undefined} aria-required={context.props.required?'true':undefined} aria-readonly={context.props.readOnly?'true':undefined} aria-invalid={props['aria-invalid']??(context.attempted()&&!context.value()?'true':undefined)} disabled={context.props.disabled||props.disabled} data-slot="select-trigger" data-size={props.size??'default'} data-placeholder={!context.value()?'':undefined} data-state={context.open()?'open':'closed'} onClick={event=>{callHandler(props.onClick,event);if(!event.defaultPrevented){if(context.open())context.requestOpen(false);else context.show();}}} onKeyDown={event=>{callHandler(props.onKeyDown,event);context.keydown(event);}} class={cn('flex w-fit max-w-full items-center justify-between gap-1.5 rounded-lg border border-input bg-transparent py-2 pe-2 ps-2.5 text-sm whitespace-nowrap transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-placeholder:text-muted-foreground data-[size=default]:h-8 data-[size=sm]:h-7 data-[size=sm]:rounded-[min(var(--radius-md),10px)] dark:bg-input/30 dark:hover:bg-input/50 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40',props.class)}>{props.children}<span aria-hidden="true" class="shrink-0 text-muted-foreground">⌄</span></button>;}
/** Render labels from root data, making closed server markup independent of item registration order. */
export function SelectValue(props:JSX.HTMLAttributes<HTMLSpanElement> & {placeholder?:JSX.Element}){const context=useSelect();const rest=omit(props,'placeholder','children','class');return <span {...rest} data-slot="select-value" class={cn('min-w-0 truncate',props.class)}>{props.children??(context.value()?(context.selected()?.label??context.value()):props.placeholder)}</span>;}
export type SelectContentProps=Omit<JSX.HTMLAttributes<HTMLDivElement>,'children'> & {children?:JSX.Element|((item:SelectOption)=>JSX.Element);side?:'top'|'bottom';align?:'start'|'center'|'end';sideOffset?:number;collisionPadding?:number};
/** Keep the popup in its theme ancestry, above clipping ancestors, with bounded scrolling and cleanup. */
export function SelectContent(props:SelectContentProps){
 const context=useSelect();const [element,setElement]=createRegistration<HTMLDivElement|undefined>(undefined);const rest=omit(props,'class','ref','children','side','align','sideOffset','collisionPadding');
 createEffect(()=>[element(),context.trigger(),context.open(),props.side??'bottom',props.align??'start',props.sideOffset??4,props.collisionPadding??8] as const,([node,trigger,open,side,align,gap,padding])=>{
  if(!node||!trigger||!open)return;let live=true;let version=0;node.showPopover();
  /** Reject coordinates from an older update or a disposed popup. */
  async function position(){const ticket=++version;const result=await computePosition(trigger!,node!,{strategy:'fixed',placement:align==='center'?side:`${side}-${align}`,middleware:[offset(gap),flip({padding}),shift({padding}),size({padding,apply({availableWidth,availableHeight}){if(live&&ticket===version){node!.style.maxWidth=`${Math.max(0,availableWidth)}px`;node!.style.maxHeight=`${Math.max(0,availableHeight)}px`;node!.style.minWidth=`${Math.min(trigger!.getBoundingClientRect().width,Math.max(0,availableWidth))}px`;}}})]});if(live&&ticket===version){node!.style.left=`${result.x}px`;node!.style.top=`${result.y}px`;node!.dataset.side=result.placement.split('-')[0];}}
  const dispose=autoUpdate(trigger,node,()=>{void position();},{ancestorScroll:false,animationFrame:true});
  /** Outside pointer or focus dismissal preserves the user's new destination. */
  function outside(event:Event){const target=event.target as Node;if(!node!.contains(target)&&!trigger!.contains(target))context.requestOpen(false);}
  const document=node.ownerDocument;document.addEventListener('pointerdown',outside,true);document.addEventListener('focusin',outside,true);
  return()=>{live=false;dispose();document.removeEventListener('pointerdown',outside,true);document.removeEventListener('focusin',outside,true);if(node.matches(':popover-open'))node.hidePopover();};
 });
 createEffect(()=>[context.viewport(),context.open(),context.active()?.value] as const,([node,open,value])=>{
  if(!node||!open||value===undefined)return;
  /** Recheck after floating layout shrinks the viewport without changing the active value. */
  function reveal(){const item=node!.ownerDocument.getElementById(context.optionId(value!));if(!item)return;const row=item.getBoundingClientRect();const list=node!.getBoundingClientRect();if(row.bottom>list.bottom)node!.scrollTop+=row.bottom-list.bottom;else if(row.top<list.top)node!.scrollTop+=row.top-list.top;}
  reveal();if(typeof ResizeObserver==='undefined')return;const observer=new ResizeObserver(reveal);observer.observe(node);return()=>observer.disconnect();
 });
 return <div {...rest} ref={node=>{setElement(node);if(typeof props.ref==='function')props.ref(node);}} popover="manual" hidden={!context.open()} data-slot="select-content" data-state={context.open()?'open':'closed'} data-side={props.side??'bottom'} class={cn('fixed z-50 m-0 flex min-w-36 max-w-[calc(100vw-1rem)] flex-col overflow-hidden rounded-lg border-0 bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10',props.class)}><SelectScrollUpButton/><div ref={node=>context.setViewport(node)} id={`select-${context.id}-list`} role="listbox" tabindex={-1} aria-label={props['aria-label']} aria-labelledby={props['aria-label']?undefined:context.triggerId()} data-slot="select-viewport" class="min-h-0 max-h-60 overflow-y-auto overscroll-contain">{typeof props.children==='function'&&props.children.length>0?<For each={context.props.items}>{item=><div role="presentation" class="contents">{(props.children as (item:SelectOption)=>JSX.Element)(item)}</div>}</For>:props.children as JSX.Element}<Show when={!context.props.items.length}><div role="option" aria-disabled="true" aria-selected="false" class="p-2 text-sm text-muted-foreground">No options available</div></Show></div><SelectScrollDownButton/></div>;
}
const GroupContext=createContext<string|null>(null);
/** Group related options and reserve a stable label ID for SSR and hydration. */
export function SelectGroup(props:JSX.HTMLAttributes<HTMLDivElement>){useSelect();const id=createUniqueId();const rest=omit(props,'class');return <GroupContext value={`select-group-${id}`}><div {...rest} role="group" aria-labelledby={`select-group-${id}`} data-slot="select-group" class={cn('scroll-my-1 p-1',props.class)}/></GroupContext>;}
/** Label the nearest group; use the trigger's accessible name for the whole field. */
export function SelectLabel(props:JSX.HTMLAttributes<HTMLDivElement>){useSelect();const id=useContext(GroupContext);const rest=omit(props,'class','id');return <div {...rest} id={id??props.id} data-slot="select-label" class={cn('px-1.5 py-1 text-xs text-muted-foreground',props.class)}/>;}
export type SelectItemProps=JSX.HTMLAttributes<HTMLDivElement> & {value:string};
/** Give each option its own insertion scope so long lists do not widen their parent. */
export function SelectItem(props:SelectItemProps){return <div role="presentation" class="contents"><SelectItemView {...props}/></div>;}
/** Render one accessible option inside its layout-neutral owner. */
function SelectItemView(props:SelectItemProps){const context=useSelect();const item=()=>context.props.items.find(item=>item.value===props.value);const disabled=()=>context.props.disabled||!item()||item()!.disabled;const rest=omit(props,'value','class','children','onClick','onPointerMove','onPointerDown','id');return <div {...rest} id={context.optionId(props.value)} role="option" aria-selected={context.value()===props.value?'true':'false'} aria-disabled={disabled()?'true':undefined} data-slot="select-item" data-disabled={disabled()?'':undefined} data-highlighted={context.active()?.value===props.value?'':undefined} data-state={context.value()===props.value?'checked':'unchecked'} onPointerDown={event=>{callHandler(props.onPointerDown,event);event.preventDefault();}} onPointerMove={event=>{callHandler(props.onPointerMove,event);if(!event.defaultPrevented&&!disabled())context.setHighlight(props.value);}} onClick={event=>{callHandler(props.onClick,event);if(!event.defaultPrevented&&!disabled())context.choose(props.value);}} class={cn('relative flex w-full cursor-default items-center gap-1.5 rounded-md py-1 pe-8 ps-1.5 text-sm outline-none select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground data-disabled:opacity-50',props.class)}><span class="min-w-0 break-words">{props.children??item()?.label}</span><Show when={context.value()===props.value}><span aria-hidden="true" class="pointer-events-none absolute end-2">✓</span></Show></div>;}
/** Visually separate option groups without adding an interactive stop. */
export function SelectSeparator(props:JSX.HTMLAttributes<HTMLDivElement>){useSelect();const rest=omit(props,'class');return <div {...rest} role="presentation" aria-hidden="true" data-slot="select-separator" class={cn('pointer-events-none -mx-1 my-1 h-px bg-border',props.class)}/>;}
/** Scroll through long choices without moving focus from the combobox trigger. */
function ScrollButton(props:JSX.ButtonHTMLAttributes<HTMLButtonElement> & {direction:-1|1}){const context=useSelect();const rest=omit(props,'class','children','direction','onClick','onPointerDown');return <button {...rest} type="button" tabindex={-1} aria-label={props['aria-label']??(props.direction===-1?'Scroll choices up':'Scroll choices down')} data-slot={props.direction===-1?'select-scroll-up-button':'select-scroll-down-button'} class={cn('flex shrink-0 items-center justify-center bg-popover py-1 text-sm',props.class)} onPointerDown={event=>{callHandler(props.onPointerDown,event);event.preventDefault();}} onClick={event=>{callHandler(props.onClick,event);if(!event.defaultPrevented){const node=context.viewport();if(node)node.scrollTop+=props.direction*100;}}}>{props.children??(props.direction===-1?'⌃':'⌄')}</button>;}
/** Move the viewport toward earlier options. */
export function SelectScrollUpButton(props:JSX.ButtonHTMLAttributes<HTMLButtonElement>){return <ScrollButton {...props} direction={-1}/>;}
/** Move the viewport toward later options. */
export function SelectScrollDownButton(props:JSX.ButtonHTMLAttributes<HTMLButtonElement>){return <ScrollButton {...props} direction={1}/>;}
