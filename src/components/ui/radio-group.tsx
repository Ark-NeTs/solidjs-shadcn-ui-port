// Native radio form participation with canonical group state and sibling surfaces; D19/D90.
import { createContext, createEffect, createUniqueId, omit, untrack, useContext } from 'solid-js';
import type { JSX } from '@solidjs/web';
import { createControllable, callHandler } from '../../lib/controllable';
import { createChoiceNavigation } from '../../lib/choice-navigation';
import { createRegistration } from '../../lib/registration';
import { callToggleHandler } from '../../lib/toggle';
import { cn } from '../../lib/utils';
export type RadioGroupProps=JSX.HTMLAttributes<HTMLDivElement> & {value?:string;defaultValue?:string;onValueChange?:(value:string)=>void;name?:string;form?:string;required?:boolean;disabled?:boolean;readonly?:boolean;orientation?:'horizontal'|'vertical';loop?:boolean};
/** Own one value and one reset listener, even when the native inputs belong to an external form. */
function createRadioGroup(props:RadioGroupProps){
 const id=createUniqueId();const initial=untrack(()=>props.defaultValue??'');
 const [value,request]=createControllable(()=>props.value,()=>initial,next=>props.onValueChange?.(next));
 const navigation=createChoiceNavigation({orientation:()=>props.orientation,loop:()=>props.loop!==false,roving:()=>true,activate:node=>{if(!props.readonly)node.click();}});
 /** Native radio activation can uncheck a sibling before the owner accepts; restore the whole group. */
 function synchronize(){const nodes=navigation.entries().map(item=>item.node()).filter(Boolean) as HTMLInputElement[];for(const node of nodes)node.checked=value()===node.value;}
 createEffect(()=>[navigation.entries().map(item=>item.node()),props.form] as const,([nodes,owner])=>{
  if(owner==='')return;
  const input=nodes.find(Boolean);const form=owner===undefined?input?.closest('form'):input?.ownerDocument.getElementById(owner);if(!(form instanceof HTMLFormElement))return;
  const pending=new Set<ReturnType<typeof setTimeout>>();
  /** Defer until every bubbling reset listener has had a chance to cancel. */
  function reset(event:Event){const timer=setTimeout(()=>{pending.delete(timer);if(event.defaultPrevented)return;request(initial);synchronize();},0);pending.add(timer);}
  form.addEventListener('reset',reset);
  return()=>{form.removeEventListener('reset',reset);for(const timer of pending)clearTimeout(timer);};
 });
 return {props,value,request,synchronize,navigation,initial,name:()=>props.name??`radio-${id}`};
}
const Context=createContext<ReturnType<typeof createRadioGroup>|null>(null);
/** Keep native input semantics while exposing a named ARIA radio group. */
export function RadioGroup(props:RadioGroupProps){
 const context=createRadioGroup(props);const rest=omit(props,'class','value','defaultValue','onValueChange','name','form','required','disabled','readonly','orientation','loop','onKeyDown');
 return <Context value={context}><div {...rest} role="radiogroup" data-slot="radio-group" data-choice-root="" data-orientation={props.orientation} aria-orientation={props.orientation} aria-required={props.required?'true':undefined} aria-disabled={props.disabled?'true':undefined} aria-readonly={props.readonly?'true':undefined} class={cn('grid w-full gap-2',props.class)} onKeyDown={event=>{callHandler(props.onKeyDown,event);context.navigation.keydown(event);}}/></Context>;
}
export type RadioGroupItemProps=Omit<JSX.InputHTMLAttributes<HTMLInputElement>,'type'|'checked'|'defaultChecked'|'name'|'form'|'required'|'readonly'|'children'|'size'|'value'> & {value:string};
/** One visible native radio is both the focus target and successful form control. */
export function RadioGroupItem(props:RadioGroupItemProps){
 const context=useContext(Context);if(!context)throw new Error('RadioGroupItem must be inside RadioGroup.');
 const [element,setElement]=createRegistration<HTMLInputElement|undefined>(undefined);
 const disabled=()=>Boolean(context.props.disabled)||props.disabled===''||props.disabled===true;const selected=()=>context.value()===props.value;
 context.navigation.register({value:()=>props.value,disabled,selected,node:element});
 const rest=omit(props,'class','ref','value','disabled','onClick','onChange','onFocus','tabindex');
 return <span class="relative inline-flex size-4 shrink-0 align-middle"><input {...rest} ref={node=>{setElement(node);if(typeof props.ref==='function')props.ref(node);}} type="radio" value={props.value} name={context.name()} form={context.props.form} required={context.props.required} disabled={disabled()} defaultChecked={context.initial===props.value} checked={selected()} aria-checked={selected()?'true':'false'} aria-readonly={context.props.readonly?'true':undefined} data-choice-item="" data-slot="radio-group-item" data-state={selected()?'checked':'unchecked'} data-checked={selected()?'':undefined} tabindex={context.navigation.tabIndex(props.value)}
 onClick={event=>{callHandler(props.onClick,event);if(context.props.readonly)event.preventDefault();}}
 onChange={event=>{callToggleHandler(props.onChange,event);if(!event.defaultPrevented)context.request(props.value);context.synchronize();}}
 onFocus={event=>untrack(()=>{if(Array.isArray(props.onFocus))props.onFocus[0](props.onFocus[1],event);else if(typeof props.onFocus==='function')props.onFocus(event);if(!event.defaultPrevented)context.navigation.setFocused(props.value);})}
 class={cn('peer relative flex aspect-square size-4 shrink-0 appearance-none rounded-full border border-input outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground dark:data-checked:bg-primary',props.class)}/><span data-slot="radio-group-indicator" aria-hidden="true" class="pointer-events-none absolute start-1/2 top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-foreground opacity-0 peer-checked:opacity-100 rtl:translate-x-1/2 peer-checked:peer-disabled:opacity-50"/></span>;
}
