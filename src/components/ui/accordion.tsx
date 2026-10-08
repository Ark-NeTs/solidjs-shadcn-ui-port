// Accessible single/multiple disclosures with sibling styling and DOM-order navigation; D19/D90.
import { createContext, omit, useContext } from 'solid-js';
import type { JSX } from '@solidjs/web';
import { cn } from '../../lib/utils';
import { createControllable, callHandler } from '../../lib/controllable';
import { createDisclosure, DisclosureContext, DisclosureTrigger, DisclosureContent, type DisclosureIds, type DisclosureTriggerProps, type DisclosureContentProps } from '../../lib/disclosure';
type Selection={type:'single';value?:string;defaultValue?:string;onValueChange?:(value:string)=>void;collapsible?:boolean}|{type:'multiple';value?:string[];defaultValue?:string[];onValueChange?:(value:string[])=>void;collapsible?:never};
export type AccordionProps=JSX.HTMLAttributes<HTMLDivElement> & Selection & {disabled?:boolean;orientation?:'vertical'|'horizontal';loop?:boolean};
const Context=createContext<{open:(value:string)=>boolean;toggle:(value:string)=>void;disabled:()=>boolean;locked:(value:string)=>boolean;orientation:()=>string}|null>(null);
/** Fail fast for items outside their selection owner. */
function useAccordion(){const context=useContext(Context);if(!context)throw new Error('AccordionItem must be inside Accordion.');return context;}
/** Own only uncontrolled selection; keyboard arrows move focus without changing expansion. */
export function Accordion(props:AccordionProps){
 const [value,setValue]=createControllable<string|string[]>(()=>props.value,()=>props.defaultValue??(props.type==='multiple'?[]:''),next=>{if(props.type==='multiple')props.onValueChange?.(next as string[]);else props.onValueChange?.(next as string);});
 const open=(item:string)=>{const current=value();return Array.isArray(current)?current.includes(item):current===item;};
 const locked=(item:string)=>props.type==='single'&&!props.collapsible&&open(item);
 /** Toggle one item without mutating the owner's array or closing a required single selection. */
 function toggle(item:string){
  if(props.type==='multiple'){const current=value() as string[];setValue(open(item)?current.filter(entry=>entry!==item):[...current,item]);}
  else setValue(open(item)?'':item);
 }
 /** Use current DOM order, excluding disabled controls and nested accordions. */
 function keydown(event:KeyboardEvent & {currentTarget:HTMLDivElement;target:Element}){
  callHandler(props.onKeyDown,event);if(event.defaultPrevented)return;
  const target=event.target.closest<HTMLButtonElement>('[data-slot="accordion-trigger"]');
  if(!target||target.closest('[data-slot="accordion"]')!==event.currentTarget)return;
  const horizontal=props.orientation==='horizontal';const rtl=getComputedStyle(event.currentTarget).direction==='rtl';
  const forward=horizontal?(rtl?'ArrowLeft':'ArrowRight'):'ArrowDown';const backward=horizontal?(rtl?'ArrowRight':'ArrowLeft'):'ArrowUp';
  if(![forward,backward,'Home','End'].includes(event.key))return;
  const triggers=Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('[data-slot="accordion-trigger"]')).filter(node=>!node.disabled&&node.closest('[data-slot="accordion"]')===event.currentTarget);
  let index=event.key==='Home'?0:event.key==='End'?triggers.length-1:triggers.indexOf(target)+(event.key===forward?1:-1);
  index=props.loop===false?Math.max(0,Math.min(index,triggers.length-1)):(index+triggers.length)%triggers.length;
  event.preventDefault();triggers[index]?.focus();
 }
 const context={open,toggle,locked,disabled:()=>Boolean(props.disabled),orientation:()=>props.orientation??'vertical'};
 const rest=omit(props,'class','type','value','defaultValue','onValueChange','collapsible','disabled','orientation','loop','onKeyDown');
 return <Context value={context}><div {...rest} data-slot="accordion" data-orientation={context.orientation()} data-disabled={props.disabled?'':undefined} class={cn('flex w-full flex-col',props.class)} onKeyDown={keydown}/></Context>;
}
export type AccordionItemProps=JSX.HTMLAttributes<HTMLDivElement> & DisclosureIds & {value:string;disabled?:boolean};
/** Give each item one disclosure owner with isolated IDs and inherited disabled state. */
export function AccordionItem(props:AccordionItemProps){
 const accordion=useAccordion();const context=createDisclosure(()=>accordion.open(props.value),()=>accordion.disabled()||Boolean(props.disabled),()=>accordion.toggle(props.value),props,()=>accordion.locked(props.value));
 const rest=omit(props,'class','value','disabled','triggerId','contentId');
 return <DisclosureContext value={context}><div {...rest} data-slot="accordion-item" data-state={context.open()?'open':'closed'} data-open={context.open()?'':undefined} data-closed={!context.open()?'':undefined} data-disabled={context.disabled()?'':undefined} data-orientation={accordion.orientation()} class={cn('not-last:border-b',props.class)}/></DisclosureContext>;
}
export type AccordionTriggerProps=DisclosureTriggerProps & {headingLevel?:2|3|4|5|6};
/** Keep the trigger as the sole heading child and hide decorative indicators from assistive technology. */
export function AccordionTrigger(props:AccordionTriggerProps){
 const rest=omit(props,'class','children','headingLevel');
 return <div role="heading" aria-level={props.headingLevel??3} class="flex"><DisclosureTrigger {...rest} slot="accordion-trigger" class={cn('group/accordion-trigger relative flex flex-1 items-start justify-between rounded-lg border border-transparent py-2.5 text-left text-sm font-medium transition-all outline-none hover:underline focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:after:border-ring disabled:pointer-events-none disabled:opacity-50 **:data-[slot=accordion-trigger-icon]:ml-auto **:data-[slot=accordion-trigger-icon]:size-4 **:data-[slot=accordion-trigger-icon]:text-muted-foreground',props.class)}>{props.children}<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" data-slot="accordion-trigger-icon" class="pointer-events-none shrink-0 group-aria-expanded/accordion-trigger:rotate-180"><path d="m6 9 6 6 6-6"/></svg></DisclosureTrigger></div>;
}
export type AccordionContentProps=DisclosureContentProps;
/** Natural-height content preserves padding/classes without a measurement effect or animated unmount. */
export function AccordionContent(props:AccordionContentProps){
 const rest=omit(props,'class');
 return <DisclosureContent {...rest} slot="accordion-content" region class="overflow-hidden text-sm" innerClass={cn('pt-0 pb-2.5 [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-4',props.class)}/>;
}
