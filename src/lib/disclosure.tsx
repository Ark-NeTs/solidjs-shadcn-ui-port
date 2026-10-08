// Shared disclosure semantics, stable IDs and mount policy; D19/D90.
import { createContext, createUniqueId, omit, Show, useContext, type Accessor } from 'solid-js';
import type { JSX } from '@solidjs/web';
import { callHandler } from './controllable';
import { cn } from './utils';
export type DisclosureIds={triggerId?:string;contentId?:string};
/** The owner declares both IDs before SSR, so links never depend on sibling render order. */
export function createDisclosure(open:Accessor<boolean>,disabled:Accessor<boolean>,toggle:()=>void,ids:DisclosureIds,locked:Accessor<boolean>=()=>false){
 const id=createUniqueId();
 return {open,disabled,toggle,locked,triggerId:()=>ids.triggerId||`disclosure-${id}-trigger`,contentId:()=>ids.contentId||`disclosure-${id}-content`};
}
export const DisclosureContext=createContext<ReturnType<typeof createDisclosure>|null>(null);
/** Require a disclosure owner instead of silently rendering broken controls. */
export function useDisclosure(){const context=useContext(DisclosureContext);if(!context)throw new Error('Disclosure parts must be inside their root or AccordionItem.');return context;}
export type DisclosureTriggerProps=Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>,'id'>;
/** Native buttons provide Enter/Space while canceled handlers retain consumer authority. */
export function DisclosureTrigger(props:DisclosureTriggerProps & {slot:string}){
 const context=useDisclosure();
 const rest=omit(props,'slot','onClick','disabled');
 return <button {...rest} id={context.triggerId()} type="button" data-slot={props.slot} data-state={context.open()?'open':'closed'} data-open={context.open()?'':undefined} data-closed={!context.open()?'':undefined} data-disabled={context.disabled()||props.disabled?'':undefined} disabled={context.disabled()||props.disabled} aria-expanded={context.open()?'true':'false'} aria-controls={context.contentId()} aria-disabled={context.locked()?'true':undefined} onClick={event=>{callHandler(props.onClick,event);if(!event.defaultPrevented&&!context.disabled()&&!props.disabled&&!context.locked())context.toggle();}}/>;
}
export type DisclosureContentProps=Omit<JSX.HTMLAttributes<HTMLDivElement>,'id'> & {forceMount?:boolean};
/** Hide closed shells from layout and navigation; retain children only when explicitly requested. */
export function DisclosureContent(props:DisclosureContentProps & {slot:string;region?:boolean;innerClass?:string}){
 const context=useDisclosure();
 const rest=omit(props,'slot','forceMount','children','region','innerClass');
 return <div {...rest} id={context.contentId()} data-slot={props.slot} data-state={context.open()?'open':'closed'} data-open={context.open()?'':undefined} data-closed={!context.open()?'':undefined} data-disabled={context.disabled()?'':undefined} hidden={!context.open()} role={props.region?'region':props.role} aria-labelledby={props.region?context.triggerId():props['aria-labelledby']}><Show when={context.open()||props.forceMount}><Show when={props.innerClass!==undefined} fallback={props.children}><div class={cn(props.innerClass)}>{props.children}</div></Show></Show></div>;
}
