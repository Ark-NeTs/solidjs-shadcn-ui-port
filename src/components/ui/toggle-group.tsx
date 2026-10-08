// Owned grouped selection with DOM-order focus and shared Toggle styling; D19/D90.
import { createContext, omit, untrack, useContext } from 'solid-js';
import type { JSX } from '@solidjs/web';
import type { VariantProps } from 'class-variance-authority';
import { createControllable, callHandler } from '../../lib/controllable';
import { createChoiceNavigation } from '../../lib/choice-navigation';
import { createRegistration } from '../../lib/registration';
import { toggleVariants } from './toggle';
import { cn } from '../../lib/utils';
type Selection={type:'single';value?:string;defaultValue?:string;onValueChange?:(value:string)=>void}|{type:'multiple';value?:string[];defaultValue?:string[];onValueChange?:(value:string[])=>void};
export type ToggleGroupProps=JSX.HTMLAttributes<HTMLDivElement> & Selection & VariantProps<typeof toggleVariants> & {disabled?:boolean;orientation?:'horizontal'|'vertical';loop?:boolean;rovingFocus?:boolean;spacing?:number};
/** Keep single/multiple selection canonical and independent from keyboard focus. */
function createToggleGroup(props:ToggleGroupProps){
 const [value,request]=createControllable<string|string[]>(()=>props.value,()=>props.defaultValue??(props.type==='multiple'?[]:''),next=>{if(props.type==='multiple')props.onValueChange?.(next as string[]);else props.onValueChange?.(next as string);});
 const selected=(item:string)=>{const current=value();return Array.isArray(current)?current.includes(item):current===item;};
 /** Use fresh arrays for multiple selections and an empty string for a cleared single selection. */
 function toggle(item:string){if(props.type==='multiple'){const current=value() as string[];request(selected(item)?current.filter(entry=>entry!==item):[...current,item]);}else request(selected(item)?'':item);}
 const navigation=createChoiceNavigation({orientation:()=>props.orientation??'horizontal',loop:()=>props.loop!==false,roving:()=>props.rovingFocus!==false});
 return {props,selected,toggle,navigation};
}
const Context=createContext<ReturnType<typeof createToggleGroup>|null>(null);
/** Group native pressed buttons; arrows move focus, while Space/Enter changes selection. */
export function ToggleGroup(props:ToggleGroupProps){
 const context=createToggleGroup(props);const rest=omit(props,'class','style','type','value','defaultValue','onValueChange','variant','size','spacing','disabled','orientation','loop','rovingFocus','onKeyDown');
 return <Context value={context}><div {...rest} role="group" data-slot="toggle-group" data-choice-root="" data-variant={props.variant??'default'} data-size={props.size??'default'} data-spacing={props.spacing??2} data-orientation={props.orientation??'horizontal'} data-horizontal={props.orientation!=='vertical'?'':undefined} data-vertical={props.orientation==='vertical'?'':undefined} aria-disabled={props.disabled?'true':undefined}
 style={typeof props.style==='string'?`--gap:${props.spacing??2};${props.style}`:{'--gap':props.spacing??2,...props.style}}
 class={cn('group/toggle-group flex w-fit max-w-full overflow-auto flex-row items-center gap-[calc(var(--gap)*var(--spacing))] rounded-lg data-[size=sm]:rounded-[min(var(--radius-md),10px)] data-vertical:flex-col data-vertical:items-stretch',props.class)} onKeyDown={event=>{callHandler(props.onKeyDown,event);context.navigation.keydown(event);}}/></Context>;
}
export type ToggleGroupItemProps=Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>,'value'> & VariantProps<typeof toggleVariants> & {value:string};
/** Inherit presentation and disabled state; caller cancellation runs before selection. */
export function ToggleGroupItem(props:ToggleGroupItemProps){
 const context=useContext(Context);if(!context)throw new Error('ToggleGroupItem must be inside ToggleGroup.');
 const [element,setElement]=createRegistration<HTMLButtonElement|undefined>(undefined);
 const disabled=()=>Boolean(context.props.disabled)||props.disabled===''||props.disabled===true;const selected=()=>context.selected(props.value);
 const variant=()=>context.props.variant??props.variant;const size=()=>context.props.size??props.size;
 context.navigation.register({value:()=>props.value,disabled,selected,node:element});
 const rest=omit(props,'class','ref','value','variant','size','disabled','tabindex','onClick','onFocus');
 return <button {...rest} ref={node=>{setElement(node);if(typeof props.ref==='function')props.ref(node);}} type="button" value={props.value} disabled={disabled()} aria-pressed={selected()?'true':'false'} data-slot="toggle-group-item" data-choice-item="" data-state={selected()?'on':'off'} data-variant={variant()??'default'} data-size={size()??'default'} data-spacing={context.props.spacing??2} tabindex={context.navigation.tabIndex(props.value)} onClick={event=>{callHandler(props.onClick,event);if(!event.defaultPrevented&&!disabled())context.toggle(props.value);}} onFocus={event=>untrack(()=>{callHandler(props.onFocus,event);if(!event.defaultPrevented)context.navigation.setFocused(props.value);})}
 class={cn('shrink-0 group-data-[spacing=0]/toggle-group:rounded-none group-data-[spacing=0]/toggle-group:px-2 focus:z-10 focus-visible:z-10 group-data-horizontal/toggle-group:data-[spacing=0]:first:rounded-s-lg group-data-vertical/toggle-group:data-[spacing=0]:first:rounded-t-lg group-data-horizontal/toggle-group:data-[spacing=0]:last:rounded-e-lg group-data-vertical/toggle-group:data-[spacing=0]:last:rounded-b-lg group-data-horizontal/toggle-group:data-[spacing=0]:data-[variant=outline]:border-s-0 group-data-vertical/toggle-group:data-[spacing=0]:data-[variant=outline]:border-t-0 group-data-horizontal/toggle-group:data-[spacing=0]:data-[variant=outline]:first:border-s group-data-vertical/toggle-group:data-[spacing=0]:data-[variant=outline]:first:border-t',toggleVariants({variant:variant(),size:size()}),props.class)}/>;
}
