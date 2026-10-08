// Kobalte Toggle behind the package API, with cancellable owner state; D19/D90.
import { omit } from 'solid-js';
import type { JSX } from '@solidjs/web';
import { Root as TogglePrimitive } from '@kobalte/core/toggle-button';
import { cva, type VariantProps } from 'class-variance-authority';
import { createControllable, callHandler } from '../../lib/controllable';
import { cn } from '../../lib/utils';
export const toggleVariants = cva(
  "group/toggle inline-flex items-center justify-center gap-1 rounded-lg text-sm font-medium whitespace-nowrap transition-all outline-none hover:bg-muted hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 aria-pressed:bg-muted data-[state=on]:bg-muted dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline: "border border-input bg-transparent hover:bg-muted",
      },
      size: {
        default:
          "h-8 min-w-8 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        sm: "h-7 min-w-7 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-9 min-w-9 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export type ToggleProps=Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>,'onChange'> & VariantProps<typeof toggleVariants> & {pressed?:boolean;defaultPressed?:boolean;onPressedChange?:(pressed:boolean)=>void};
/** Adapt callback names and canceled native activation without modifying Kobalte. */
export function Toggle(props:ToggleProps){
 const [pressed,request]=createControllable(()=>props.pressed,()=>props.defaultPressed??false,next=>props.onPressedChange?.(next));
 let canceled=false;
 const rest=omit(props,'class','variant','size','pressed','defaultPressed','onPressedChange','onClick','disabled');
 return <TogglePrimitive {...rest} disabled={props.disabled===''||Boolean(props.disabled)} type="button" pressed={pressed()} onChange={next=>{if(!canceled)request(next);}} onClick={event=>{callHandler(props.onClick,event);canceled=event.defaultPrevented;}} data-slot="toggle" data-state={pressed()?'on':'off'} data-variant={props.variant??'default'} data-size={props.size??'default'} class={cn(toggleVariants({variant:props.variant,size:props.size}),props.class)}/>;
}
