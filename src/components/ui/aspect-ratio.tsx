// Native proportional layout without effects or a headless runtime; D19/D90.
import { omit } from 'solid-js';
import type { JSX } from '@solidjs/web';
import { cn } from '../../lib/utils';
/** Reserve proportional space, falling back to a square for invalid ratios. */
export function AspectRatio(props: JSX.HTMLAttributes<HTMLDivElement> & {ratio?: number}) {
 const rest=omit(props,'ratio','class');
 const ratio=()=>Number.isFinite(props.ratio) && props.ratio! > 0 ? props.ratio! : 1;
 return <div data-slot="aspect-ratio-wrapper" style={{'aspect-ratio':String(ratio()),position:'relative',width:'100%'}}><div {...rest} data-slot="aspect-ratio" class={cn('absolute inset-0',props.class)}/></div>;
}
