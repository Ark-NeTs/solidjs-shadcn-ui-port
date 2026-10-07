// Accessible signal-driven tabs with sibling styles and native buttons; D19/D90.
import { createContext, createSignal, createUniqueId, onCleanup, omit, Show, useContext, type Accessor } from 'solid-js';
import type { JSX } from '@solidjs/web';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { createControllable, callHandler } from '../../lib/controllable';

type Entry = {value: Accessor<string>; id: Accessor<string>; disabled?: Accessor<boolean>};
type TabsContextValue = {
  id: Accessor<string>; value: Accessor<string | undefined>; select: (value: string) => void;
  orientation: Accessor<'horizontal' | 'vertical'>; activation: Accessor<'automatic' | 'manual'>;
  entries: Accessor<Entry[]>; panels: Accessor<Entry[]>; register: (entry: Entry, panel?: boolean) => void;
  focused: Accessor<string | undefined>; setFocused: (value: string) => void;
};
const Context = createContext<TabsContextValue|null>(null);
/** Fail clearly when compound parts are used without their root. */
function useTabs() {const context=useContext(Context);if(!context)throw new Error('Tabs parts must be inside Tabs.');return context;}
export type TabsProps = JSX.HTMLAttributes<HTMLDivElement> & {value?: string; defaultValue?: string; onValueChange?: (value: string) => void; orientation?: 'horizontal' | 'vertical'; activationMode?: 'automatic' | 'manual'};
/** Derive selection and registration without mirroring prop values in effects. */
export function Tabs(props: TabsProps) {
  const defaultId=createUniqueId();
  const [entries,setEntries]=createSignal<Entry[]>([],{ownedWrite:true});const [panels,setPanels]=createSignal<Entry[]>([],{ownedWrite:true});
  const [value,setValue]=createControllable(()=>props.value,()=>props.defaultValue,value=>props.onValueChange?.(value!));
  const [focused,setFocused]=createSignal<string>();
  const context: TabsContextValue={id:()=>props.id||`tabs-${defaultId}`,entries,panels,
    value:()=>props.value!==undefined?props.value:entries().find(entry=>entry.value()===value()&&!entry.disabled!())?.value()??entries().find(entry=>!entry.disabled!())?.value(),
    select:setValue,orientation:()=>props.orientation??'horizontal',activation:()=>props.activationMode??'automatic',focused,setFocused,
    register(entry,panel=false){const setter=panel?setPanels:setEntries;setter(current=>[...current,entry]);onCleanup(()=>setter(current=>current.filter(item=>item!==entry)));},
  };
  const rest=omit(props,'id','class','value','defaultValue','onValueChange','orientation','activationMode');
  return <Context value={context}><div {...rest} id={context.id()} data-slot="tabs" data-orientation={context.orientation()} data-horizontal={context.orientation()==='horizontal'?'':undefined} data-vertical={context.orientation()==='vertical'?'':undefined} class={cn('group/tabs flex min-w-0 gap-2 data-horizontal:flex-col',props.class)}/></Context>;
}
export const tabsListVariants = cva(
  "group/tabs-list inline-flex w-fit items-center justify-center rounded-lg p-[3px] text-muted-foreground group-data-horizontal/tabs:h-8 group-data-vertical/tabs:h-fit group-data-vertical/tabs:flex-col data-[variant=line]:rounded-none",
  {
    variants: {
      variant: {
        default: "bg-muted",
        line: "gap-1 bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export type TabsListProps=JSX.HTMLAttributes<HTMLDivElement> & VariantProps<typeof tabsListVariants> & {loop?: boolean};
/** Move focus in DOM order, skipping disabled tabs and respecting computed direction. */
export function TabsList(props: TabsListProps) {
  const context=useTabs();const rest=omit(props,'class','variant','onKeyDown','loop');
  /** Process only this list’s navigation keys and allow caller cancellation. */
  function onKeyDown(event: KeyboardEvent & {currentTarget: HTMLDivElement; target: Element}) {
    callHandler(props.onKeyDown,event);if(event.defaultPrevented)return;
    const target=event.target.closest<HTMLButtonElement>('[role="tab"]');
    if(!target||target.closest('[role="tablist"]')!==event.currentTarget)return;
    const horizontal=context.orientation()==='horizontal';const rtl=getComputedStyle(event.currentTarget).direction==='rtl';
    const forward=horizontal?(rtl?'ArrowLeft':'ArrowRight'):'ArrowDown';const backward=horizontal?(rtl?'ArrowRight':'ArrowLeft'):'ArrowUp';
    if(![forward,backward,'Home','End'].includes(event.key))return;
    const tabs=Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]')).filter(tab=>!tab.disabled&&tab.closest('[role="tablist"]')===event.currentTarget);
    let index=event.key==='Home'?0:event.key==='End'?tabs.length-1:tabs.indexOf(target)+(event.key===forward?1:-1);
    index=props.loop===false?Math.max(0,Math.min(index,tabs.length-1)):(index+tabs.length)%tabs.length;
    event.preventDefault();tabs[index]?.focus();
  }
  return <div {...rest} role="tablist" aria-orientation={context.orientation()} data-slot="tabs-list" data-variant={props.variant??'default'} onKeyDown={onKeyDown} class={cn(tabsListVariants({variant:props.variant}),'max-w-full justify-start overflow-x-auto data-[variant=line]:pb-1.5',props.class)}/>;
}
export type TabsTriggerProps=Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>,'value'> & {value:string};
/** A roving native button selects immediately or on activation, according to the root. */
export function TabsTrigger(props: TabsTriggerProps) {
  const context=useTabs();const id=()=>props.id||`${context.id()}-${encodeURIComponent(props.value)}-trigger`;
  context.register({value:()=>props.value,id,disabled:()=>Boolean(props.disabled)});
  const selected=()=>context.value()===props.value;
  const roving=()=>context.entries().find(entry=>!entry.disabled!()&&entry.value()===context.focused())?.value()??context.entries().find(entry=>!entry.disabled!()&&entry.value()===context.value())?.value()??context.entries().find(entry=>!entry.disabled!())?.value();
  const rest=omit(props,'id','class','value','onClick','onFocus');
  return <button {...rest} id={id()} type="button" role="tab" data-slot="tabs-trigger" data-active={selected()?'':undefined} data-state={selected()?'active':'inactive'} aria-selected={selected()?'true':'false'} aria-controls={context.panels().find(entry=>entry.value()===props.value)?.id()} tabindex={!props.disabled&&roving()===props.value?0:-1}
    onClick={event=>{callHandler(props.onClick,event);if(!event.defaultPrevented)context.select(props.value);}}
    onFocus={event=>{callHandler(props.onFocus,event);context.setFocused(props.value);if(!event.defaultPrevented&&context.activation()==='automatic')context.select(props.value);}}
    class={cn("relative inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-1.5 py-0.5 text-sm font-medium whitespace-nowrap text-foreground/60 transition-all group-data-vertical/tabs:w-full group-data-vertical/tabs:justify-start hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 has-data-[icon=inline-end]:pr-1 has-data-[icon=inline-start]:pl-1 dark:text-muted-foreground dark:hover:text-foreground group-data-[variant=default]/tabs-list:data-active:shadow-sm group-data-[variant=line]/tabs-list:data-active:shadow-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",'group-data-[variant=line]/tabs-list:bg-transparent group-data-[variant=line]/tabs-list:data-active:bg-transparent dark:group-data-[variant=line]/tabs-list:data-active:border-transparent dark:group-data-[variant=line]/tabs-list:data-active:bg-transparent','data-active:bg-background data-active:text-foreground dark:data-active:border-input dark:data-active:bg-input/30 dark:data-active:text-foreground','after:absolute after:bg-foreground after:opacity-0 after:transition-opacity group-data-horizontal/tabs:after:inset-x-0 group-data-horizontal/tabs:after:bottom-[-5px] group-data-horizontal/tabs:after:h-0.5 group-data-vertical/tabs:after:inset-y-0 group-data-vertical/tabs:after:-right-1 group-data-vertical/tabs:after:w-0.5 group-data-[variant=line]/tabs-list:data-active:after:opacity-100',props.class)}/>;
}
export type TabsContentProps=JSX.HTMLAttributes<HTMLDivElement> & {value:string; forceMount?:boolean};
/** Keep panel semantics available, while inactive child trees mount only when requested. */
export function TabsContent(props: TabsContentProps) {
  const context=useTabs();const id=()=>props.id||`${context.id()}-${encodeURIComponent(props.value)}-content`;
  context.register({value:()=>props.value,id},true);
  const active=()=>context.value()===props.value;const rest=omit(props,'id','class','value','forceMount','children');
  return <div {...rest} id={id()} role="tabpanel" data-slot="tabs-content" data-state={active()?'active':'inactive'} hidden={!active()} tabindex={0} aria-labelledby={context.entries().find(entry=>entry.value()===props.value)?.id()} class={cn('min-w-0 flex-1 text-sm outline-none',props.class)}><Show when={active()||props.forceMount}>{props.children}</Show></div>;
}
