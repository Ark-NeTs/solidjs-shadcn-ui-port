// Shared native dialog lifecycle and family-specific compositions; D19/D90.
import {createContext,createSignal,omit,Show,useContext,onCleanup} from 'solid-js';
import {Dynamic,type JSX} from '@solidjs/web';
import {createLayer,useNativeLayer,type LayerProps,type FocusProps} from './layer';
import {callHandler} from './controllable';
import {cn} from './utils';
import {buttonVariants} from '../components/ui/button';
export type ModalFamily='dialog'|'sheet'|'drawer';
export type ModalRootProps=LayerProps & {modal?:boolean;dismissible?:boolean};
/** Keep root control and modality in the caller while sharing native layer behavior. */
function createModal(props:ModalRootProps & {family:ModalFamily}){return {...createLayer(props),family:()=>props.family,modal:()=>props.modal??true,dismissible:()=>props.dismissible??true};}
const Context=createContext<ReturnType<typeof createModal>|null>(null);
/** Require a modal owner for names, focus and controlled state. */
export function useModal(){const context=useContext(Context);if(!context)throw new Error('Modal parts must be inside Dialog, Sheet or Drawer.');return context;}
/** Supply one state owner to a dialog family. */
export function ModalRoot(props:ModalRootProps & {family:ModalFamily}){const context=createModal(props);return <Context value={context}>{props.children}</Context>;}
/** Open through a native button, preserving canceled caller actions. */
export function ModalTrigger(props:JSX.ButtonHTMLAttributes<HTMLButtonElement>){const context=useModal();const rest=omit(props,'ref','onClick');onCleanup(()=>context.setTrigger(undefined));return <button {...rest} type="button" ref={node=>{context.setTrigger(node);if(typeof props.ref==='function')props.ref(node);}} data-slot={`${context.family()}-trigger`} aria-haspopup="dialog" aria-expanded={context.open()?'true':'false'} aria-controls={context.contentId()} onClick={event=>{callHandler(props.onClick,event);if(!event.defaultPrevented)context.request(true);}}/>;}
/** Close only after the synchronous caller accepts the action. */
export function ModalClose(props:JSX.ButtonHTMLAttributes<HTMLButtonElement>){const context=useModal();const rest=omit(props,'onClick');return <button {...rest} type="button" data-slot={`${context.family()}-close`} onClick={event=>{callHandler(props.onClick,event);if(!event.defaultPrevented)context.request(false);}}/>;}
/** Keep native top-layer content in its theme and direction ancestry. */
export function ModalPortal(props:{children?:JSX.Element}){useModal();return <>{props.children}</>;}
/** Render decoration only; the owning shell handles outside dismissal. */
export function ModalOverlay(props:JSX.HTMLAttributes<HTMLDivElement>){const context=useModal();const rest=omit(props,'class');return <div {...rest} aria-hidden="true" hidden={!context.modal()||!context.open()} data-slot={`${context.family()}-overlay`} class={cn('pointer-events-auto fixed inset-0 z-50 bg-black/10 supports-backdrop-filter:backdrop-blur-xs',props.class)}/>;}
export type ModalContentProps=JSX.HTMLAttributes<HTMLDivElement> & FocusProps & {forceMount?:boolean;showCloseButton?:boolean;closeLabel?:string;onPointerDownOutside?:(event:PointerEvent)=>void;onInteractOutside?:(event:Event)=>void};
/** Register the stable content ID even when the visible content is unmounted. */
export function ModalContent(props:ModalContentProps){const context=useModal();context.register('content',()=>props.id||`${context.family()}-${context.id}`);return <Show when={props.forceMount||context.open()}><ModalView {...props}/></Show>;}
/** Use a native top layer with an independently scrollable content panel. */
function ModalView(props:ModalContentProps){const context=useModal();const [element,setElement]=createSignal<HTMLElement|undefined>(undefined,{ownedWrite:true});let content!:HTMLDivElement;let outside=false;
 const rest=omit(props,'id','ref','class','children','forceMount','showCloseButton','closeLabel','onOpenAutoFocus','onCloseAutoFocus','onEscapeKeyDown','onPointerDownOutside','onInteractOutside','aria-label','aria-labelledby','aria-describedby');
 useNativeLayer(context,element,context.modal,{get onOpenAutoFocus(){return props.onOpenAutoFocus;},get onCloseAutoFocus(){return props.onCloseAutoFocus;},onEscapeKeyDown:event=>{if(!context.dismissible())event.preventDefault();props.onEscapeKeyDown?.(event);}});
 /** Require both press and release outside the content to avoid dismissing selection drags. */
 function press(event:PointerEvent){outside=event.button===0&&!content.contains(event.target as Node);if(outside){props.onPointerDownOutside?.(event);props.onInteractOutside?.(event);if(event.defaultPrevented)outside=false;}}
 /** The native modal background can dismiss only the root that owns this shell. */
 function release(event:PointerEvent){if(outside&&context.dismissible()&&!content.contains(event.target as Node)&&!event.defaultPrevented)context.request(false);outside=false;}
 const popoverMode=()=>context.modal()?undefined:context.dismissible()?'auto':'manual';
 return <Dynamic component={context.modal()?'dialog':'div'} ref={setElement} role="dialog" popover={popoverMode()} aria-modal={context.modal()?'true':undefined} aria-label={props['aria-label']} aria-labelledby={props['aria-labelledby']??context.title()} aria-describedby={props['aria-describedby']??context.description()} data-slot={`${context.family()}-shell`} class="pointer-events-none fixed inset-0 m-0 h-full max-h-none w-full max-w-none border-0 bg-transparent p-0 text-inherit" onPointerDown={press} onPointerUp={release}><ModalOverlay/><div {...rest} ref={node=>{content=node;if(typeof props.ref==='function')props.ref(node);}} id={context.contentId()} tabindex={-1} data-layer-content="" data-slot={`${context.family()}-content`} data-state={context.open()?'open':'closed'} data-open={context.open()?'':undefined} class={cn('pointer-events-auto outline-none',props.class)}>{props.children}<Show when={props.showCloseButton??true}><ModalClose class={cn(buttonVariants({variant:'ghost',size:'icon-sm'}),'absolute top-2 end-2')} aria-label={props.closeLabel??'Close'}><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" class="size-4"><path d="m6 6 12 12M6 18 18 6"/></svg></ModalClose></Show></div></Dynamic>;
}
/** Register reactive title IDs without mirrored state. */
export function ModalTitle(props:JSX.HTMLAttributes<HTMLHeadingElement>){const context=useModal();const id=()=>props.id||`${context.family()}-${context.id}-title`;context.register('title',id);const rest=omit(props,'id');return <h2 {...rest} id={id()} data-slot={`${context.family()}-title`}/>;}
/** Register reactive description IDs and remove them with their owner. */
export function ModalDescription(props:JSX.HTMLAttributes<HTMLParagraphElement>){const context=useModal();const id=()=>props.id||`${context.family()}-${context.id}-description`;context.register('description',id);const rest=omit(props,'id');return <p {...rest} id={id()} data-slot={`${context.family()}-description`}/>;}
