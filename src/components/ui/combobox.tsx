// Searchable single/multiple selection with owned Solid 2 state and native popovers; D19/D90.
import { createContext, createEffect, createMemo, createSignal, createUniqueId, omit, onCleanup, For, Show, untrack, useContext } from 'solid-js';
import type { JSX } from '@solidjs/web';
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger, type PopoverContentProps } from './popover';
import { Input } from './input';
import { cn } from '../../lib/utils';
import { callHandler, createControllable } from '../../lib/controllable';
export type ComboboxChangeDetails={reason:'input-change'|'input-clear'|'item-select'|'dismiss'};
export type ComboboxProps<T>={
 items:readonly T[]; filteredItems?:readonly T[]; children?:JSX.Element;
 itemToStringLabel?:(item:T)=>string; itemToStringValue?:(item:T)=>string; isItemDisabled?:(item:T)=>boolean;
 inputValue?:string; onInputValueChange?:(value:string,details:ComboboxChangeDetails)=>void;
 open?:boolean; defaultOpen?:boolean; onOpenChange?:(open:boolean)=>void;
 disabled?:boolean; readOnly?:boolean; name?:string; form?:string; required?:boolean;
} & ({multiple?:false;value?:T|null;defaultValue?:T|null;onValueChange?:(value:T|null)=>void}|
 {multiple:true;value?:readonly T[];defaultValue?:readonly T[];onValueChange?:(value:T[])=>void});
