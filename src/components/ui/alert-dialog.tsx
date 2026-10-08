// Native modal alert dialogs: inert background, explicit actions and least-destructive focus; D19/D90.
import { createContext, createSignal, omit, Show, useContext } from 'solid-js';
import type { JSX } from '@solidjs/web';
import { cn } from '../../lib/utils';
import { buttonVariants } from './button';
import type { VariantProps } from 'class-variance-authority';
import { callHandler } from '../../lib/controllable';
import { createLayer, useNativeLayer, type LayerContext, type LayerProps, type FocusProps } from '../../lib/layer';
const Context=createContext<LayerContext|null>(null);
/** Require a root for consistent modality, IDs and focus restoration. */
function useAlert(){const value=useContext(Context);if(!value)throw new Error('AlertDialog parts must be inside AlertDialog.');return value;}
export type AlertDialogProps=LayerProps;
/** Create an isolated alert-dialog state owner. */
export function AlertDialog(props:AlertDialogProps){const context=createLayer(props);return <Context value={context}>{props.children}</Context>;}
/** Expose open state on a native trigger button. */
export function AlertDialogTrigger(props:JSX.ButtonHTMLAttributes<HTMLButtonElement>){const context=useAlert();const rest=omit(props,'ref','onClick');return <button {...rest} ref={node=>{context.setTrigger(node);if(typeof props.ref==='function')props.ref(node);}} type="button" data-slot="alert-dialog-trigger" aria-haspopup="dialog" aria-expanded={context.open()?'true':'false'} aria-controls={context.contentId()} onClick={event=>{callHandler(props.onClick,event);if(!event.defaultPrevented)context.request(true);}}/>;}
/** Native top-layer rendering preserves context and CSS ancestry without a body portal. */
export function AlertDialogPortal(props:{children?:JSX.Element}){useAlert();return <>{props.children}</>;}
/** Render the dimming layer inside the native modal's full-viewport shell. */
export function AlertDialogOverlay(props:JSX.HTMLAttributes<HTMLDivElement>){const context=useAlert();const rest=omit(props,'class');return <div {...rest} aria-hidden="true" hidden={!context.open()} data-slot="alert-dialog-overlay" data-open={context.open()?'':undefined} class={cn("fixed inset-0 z-50 bg-black/10 duration-100 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",props.class)}/>;}
export type AlertDialogContentProps=JSX.HTMLAttributes<HTMLDivElement> & FocusProps & {size?:'default'|'sm';forceMount?:boolean};
/** Mount the modal only while open unless forceMount is explicitly requested. */
export function AlertDialogContent(props:AlertDialogContentProps){const context=useAlert();context.register('content',()=>props.id||`alert-${context.id}`);return <Show when={props.forceMount||context.open()}><AlertView {...props}/></Show>;}
/** Use showModal for browser focus containment and background inertness. */
function AlertView(props:AlertDialogContentProps){const context=useAlert();const [element,setElement]=createSignal<HTMLDialogElement|undefined>(undefined,{ownedWrite:true});const rest=omit(props,'id','class','size','forceMount','onOpenAutoFocus','onCloseAutoFocus','onEscapeKeyDown','aria-label','aria-labelledby','aria-describedby');useNativeLayer(context,element,()=>true,props);
 return <dialog ref={node=>setElement(node)} data-slot="alert-dialog-shell" role="alertdialog" aria-label={props['aria-label']} aria-modal="true" aria-labelledby={props['aria-labelledby']??context.title()} aria-describedby={props['aria-describedby']??context.description()} class="fixed inset-0 m-0 h-full max-h-none w-full max-w-none border-0 bg-transparent p-0 text-inherit"><AlertDialogOverlay/><div {...rest} id={context.contentId()} tabindex={-1} data-slot="alert-dialog-content" data-size={props.size??'default'} data-open={context.open()?'':undefined} class={cn("group/alert-dialog-content fixed top-1/2 left-1/2 z-50 grid w-full -translate-x-1/2 -translate-y-1/2 gap-4 rounded-xl bg-popover p-4 text-popover-foreground ring-1 ring-foreground/10 duration-100 outline-none data-[size=default]:max-w-xs data-[size=sm]:max-w-xs data-[size=default]:sm:max-w-sm data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",'max-h-[calc(100dvh-2rem)] overflow-auto w-[calc(100%-2rem)]',props.class)}/></dialog>;
}
/** Render the alert dialog header with shared theme styling. */
export function AlertDialogHeader(props:JSX.HTMLAttributes<HTMLDivElement> ){const rest=omit(props,'class');return <div {...rest} data-slot="alert-dialog-header" class={cn("grid grid-rows-[auto_1fr] place-items-center gap-1.5 text-center has-data-[slot=alert-dialog-media]:grid-rows-[auto_auto_1fr] has-data-[slot=alert-dialog-media]:gap-x-4 sm:group-data-[size=default]/alert-dialog-content:place-items-start sm:group-data-[size=default]/alert-dialog-content:text-left sm:group-data-[size=default]/alert-dialog-content:has-data-[slot=alert-dialog-media]:grid-rows-[auto_1fr]",props.class)}/>;}
/** Render the alert dialog footer with shared theme styling. */
export function AlertDialogFooter(props:JSX.HTMLAttributes<HTMLDivElement> ){const rest=omit(props,'class');return <div {...rest} data-slot="alert-dialog-footer" class={cn("-mx-4 -mb-4 flex flex-col-reverse gap-2 rounded-b-xl border-t bg-muted/50 p-4 group-data-[size=sm]/alert-dialog-content:grid group-data-[size=sm]/alert-dialog-content:grid-cols-2 sm:flex-row sm:justify-end",props.class)}/>;}
/** Render the alert dialog media with shared theme styling. */
export function AlertDialogMedia(props:JSX.HTMLAttributes<HTMLDivElement> ){const rest=omit(props,'class');return <div {...rest} data-slot="alert-dialog-media" class={cn("mb-2 inline-flex size-10 items-center justify-center rounded-md bg-muted sm:group-data-[size=default]/alert-dialog-content:row-span-2 *:[svg:not([class*='size-'])]:size-6",props.class)}/>;}
/** Render the alert dialog title with shared theme styling. */
export function AlertDialogTitle(props:JSX.HTMLAttributes<HTMLHeadingElement> ){const context=useAlert();const id=()=>props.id||`alert-${context.id}-title`;context.register('title',id);const rest=omit(props,'id','class');return <h2 {...rest} id={id()} data-slot="alert-dialog-title" class={cn("font-heading text-base font-medium sm:group-data-[size=default]/alert-dialog-content:group-has-data-[slot=alert-dialog-media]/alert-dialog-content:col-start-2",props.class)}/>;}
/** Render the alert dialog description with shared theme styling. */
export function AlertDialogDescription(props:JSX.HTMLAttributes<HTMLParagraphElement> ){const context=useAlert();const id=()=>props.id||`alert-${context.id}-description`;context.register('description',id);const rest=omit(props,'id','class');return <p {...rest} id={id()} data-slot="alert-dialog-description" class={cn("text-sm text-balance text-muted-foreground md:text-pretty *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground",props.class)}/>;}
export type AlertDialogButtonProps=JSX.ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>;
/** Close only after a synchronous action accepts the request; preventDefault keeps it open for async work. */
export function AlertDialogAction(props:AlertDialogButtonProps){const context=useAlert();const rest=omit(props,'class','variant','size','onClick');return <button {...rest} type="button" data-slot="alert-dialog-action" class={cn(buttonVariants({variant:props.variant,size:props.size}),props.class)} onClick={event=>{callHandler(props.onClick,event);if(!event.defaultPrevented)context.request(false);}}/>;}
/** Provide the default initial-focus target and a non-destructive close action. */
export function AlertDialogCancel(props:AlertDialogButtonProps){const context=useAlert();const rest=omit(props,'class','variant','size','onClick');return <button {...rest} type="button" data-slot="alert-dialog-cancel" class={cn(buttonVariants({variant:props.variant??'outline',size:props.size}),props.class)} onClick={event=>{callHandler(props.onClick,event);if(!event.defaultPrevented)context.request(false);}}/>;}
