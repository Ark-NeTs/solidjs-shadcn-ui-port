// Four-sided native modal sheet compositions; D19/D90.
import {omit} from 'solid-js';
import type {JSX} from '@solidjs/web';
import {ModalRoot,ModalTrigger,ModalClose,ModalPortal,ModalOverlay,ModalContent,ModalTitle,ModalDescription,type ModalRootProps,type ModalContentProps} from '../../lib/modal';
import {cn} from '../../lib/utils';
export type SheetProps=ModalRootProps;
/** Reuse native dialog behavior with edge-aligned presentation. */
export function Sheet(props:SheetProps){return <ModalRoot {...props} family="sheet"/>;}
export {ModalTrigger as SheetTrigger,ModalClose as SheetClose,ModalPortal as SheetPortal,ModalOverlay as SheetOverlay};
export type SheetSide='top'|'right'|'bottom'|'left';
export type SheetContentProps=ModalContentProps & {side?:SheetSide};
/** Bound sheet content to the viewport while retaining scrolling and native focus. */
export function SheetContent(props:SheetContentProps){const rest=omit(props,'class','side');return <ModalContent {...rest} data-side={props.side??'right'} class={cn('fixed z-50 flex flex-col gap-4 bg-popover bg-clip-padding text-sm text-popover-foreground shadow-lg max-h-[100dvh] overflow-auto data-[side=bottom]:inset-x-0 data-[side=bottom]:bottom-0 data-[side=bottom]:h-auto data-[side=bottom]:border-t data-[side=left]:inset-y-0 data-[side=left]:left-0 data-[side=left]:h-full data-[side=left]:w-3/4 data-[side=left]:border-r data-[side=right]:inset-y-0 data-[side=right]:right-0 data-[side=right]:h-full data-[side=right]:w-3/4 data-[side=right]:border-l data-[side=top]:inset-x-0 data-[side=top]:top-0 data-[side=top]:h-auto data-[side=top]:border-b data-[side=left]:sm:max-w-sm data-[side=right]:sm:max-w-sm',props.class)}/>;}
/** Group sheet heading and description. */
export function SheetHeader(props:JSX.HTMLAttributes<HTMLDivElement>){const rest=omit(props,'class');return <div {...rest} data-slot="sheet-header" class={cn('flex flex-col gap-0.5 p-4',props.class)}/>;}
/** Keep sheet actions at the end of the panel. */
export function SheetFooter(props:JSX.HTMLAttributes<HTMLDivElement>){const rest=omit(props,'class');return <div {...rest} data-slot="sheet-footer" class={cn('mt-auto flex flex-col gap-2 p-4',props.class)}/>;}
/** Register an accessible sheet heading. */
export function SheetTitle(props:JSX.HTMLAttributes<HTMLHeadingElement>){const rest=omit(props,'class');return <ModalTitle {...rest} class={cn('font-heading text-base font-medium text-foreground',props.class)}/>;}
/** Register sheet supporting text. */
export function SheetDescription(props:JSX.HTMLAttributes<HTMLParagraphElement>){const rest=omit(props,'class');return <ModalDescription {...rest} class={cn('text-sm text-muted-foreground',props.class)}/>;}