type ContextValue={
 id:string; items:()=>readonly unknown[]; selected:()=>readonly unknown[]; label:(item:unknown)=>string; key:(item:unknown)=>string;
 disabled:()=>boolean; readOnly:()=>boolean; required:()=>boolean; invalid:()=>boolean; multiple:()=>boolean; open:()=>boolean; requestOpen:(next:boolean)=>void;
 text:(inside:boolean)=>string; search:(text:string)=>void; choose:(item:unknown)=>void; remove:(item:unknown)=>void; clear:()=>void;
 blocked:(item:unknown)=>boolean; active:()=>unknown; setActive:(item:unknown)=>void; optionId:(item:unknown)=>string;
 consumeTabExit:()=>boolean; input:()=>HTMLInputElement|undefined; setInput:(node:HTMLInputElement)=>void; keyboard:(event:KeyboardEvent)=>void;
};
const Context=createContext<ContextValue|null>(null);
const Inside=createContext(false);
/** Require compound parts to share the same selection owner. */
function useCombobox(){const context=useContext(Context);if(!context)throw new Error('Combobox parts must be inside Combobox.');return context;}
/** Own drafts independently from canonical values; reflect only accepted controlled selections. */
export function Combobox<T>(props:ComboboxProps<T>){
 let tabbing=false;let tabTimer:ReturnType<typeof setTimeout>;
 onCleanup(()=>clearTimeout(tabTimer));
 const id=createUniqueId();const initial=untrack(()=>props.defaultValue??(props.multiple?[]:null));
 const [local,setLocal]=createSignal<T|readonly T[]|null>(()=>initial);
 const [validated,setValidated]=createSignal(false);
 const [draft,setDraft]=createSignal<string|undefined>(undefined);
 const [activeKey,setActiveKey]=createSignal<string|undefined>(undefined);
 const [input,setInput]=createSignal<HTMLInputElement|undefined>(undefined,{ownedWrite:true});
 const [bridge,setBridge]=createSignal<HTMLSelectElement|undefined>(undefined,{ownedWrite:true});
 const [open,changeOpen]=createControllable(()=>props.open,()=>props.defaultOpen??false,next=>props.onOpenChange?.(next));
 const value=()=>props.value!==undefined?props.value:local();
 const selected=():readonly T[]=>{const current=value();return current===null?[]:props.multiple?current as readonly T[]:[current as T];};
 const label=(item:unknown)=>props.itemToStringLabel?props.itemToStringLabel(item as T):String(item);
 const key=(item:unknown)=>props.itemToStringValue?props.itemToStringValue(item as T):label(item);
 const missing=()=>!selected().length||(!props.multiple&&key(selected()[0])==='');
 const invalid=()=>Boolean(props.required&&validated()&&missing());
 const query=()=>props.inputValue??draft()??'';
 // Share filtering/navigation derivations across all option and input bindings.
 const items=createMemo(()=>props.filteredItems??props.items.filter(item=>label(item).toLocaleLowerCase().includes(query().trim().toLocaleLowerCase())));
 const blocked=(item:unknown)=>Boolean(props.isItemDisabled?.(item as T));
 const enabled=createMemo(()=>items().filter(item=>!blocked(item)));
 const active=createMemo(()=>enabled().find(item=>key(item)===activeKey()));
 /** Reset navigation when opening; closing discards an uncommitted search draft. */
 function requestOpen(next:boolean,tabExit=false){clearTimeout(tabTimer);tabbing=tabExit;if(next&&(props.disabled||props.readOnly))return;if(!next){setDraft(undefined);props.onInputValueChange?.('',{reason:'dismiss'});}else if(!open())setActiveKey(undefined);changeOpen(next);}
 /** Notify the owner without overwriting rejected controlled state. */
 function change(next:readonly T[]){if(props.multiple){if(props.value===undefined)setLocal([...next]);props.onValueChange?.([...next]);}else{const single=next[0]??null;if(props.value===undefined)setLocal(()=>single);props.onValueChange?.(single);}}
 /** Select/toggle a canonical option; a single selection closes its popup. */
 function choose(item:unknown){if(props.disabled||props.readOnly||blocked(item))return;const exists=selected().some(entry=>key(entry)===key(item));change(props.multiple?(exists?selected().filter(entry=>key(entry)!==key(item)):[...selected(),item as T]):[item as T]);setDraft(undefined);props.onInputValueChange?.('',{reason:'item-select'});if(!props.multiple)requestOpen(false);}
 /** Remove a chip without changing the current search. */
 function remove(item:unknown){change(selected().filter(entry=>key(entry)!==key(item)));}
 /** Clear both the accepted selection and draft through their owning callbacks. */
 function clear(){change([]);setDraft('');props.onInputValueChange?.('',{reason:'input-clear'});input()?.focus();}
 /** Keep text editing separate from selection until an option is committed. */
 function search(text:string){if(props.disabled||props.readOnly)return;setDraft(text);setActiveKey(undefined);props.onInputValueChange?.(text,{reason:'input-change'});requestOpen(true);}
 /** Preserve native text editing and IME while adding listbox navigation. */
 function keyboard(event:KeyboardEvent){
  if(event.defaultPrevented||event.isComposing||props.disabled||props.readOnly)return;
  if(event.key==='Escape'&&open()){event.preventDefault();event.stopPropagation();requestOpen(false);return;}
  // Let native sequential focus finish before unmounting a popup input.
  if(event.key==='Tab'){clearTimeout(tabTimer);tabTimer=setTimeout(()=>requestOpen(false,true),0);return;}
  if(['Enter','ArrowDown','ArrowUp'].includes(event.key)&&!(event.target as Element).matches('input,[data-slot=popover-trigger]'))return;
  if(event.key==='Enter'&&open()&&active()!==undefined){event.preventDefault();choose(active());return;}
  if(event.key!=='ArrowDown'&&event.key!=='ArrowUp')return;
  event.preventDefault();requestOpen(true);const choices=enabled();const current=choices.findIndex(item=>key(item)===activeKey());const delta=event.key==='ArrowDown'?1:-1;const next=current<0?(delta===1?0:choices.length-1):(current+delta+choices.length)%choices.length;
  setActiveKey(choices.length?key(choices[next]):undefined);
 }
 const context:ContextValue={id,items,selected,label,key,disabled:()=>Boolean(props.disabled),readOnly:()=>Boolean(props.readOnly),required:()=>Boolean(props.required),invalid,multiple:()=>Boolean(props.multiple),open,requestOpen,text:inside=>props.inputValue??draft()??(!inside&&!props.multiple&&selected().length?label(selected()[0]):''),search,choose,remove,clear,blocked,active,setActive:item=>setActiveKey(key(item)),optionId:item=>`combobox-${id}-option-${encodeURIComponent(key(item))}`,consumeTabExit:()=>{const result=tabbing;tabbing=false;return result;},input,setInput,keyboard};
 /** Synchronize the form bridge from canonical state, including removed async options. */
 function syncForm(node:HTMLSelectElement){const keys=selected().map(key);for(const option of node.options)option.selected=keys.includes(option.value);node.setCustomValidity(props.required&&missing()?'Choose an option.':'');}
 createEffect(()=>[bridge(),selected().map(key).join('\u0000'),props.required] as const,([node])=>{if(node)untrack(()=>syncForm(node));});
 createEffect(()=>[bridge(),props.form] as const,([node])=>{const form=node?.form;if(!form)return;let alive=true;let timer:ReturnType<typeof setTimeout>;
  /** Match native reset after its default action, unless the owner cancels it. */
  function reset(event:Event){clearTimeout(timer);timer=setTimeout(()=>{if(!alive||event.defaultPrevented)return;setValidated(false);setLocal(()=>initial);if(props.multiple)props.onValueChange?.(initial as T[]);else props.onValueChange?.(initial as T|null);setDraft(undefined);requestOpen(false);queueMicrotask(()=>{if(alive){syncForm(node!);const field=input();if(field)field.value=context.text(false);}});},0);}
  form.addEventListener('reset',reset);return()=>{alive=false;clearTimeout(timer);form.removeEventListener('reset',reset);};
 });
 return <Context value={context}><Popover open={open()} onOpenChange={requestOpen}><div data-slot="combobox" onKeyDown={keyboard}>
 {props.children}
 <select ref={setBridge} aria-hidden="true" tabindex={-1} class="sr-only" name={props.name} form={props.form} disabled={props.disabled} required={props.required} multiple={props.multiple} onInvalid={event=>{event.preventDefault();setValidated(true);requestOpen(true);input()?.focus();}}>
 <option value="" disabled selected={!selected().length}/>{selected().map(item=><option value={key(item)} selected>{label(item)}</option>)}
 </select><Show when={invalid()}><p id={`combobox-${id}-error`} role="alert" class="mt-1 text-sm text-destructive-emphasis">Choose an option.</p></Show></div></Popover></Context>;
}
export type ComboboxInputProps=Omit<JSX.InputHTMLAttributes<HTMLInputElement>,'value'|'defaultValue'|'onChange'> & {showTrigger?:boolean;showClear?:boolean};
/** Render an editable combobox; an input inside Content acts as the popup search field. */
export function ComboboxInput(props:ComboboxInputProps){const context=useCombobox();const inside=useContext(Inside);const rest=omit(props,'ref','class','children','onInput','showTrigger','showClear');
 const field=<div data-slot="combobox-input-group" class="flex min-w-0 items-center gap-1"><Input {...rest} ref={node=>{if(!inside)context.setInput(node);if(typeof props.ref==='function')props.ref(node);}} role="combobox" aria-required={context.required()?'true':undefined} aria-invalid={props['aria-invalid']??(context.invalid()?'true':undefined)} aria-describedby={[props['aria-describedby'],context.invalid()?`combobox-${context.id}-error`:undefined].filter(Boolean).join(' ')||undefined} aria-autocomplete="list" aria-expanded={context.open()?'true':'false'} aria-controls={`combobox-${context.id}-list`} aria-activedescendant={context.open()&&context.active()!==undefined?context.optionId(context.active()):undefined} disabled={context.disabled()||props.disabled} readonly={context.readOnly()||props.readonly} value={context.text(inside)} class={cn('min-w-0',props.class)} onInput={event=>{if(Array.isArray(props.onInput))props.onInput[0](props.onInput[1],event);else if(typeof props.onInput==='function')props.onInput(event);if(!event.defaultPrevented)context.search(event.currentTarget.value);const node=event.currentTarget;queueMicrotask(()=>{if(node.isConnected)node.value=context.text(inside);});}}/>
 <Show when={props.showTrigger!==false}><ComboboxTrigger aria-label="Show options"/></Show><Show when={props.showClear}><ComboboxClear/></Show>{props.children}</div>;
 return inside?field:<PopoverAnchor>{field}</PopoverAnchor>;
}
/** Open a searchable chooser dialog; also supports the admin's trigger-only pattern. */
export function ComboboxTrigger(props:JSX.ButtonHTMLAttributes<HTMLButtonElement>){const context=useCombobox();return <PopoverTrigger {...props} disabled={context.disabled()||context.readOnly()||props.disabled} class={cn('inline-flex shrink-0 items-center justify-center rounded-md border border-input p-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50',props.class)}>{props.children??<span aria-hidden="true">⌄</span>}</PopoverTrigger>;}
/** Show the canonical single value, or provide a render function for selected chips. */
export function ComboboxValue<T>(props:{children?:JSX.Element|((value:T|readonly T[]|null)=>JSX.Element);placeholder?:JSX.Element}){const context=useCombobox();return <>{typeof props.children==='function'&&props.children.length>0?props.children((context.multiple()?context.selected():context.selected()[0]??null) as T|readonly T[]|null):props.children??(context.selected().length?context.selected().map(context.label).join(', '):props.placeholder)}</>;}
/** Clear action has a native button and an overridable accessible label. */
export function ComboboxClear(props:JSX.ButtonHTMLAttributes<HTMLButtonElement>){const context=useCombobox();const rest=omit(props,'onClick');return <button {...rest} type="button" aria-label={props['aria-label']??'Clear selection'} disabled={context.disabled()||context.readOnly()||props.disabled} onClick={event=>{callHandler(props.onClick,event);if(!event.defaultPrevented)context.clear();}}>{props.children??'×'}</button>;}
/** Compose the existing positioned dialog with an inner listbox; preserve editable-input focus. */
export function ComboboxContent(props:PopoverContentProps){const context=useCombobox();return <Inside value={true}><PopoverContent {...props} aria-label={props['aria-label']??'Choose an option'} align={props.align??'start'} class={cn('w-72 max-w-[calc(100vw-2rem)] gap-1 p-1',props.class)} onOpenAutoFocus={event=>{props.onOpenAutoFocus?.(event);if(!event.defaultPrevented&&context.input()){event.preventDefault();context.input()!.focus();}}} onCloseAutoFocus={event=>{props.onCloseAutoFocus?.(event);if(context.consumeTabExit()){event.preventDefault();return;}if(!event.defaultPrevented&&context.input()){event.preventDefault();if(document.activeElement?.closest('[data-slot=popover-content]'))context.input()!.focus();}}}/></Inside>;}
export type ComboboxListProps<T>=Omit<JSX.HTMLAttributes<HTMLDivElement>,'children'> & {children?:JSX.Element|((item:T)=>JSX.Element)};
/** Render filtered data through the caller's item template, preserving option semantics. */
export function ComboboxList<T>(props:ComboboxListProps<T>){const context=useCombobox();const [element,setElement]=createSignal<HTMLDivElement|undefined>(undefined,{ownedWrite:true});const rest=omit(props,'children','class','ref');
 // Bounding rectangles include opening scale; scrollTop uses unscaled CSS pixels.
 createEffect(()=>[element(),context.active()===undefined?undefined:context.optionId(context.active())] as const,([node,id])=>{if(!node||!id)return;const option=node.ownerDocument.getElementById(id);if(!option)return;function reveal(){const listRect=node!.getBoundingClientRect();const optionRect=option!.getBoundingClientRect();const scale=node!.offsetHeight?listRect.height/node!.offsetHeight:1;if(optionRect.bottom>listRect.bottom)node!.scrollTop+=(optionRect.bottom-listRect.bottom)/scale;else if(optionRect.top<listRect.top)node!.scrollTop+=(optionRect.top-listRect.top)/scale;}reveal();
  // Floating placement may shrink the list after the first scroll; follow its final size.
  if(typeof ResizeObserver==='undefined')return;const observer=new ResizeObserver(reveal);observer.observe(node);return()=>observer.disconnect();});
 // Each layout-neutral row owns its template reads instead of widening the list insertion.
 return <div {...rest} ref={node=>{setElement(node);if(typeof props.ref==='function')props.ref(node);}} id={`combobox-${context.id}-list`} role="listbox" aria-label={props['aria-label']??'Options'} aria-multiselectable={context.multiple()?'true':undefined} data-slot="combobox-list" class={cn('max-h-72 overflow-y-auto overscroll-contain outline-none',props.class)}>{typeof props.children==='function'&&props.children.length>0?<For each={context.items()}>{item=><div role="presentation" class="contents">{(props.children as (item:T)=>JSX.Element)(item as T)}</div>}</For>:props.children as JSX.Element}</div>;}
