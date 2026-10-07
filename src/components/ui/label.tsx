// Owned native label with shared shadcn styling and reactive DOM props; D19/D90.
import { omit } from 'solid-js';
import type { JSX } from '@solidjs/web';
import { cn } from '../../lib/utils';

export type LabelProps = JSX.LabelHTMLAttributes<HTMLLabelElement>;

/** Preserve native label semantics, refs and events without a required field provider. */
export function Label(props: LabelProps) {
  const rest = omit(props, 'class');
  return <label {...rest} data-slot="label" class={cn(
    'flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
    props.class,
  )} />;
}
