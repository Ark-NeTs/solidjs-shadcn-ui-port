// Native general-purpose Dialog compositions with the sibling theme; D19/D90.
import {omit,Show} from 'solid-js';
import type {JSX} from '@solidjs/web';
import {ModalRoot,ModalTrigger,ModalClose,ModalPortal,ModalOverlay,ModalContent,ModalTitle,ModalDescription,type ModalRootProps,type ModalContentProps} from '../../lib/modal';
import {cn} from '../../lib/utils';
import {buttonVariants} from './button';
export type DialogProps=ModalRootProps;
/** Own a controlled or uncontrolled dialog independently of host drafts. */
export function Dialog(props:DialogProps){return <ModalRoot {...props} family="dialog"/>;}
export {ModalTrigger as DialogTrigger,ModalClose as DialogClose,ModalPortal as DialogPortal,ModalOverlay as DialogOverlay};
export type DialogContentProps=ModalContentProps;
/** Display a centered, bounded, scrollable dialog in the native top layer. */
export function DialogContent(props:DialogContentProps){const rest=omit(props,'class');return <ModalContent {...rest} class={cn('fixed top-1/2 left-1/2 z-50 grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-xl bg-popover p-4 text-sm text-popover-foreground ring-1 ring-foreground/10 outline-none sm:max-w-sm max-h-[calc(100dvh-2rem)] overflow-auto',props.class)}/>;}
/** Group a dialog heading and description. */
export function DialogHeader(props:JSX.HTMLAttributes<HTMLDivElement>){const rest=omit(props,'class');return <div {...rest} data-slot="dialog-header" class={cn('flex flex-col gap-2',props.class)}/>;}
/** Group footer actions, with an optional non-submitting close button. */
export function DialogFooter(props:JSX.HTMLAttributes<HTMLDivElement> & {showCloseButton?:boolean;closeLabel?:string}){const rest=omit(props,'class','children','showCloseButton','closeLabel');return <div {...rest} data-slot="dialog-footer" class={cn('-mx-4 -mb-4 flex flex-col-reverse gap-2 rounded-b-xl border-t bg-muted/50 p-4 sm:flex-row sm:justify-end',props.class)}>{props.children}<Show when={props.showCloseButton}><ModalClose class={buttonVariants({variant:'outline'})}>{props.closeLabel??'Close'}</ModalClose></Show></div>;}
/** Register an accessible heading with reactive IDs. */
export function DialogTitle(props:JSX.HTMLAttributes<HTMLHeadingElement>){const rest=omit(props,'class');return <ModalTitle {...rest} class={cn('font-heading text-base leading-none font-medium',props.class)}/>;}
/** Register the accessible description. */
export function DialogDescription(props:JSX.HTMLAttributes<HTMLParagraphElement>){const rest=omit(props,'class');return <ModalDescription {...rest} class={cn('text-sm text-muted-foreground *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground',props.class)}/>;}