/** Render an option without moving DOM focus away from the editable input. */
export function ComboboxItem<T>(props:Omit<JSX.HTMLAttributes<HTMLDivElement>,'onSelect'> & {value:T}){const context=useCombobox();const rest=omit(props,'value','class','children','onClick','onPointerMove','onMouseDown','id');return <div {...rest} id={context.optionId(props.value)} role="option" aria-selected={context.selected().some(item=>context.key(item)===context.key(props.value))?'true':'false'} aria-disabled={context.blocked(props.value)?'true':undefined} data-slot="combobox-item" data-highlighted={context.active()!==undefined&&context.key(context.active())===context.key(props.value)?'':undefined} class={cn('relative flex cursor-default items-center gap-2 rounded-md py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground aria-disabled:pointer-events-none aria-disabled:opacity-50',props.class)} onMouseDown={event=>{callHandler(props.onMouseDown,event);event.preventDefault();}} onPointerMove={event=>{callHandler(props.onPointerMove,event);if(!event.defaultPrevented&&!context.blocked(props.value))context.setActive(props.value);}} onClick={event=>{callHandler(props.onClick,event);if(!event.defaultPrevented)context.choose(props.value);}}>{props.children}<Show when={context.selected().some(item=>context.key(item)===context.key(props.value))}><span aria-hidden="true" class="absolute right-2">✓</span></Show></div>;}
/** Display a useful empty state only when filtering produces no options. */
export function ComboboxEmpty(props:JSX.HTMLAttributes<HTMLDivElement>){const context=useCombobox();return <Show when={!context.items().length}><div {...props} role="status" data-slot="combobox-empty" class={cn('p-4 text-center text-sm text-muted-foreground',props.class)}/></Show>;}
/** Group related options; callers name groups with aria-label or aria-labelledby. */
export function ComboboxGroup(props:JSX.HTMLAttributes<HTMLDivElement>){return <div {...props} role="group" data-slot="combobox-group"/>;}
/** Style a group label; use Label for the editable field's accessible name. */
export function ComboboxLabel(props:JSX.HTMLAttributes<HTMLDivElement>){return <div {...props} data-slot="combobox-label" class={cn('px-2 py-1.5 text-xs text-muted-foreground',props.class)}/>;}
/** Insert a semantic divider between manually composed option groups. */
export function ComboboxSeparator(props:JSX.HTMLAttributes<HTMLDivElement>){return <div {...props} role="separator" class={cn('bg-border -mx-1 my-1 h-px',props.class)}/>;}
/** Render the current filtered collection without creating a second listbox. */
export function ComboboxCollection<T>(props:{children:(item:T)=>JSX.Element}){const context=useCombobox();return <For each={context.items()}>{item=><div role="presentation" class="contents">{props.children(item as T)}</div>}</For>;}
/** Layout selected chips and their input using semantic border/focus tokens. */
export function ComboboxChips(props:JSX.HTMLAttributes<HTMLDivElement>){return <div {...props} data-slot="combobox-chips" class={cn('flex min-h-9 flex-wrap items-center gap-1 rounded-md border border-input p-1 focus-within:ring-3 focus-within:ring-ring/50',props.class)}/>;}
/** A selected value with an explicit, accessible remove action. */
export function ComboboxChip<T>(props:JSX.HTMLAttributes<HTMLSpanElement> & {value:T;showRemove?:boolean}){const context=useCombobox();const rest=omit(props,'value','showRemove','class','children');return <span {...rest} data-slot="combobox-chip" class={cn('inline-flex items-center gap-1 rounded-sm bg-muted px-1.5 py-0.5 text-xs',props.class)}>{props.children??context.label(props.value)}<Show when={props.showRemove!==false}><button type="button" aria-label={`Remove ${context.label(props.value)}`} disabled={context.disabled()||context.readOnly()} onClick={()=>context.remove(props.value)}>×</button></Show></span>;}
/** Use the same accessible editing contract in a wrapping chips layout. */
export function ComboboxChipsInput(props:ComboboxInputProps){return <ComboboxInput {...props} showTrigger={props.showTrigger??false} class={cn('border-0 shadow-none',props.class)}/>;}
