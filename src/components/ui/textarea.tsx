// Owned native textarea with shared shadcn styling and reactive DOM props; D19/D90.
import { omit } from 'solid-js';
import type { JSX } from '@solidjs/web';
import { cn } from '../../lib/utils';

export type TextareaProps = { "data-slot"?: string } & JSX.TextareaHTMLAttributes<HTMLTextAreaElement>;

/** Preserve native textarea semantics, refs and events without a required field provider. */
export function Textarea(props: TextareaProps) {
  const rest = omit(props, 'class');
  return <textarea {...rest} data-slot={props["data-slot"] ?? "textarea"} class={cn(
    'flex field-sizing-content min-h-16 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40',
    props.class,
  )} />;
}
