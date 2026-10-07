// Decorative loading placeholder; the application owns loading state and status text; D19.
import { omit } from 'solid-js';
import type { JSX } from '@solidjs/web';
import { cn } from '../../lib/utils';
export type SkeletonProps = JSX.HTMLAttributes<HTMLDivElement>;
/** Render an assistive-technology-hidden placeholder; pair it with an app-owned status. */
export function Skeleton(props: SkeletonProps) {
  const rest = omit(props, 'class');
  return <div {...rest} data-slot="skeleton" aria-hidden="true" class={cn('animate-pulse rounded-md bg-muted', props.class)} />;
}
