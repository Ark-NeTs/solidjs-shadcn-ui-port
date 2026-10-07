// Native decorative/semantic separator with radix-nova utility hooks; D19.
import { omit } from 'solid-js';
import type { JSX } from '@solidjs/web';
import { cn } from '../../lib/utils';
export type SeparatorProps = JSX.HTMLAttributes<HTMLDivElement> & { orientation?: 'horizontal' | 'vertical'; decorative?: boolean };
/** Expose separator semantics only when the caller requests a meaningful boundary. */
export function Separator(props: SeparatorProps) {
  const rest = omit(props, 'class', 'orientation', 'decorative', 'role', 'aria-orientation', 'aria-hidden');
  return <div {...rest} data-slot="separator" role={props.decorative !== false ? 'none' : 'separator'}
    aria-hidden={props.decorative !== false ? 'true' : undefined}
    aria-orientation={props.decorative === false ? (props.orientation ?? 'horizontal') : undefined}
    data-orientation={props.orientation ?? 'horizontal'}
    data-horizontal={props.orientation !== 'vertical' ? '' : undefined} data-vertical={props.orientation === 'vertical' ? '' : undefined}
    class={cn('shrink-0 bg-border data-horizontal:h-px data-horizontal:w-full data-vertical:w-px data-vertical:self-stretch', props.class)} />;
}
