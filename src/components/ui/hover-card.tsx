// Link previews with pointer grace, keyboard access and owner-controlled lifetime; D19/D90.
import { omit, onCleanup } from 'solid-js';
import type { JSX } from '@solidjs/web';
import { callHandler } from '../../lib/controllable';
import { HintRoot, HintContent, useHint, type HintProps, type HintContentProps } from '../../lib/hint';
export type HoverCardProps=HintProps;
/** Keep navigation and preview state separate; application data stays with the consumer. */
export function HoverCard(props:HoverCardProps){return <HintRoot {...props} kind="hover-card"/>;}
export type HoverCardTriggerProps=JSX.AnchorHTMLAttributes<HTMLAnchorElement>;
/** Preserve native link navigation while hover/focus reveals supplemental content. */
export function HoverCardTrigger(props:HoverCardTriggerProps){
 const context=useHint();const rest=omit(props,'ref','href','tabindex','onPointerEnter','onPointerLeave','onFocus','onBlur','onClick');
 onCleanup(()=>{context.clear();context.setTrigger(undefined);});
 return <a {...rest} role="link" href={context.disabled()?undefined:props.href} tabindex={context.disabled()?-1:props.tabindex} aria-disabled={context.disabled()?'true':undefined} ref={node=>{context.setTrigger(node);if(typeof props.ref==='function')props.ref(node);}} data-slot="hover-card-trigger" data-state={context.open()?'open':'closed'} aria-describedby={[props['aria-describedby'],context.open()?context.id():undefined].filter(Boolean).join(' ')||undefined}
 onPointerEnter={event=>{callHandler(props.onPointerEnter,event);if(!event.defaultPrevented)context.enter(event);}} onPointerLeave={event=>{callHandler(props.onPointerLeave,event);if(!event.defaultPrevented)context.leave(event);}} onFocus={event=>{callHandler(props.onFocus,event);if(!event.defaultPrevented)context.focus();}} onBlur={event=>{callHandler(props.onBlur,event);if(!event.defaultPrevented)context.blur(event);}} onClick={event=>{if(context.disabled()){event.preventDefault();return;}callHandler(props.onClick,event);}}/>;
}
export type HoverCardContentProps=HintContentProps;
/** Render supplemental content without modal semantics, autofocus or focus restoration. */
export function HoverCardContent(props:HoverCardContentProps){return <HintContent {...props}/>;}
