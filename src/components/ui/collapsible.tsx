// Signal-owned disclosure with native button semantics and sibling export shape; D19/D90.
import { omit } from 'solid-js';
import type { JSX } from '@solidjs/web';
import { createControllable } from '../../lib/controllable';
import { createDisclosure, DisclosureContext, DisclosureTrigger, DisclosureContent, type DisclosureIds, type DisclosureTriggerProps, type DisclosureContentProps } from '../../lib/disclosure';
export type CollapsibleProps=JSX.HTMLAttributes<HTMLDivElement> & DisclosureIds & {open?:boolean;defaultOpen?:boolean;onOpenChange?:(open:boolean)=>void;disabled?:boolean};
/** Leave controlled values with their owner and keep native root attributes reactive. */
export function Collapsible(props:CollapsibleProps){
 const [open,setOpen]=createControllable(()=>props.open,()=>props.defaultOpen??false,value=>props.onOpenChange?.(value));
 const context=createDisclosure(open,()=>Boolean(props.disabled),()=>setOpen(!open()),props);
 const rest=omit(props,'open','defaultOpen','onOpenChange','disabled','triggerId','contentId');
 return <DisclosureContext value={context}><div {...rest} data-slot="collapsible" data-state={open()?'open':'closed'} data-open={open()?'':undefined} data-closed={!open()?'':undefined} data-disabled={props.disabled?'':undefined}/></DisclosureContext>;
}
export type CollapsibleTriggerProps=DisclosureTriggerProps;
/** Render the unstyled native trigger; consumers supply button classes. */
export function CollapsibleTrigger(props:CollapsibleTriggerProps){return <DisclosureTrigger {...props} slot="collapsible-trigger"/>;}
export type CollapsibleContentProps=DisclosureContentProps;
/** Closed content is hidden; forceMount preserves local drafts under that hidden shell. */
export function CollapsibleContent(props:CollapsibleContentProps){return <DisclosureContent {...props} slot="collapsible-content"/>;}
