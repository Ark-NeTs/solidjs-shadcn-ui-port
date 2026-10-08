// Owned Progress derives accessible values and visual state without timers or registration; D19/D90.
import { createMemo, omit } from 'solid-js';
import type { JSX } from '@solidjs/web';
import { cn } from '../../lib/utils';

export type ProgressProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, 'children' | 'role' | 'aria-valuenow' | 'aria-valuemin' | 'aria-valuemax' | 'aria-valuetext'> & {
  'aria-valuetext'?: string;
  value?: number | null;
  max?: number;
  getValueLabel?: (value: number, max: number) => string;
};
/** Render owner-supplied progress without inventing elapsed work or changing its value. */
export function Progress(props: ProgressProps) {
  const max = createMemo(() => Number.isFinite(props.max) && props.max! > 0 ? props.max! : 100);
  const value = createMemo(() => {
    const supplied = props.value;
    return typeof supplied === 'number' && Number.isFinite(supplied) && supplied >= 0 && supplied <= max() ? supplied : undefined;
  });
  const state = () => {
    if (value() === undefined) return 'indeterminate';
    return value() === max() ? 'complete' : 'loading';
  };
  const rest = omit(props, 'value', 'max', 'getValueLabel', 'class', 'aria-valuetext');
  /** Prefer explicit value text, then the caller's formatter, then a deterministic percentage. */
  function valueLabel() {
    return props['aria-valuetext'] ?? props.getValueLabel?.(value()!, max()) ?? `${Math.round(value()! / max() * 100)}%`;
  }
  return <div {...rest} role="progressbar" aria-valuemin={0} aria-valuemax={max()}
    aria-valuenow={value()} aria-valuetext={value() === undefined ? undefined : valueLabel()}
    data-slot="progress" data-state={state()}
    class={cn('relative flex h-1 w-full items-center overflow-x-hidden rounded-full bg-muted', props.class)}>
    <div data-slot="progress-indicator" data-state={state()} aria-hidden="true"
      class="h-full shrink-0 bg-primary transition-[width] data-[state=indeterminate]:animate-pulse"
      style={{ width: value() === undefined ? '40%' : `${value()! / max() * 100}%`, 'margin-inline-start': value() === undefined ? '30%' : '0' }} />
  </div>;
}
