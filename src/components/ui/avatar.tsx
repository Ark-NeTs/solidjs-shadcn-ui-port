// Owned image lifecycle after Kobalte's rc.13 relay diagnostic; D19/D90.
import { createContext, createEffect, createSignal, omit, Show, useContext, untrack } from 'solid-js';
import type { JSX } from '@solidjs/web';
import { cn } from '../../lib/utils';
export type AvatarLoadingStatus = 'idle'|'loading'|'loaded'|'error';
type AvatarContextValue={status:()=>AvatarLoadingStatus;setStatus:(value:AvatarLoadingStatus)=>void};
const AvatarContext=createContext<AvatarContextValue|null>(null);
/** Require image/fallback parts to share their owning avatar. */
function useAvatar(){const context=useContext(AvatarContext);if(!context)throw new Error('AvatarImage and AvatarFallback must be inside Avatar');return context;}
/** Own only the active image lifecycle; callers supply initials, labels and source data. */
export function Avatar(props: JSX.HTMLAttributes<HTMLSpanElement> & {size?:'default'|'sm'|'lg';onLoadingStatusChange?:(value:AvatarLoadingStatus)=>void}){
 const rest=omit(props,'class','size','children','onLoadingStatusChange');const [status,setStatus]=createSignal<AvatarLoadingStatus>('idle',{ownedWrite:true});
 const context={status,setStatus:(value:AvatarLoadingStatus)=>{setStatus(value);untrack(()=>props.onLoadingStatusChange?.(value));}};
 return <AvatarContext value={context}><span {...rest} data-slot="avatar" data-size={props.size??'default'} class={cn('group/avatar relative flex size-8 shrink-0 rounded-full select-none after:pointer-events-none after:absolute after:inset-0 after:rounded-full after:border after:border-border after:mix-blend-darken data-[size=lg]:size-10 data-[size=sm]:size-6 dark:after:mix-blend-lighten',props.class)}>{props.children}</span></AvatarContext>;
}
/** Ignore stale image completions and release handlers with each source and owner. */
export function AvatarImage(props: JSX.ImgHTMLAttributes<HTMLImageElement> & {onLoadingStatusChange?:(value:AvatarLoadingStatus)=>void}){
 const context=useAvatar();const rest=omit(props,'class','onLoadingStatusChange');
 createEffect(()=>[props.src,props.srcset,props.sizes,props.crossorigin,props.referrerpolicy] as const,([src,srcset,sizes,crossorigin,referrerpolicy])=>{
  let active=true;
  /** Notify the shared owner directly, without an effect relaying derived state. */
  function status(value:AvatarLoadingStatus){if(!active)return;context.setStatus(value);untrack(()=>props.onLoadingStatusChange?.(value));}
  if((typeof src!=='string'||!src)&&(typeof srcset!=='string'||!srcset)){status('error');return ()=>{active=false;context.setStatus('idle');};}
  const image=new Image();status('loading');image.onload=()=>status('loaded');image.onerror=()=>status('error');
  if(typeof crossorigin==='string')image.crossOrigin=crossorigin;if(typeof referrerpolicy==='string')image.referrerPolicy=referrerpolicy;if(typeof sizes==='string')image.sizes=sizes;if(typeof srcset==='string')image.srcset=srcset;if(typeof src==='string')image.src=src;
  return ()=>{active=false;image.onload=null;image.onerror=null;context.setStatus('idle');};
 });
 return <Show when={context.status()==='loaded'}><img {...rest} data-slot="avatar-image" class={cn('aspect-square size-full rounded-full object-cover',props.class)}/></Show>;
}
/** Delay optional initials, then retain them until a valid image is ready. */
export function AvatarFallback(props: JSX.HTMLAttributes<HTMLSpanElement> & {delayMs?:number}){
 const context=useAvatar();const rest=omit(props,'class','delayMs');const [ready,setReady]=createSignal(false,{ownedWrite:true});
 createEffect(()=>props.delayMs,delay=>{if(delay===undefined)return;setReady(false);const timer=setTimeout(()=>setReady(true),Math.max(0,delay));return ()=>clearTimeout(timer);});
 return <Show when={(props.delayMs===undefined||ready())&&context.status()!=='loaded'}><span {...rest} data-slot="avatar-fallback" class={cn('flex size-full items-center justify-center rounded-full bg-muted text-sm text-foreground group-data-[size=sm]/avatar:text-xs',props.class)}/></Show>;
}
/** Add a named status badge without intercepting image interactions. */
export function AvatarBadge(props:JSX.HTMLAttributes<HTMLSpanElement>){const rest=omit(props,'class');return <span {...rest} data-slot="avatar-badge" class={cn('absolute end-0 bottom-0 z-10 inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground bg-blend-color ring-2 ring-background select-none group-data-[size=sm]/avatar:size-2 group-data-[size=sm]/avatar:[&>svg]:hidden group-data-[size=default]/avatar:size-2.5 group-data-[size=default]/avatar:[&>svg]:size-2 group-data-[size=lg]/avatar:size-3 group-data-[size=lg]/avatar:[&>svg]:size-2',props.class)}/>;}
/** Group identities visually; applications provide useful names. */
export function AvatarGroup(props:JSX.HTMLAttributes<HTMLDivElement>){const rest=omit(props,'class');return <div {...rest} data-slot="avatar-group" class={cn('group/avatar-group flex -space-x-2 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:ring-background',props.class)}/>;}
/** Show additional identity count with the same size vocabulary. */
export function AvatarGroupCount(props:JSX.HTMLAttributes<HTMLDivElement>){const rest=omit(props,'class');return <div {...rest} data-slot="avatar-group-count" class={cn('relative flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm text-foreground ring-2 ring-background group-has-data-[size=lg]/avatar-group:size-10 group-has-data-[size=sm]/avatar-group:size-6 [&>svg]:size-4 group-has-data-[size=lg]/avatar-group:[&>svg]:size-5 group-has-data-[size=sm]/avatar-group:[&>svg]:size-3',props.class)}/>;}
