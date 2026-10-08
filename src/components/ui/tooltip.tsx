// Supplemental descriptions with provider delay policy and native button activation; D19/D90.
import { omit, onCleanup } from 'solid-js';
import type { JSX } from '@solidjs/web';
import { callHandler } from '../../lib/controllable';
import { HintRoot, HintProvider, HintContent, useHint, type HintProps, type HintProviderProps, type HintContentProps } from '../../lib/hint';
export type TooltipProviderProps=HintProviderProps;
/** Scope shared hover delay and skip-delay behavior. */
export function TooltipProvider(props:TooltipProviderProps){return <HintProvider {...props}/>;}
export type TooltipProps=Omit<HintProps,'openDelay'> & {delayDuration?:number};
/** Configure a supplemental description; essential information belongs in visible labels. */
export function Tooltip(props:TooltipProps){const rest=omit(props,'delayDuration');return <HintRoot {...rest} kind="tooltip" openDelay={props.delayDuration}/>;}
/** Describe the existing button without changing its accessible name or stealing focus. */
export function TooltipTrigger(props:JSX.ButtonHTMLAttributes<HTMLButtonElement>){
 const context=useHint();const rest=omit(props,'ref','disabled','onPointerEnter','onPointerLeave','onPointerDown','onFocus','onBlur','onClick');
 onCleanup(()=>{context.clear();context.setTrigger(undefined);});
 return <button {...rest} ref={node=>{context.setTrigger(node);if(typeof props.ref==='function')props.ref(node);}} type="button" disabled={context.disabled()||props.disabled} data-slot="tooltip-trigger" data-state={context.open()?'open':'closed'} aria-describedby={[props['aria-describedby'],context.open()?context.id():undefined].filter(Boolean).join(' ')||undefined}
 onPointerEnter={event=>{callHandler(props.onPointerEnter,event);if(!event.defaultPrevented)context.enter(event);}} onPointerLeave={event=>{callHandler(props.onPointerLeave,event);if(!event.defaultPrevented)context.leave(event);}} onPointerDown={event=>{callHandler(props.onPointerDown,event);if(!event.defaultPrevented)context.dismiss();}} onFocus={event=>{callHandler(props.onFocus,event);if(!event.defaultPrevented)context.focus();}} onBlur={event=>{callHandler(props.onBlur,event);if(!event.defaultPrevented)context.blur(event);}} onClick={event=>{callHandler(props.onClick,event);if(!event.defaultPrevented)context.dismiss();}}/>;
}
export type TooltipContentProps=HintContentProps;
/** Noninteractive hoverable text in the native top layer, retaining theme ancestry. */
export function TooltipContent(props:TooltipContentProps){return <HintContent {...props}/>;}
