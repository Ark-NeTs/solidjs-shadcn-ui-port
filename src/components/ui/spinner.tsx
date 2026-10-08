// Accessible native loading status with reduced-motion support; D19/D90.
import { omit } from 'solid-js';
import type { JSX } from '@solidjs/web';
import { cn } from '../../lib/utils';
/** Announce loading once through a named status; applications own pending work. */
export function Spinner(props: Omit<JSX.SvgSVGAttributes<SVGSVGElement>,'children'>) {
 const rest=omit(props,'class');
 return <svg viewBox="0 0 24 24" fill="none" role="status" aria-label="Loading" {...rest} data-slot="spinner" class={cn('size-4 animate-spin motion-reduce:animate-none',props.class)}><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="3" opacity=".25"/><path d="M12 3a9 9 0 0 1 9 9" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>;
}
