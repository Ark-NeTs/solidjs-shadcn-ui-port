// Owned native input with shared shadcn styling and reactive DOM props; D19/D90.
import { merge, omit } from 'solid-js';
import { isServer, type JSX } from '@solidjs/web';
import { cn } from '../../lib/utils';

export type InputProps = JSX.InputHTMLAttributes<HTMLInputElement>;

/** Preserve native input semantics, refs and events without a required field provider. */
export function Input(props: InputProps) {
  // Solid rc.13 serializes spread defaultValue as an inert attribute; emit the native SSR value.
  const nativeProps = isServer ? merge(omit(props, 'defaultValue'), { get value() { return props.value ?? props.defaultValue; } }) : props;
  const rest = omit(nativeProps, 'class');
  return <input {...rest} data-slot="input" class={cn(
    'h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40',
    props.class,
  )} />;
}
