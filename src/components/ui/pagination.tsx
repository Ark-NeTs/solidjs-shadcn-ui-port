// Native link pagination matches the sibling's host-owned navigation contract; D19/D90.
import { omit } from 'solid-js';
import type { JSX } from '@solidjs/web';
import { Button, type ButtonProps } from './button';
import { cn } from '../../lib/utils';
export type PaginationLinkProps=JSX.AnchorHTMLAttributes<HTMLAnchorElement> & {isActive?:boolean;disabled?:boolean;size?:ButtonProps['size']};
/** Label a navigation landmark without imposing a data or page-number engine. */
export function Pagination(props:JSX.HTMLAttributes<HTMLElement>){const rest=omit(props,'class');return <nav aria-label="pagination" {...rest} data-slot="pagination" class={cn('mx-auto flex w-full justify-center',props.class)}/>;}
/** Keep pages in a semantic list. */
export function PaginationContent(props:JSX.HTMLAttributes<HTMLUListElement>){const rest=omit(props,'class');return <ul {...rest} data-slot="pagination-content" class={cn('flex items-center gap-0.5',props.class)}/>;}
/** Render a single page or previous/next control in the navigation list. */
export function PaginationItem(props:JSX.LiHTMLAttributes<HTMLLIElement>){return <li {...props} data-slot="pagination-item"/>;}
/** Preserve native href, modified-click and disabled-link behavior through the package Button. */
export function PaginationLink(props:PaginationLinkProps){const rest=omit(props,'class','isActive','size');return <Button as="a" role="link" {...rest} aria-current={props.isActive?'page':undefined} data-slot="pagination-link" data-active={props.isActive?'true':'false'} variant={props.isActive?'outline':'ghost'} size={props.size??'icon'} class={cn(props.class)}/>;}
/** Render a decorative arrow that follows the navigation direction. */
function Arrow(props:{next?:boolean}){return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true" class="size-4 rtl:rotate-180"><path d={props.next?'m9 6 6 6-6 6':'m15 6-6 6 6 6'}/></svg>;}
/** Link to the prior page with overridable localized text and accessible name. */
export function PaginationPrevious(props:PaginationLinkProps & {text?:string}){const rest=omit(props,'class','text','children');return <PaginationLink aria-label="Go to previous page" size="default" {...rest} class={cn('ps-1.5!',props.class)}><Arrow/><span class="hidden sm:block">{props.text??'Previous'}</span></PaginationLink>;}
/** Link to the next page with overridable localized text and accessible name. */
export function PaginationNext(props:PaginationLinkProps & {text?:string}){const rest=omit(props,'class','text','children');return <PaginationLink aria-label="Go to next page" size="default" {...rest} class={cn('pe-1.5!',props.class)}><span class="hidden sm:block">{props.text??'Next'}</span><Arrow next/></PaginationLink>;}
/** Hide visual elision from the accessibility tree. */
export function PaginationEllipsis(props:JSX.HTMLAttributes<HTMLSpanElement>){const rest=omit(props,'class','children');return <span {...rest} aria-hidden="true" data-slot="pagination-ellipsis" class={cn('flex size-8 items-center justify-center',props.class)}>…<span class="sr-only">More pages</span></span>;}
