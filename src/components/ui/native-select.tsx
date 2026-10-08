// Native select, option and optgroup preserve browser form semantics; D19/D90.
import { omit } from 'solid-js';
import type { JSX } from '@solidjs/web';
import { cn } from '../../lib/utils';
export type NativeSelectProps = Omit<JSX.SelectHTMLAttributes<HTMLSelectElement>,'size'> & {size?: 'sm'|'default'};
/** Style a native single or multiple select without replacing its form behavior. */
export function NativeSelect(props: NativeSelectProps) {
 const rest=omit(props,'class','size');
 return <div data-slot="native-select-wrapper" data-size={props.size ?? 'default'} class={cn('group/native-select relative w-fit has-[select:disabled]:opacity-50',props.class)}><select {...rest} data-slot="native-select" data-size={props.size ?? 'default'} class="h-8 w-full min-w-0 appearance-none rounded-lg border border-input bg-transparent py-1 pe-8 ps-2.5 text-sm transition-colors outline-none select-none selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-[size=sm]:h-7 data-[size=sm]:rounded-[min(var(--radius-md),10px)] data-[size=sm]:py-0.5 dark:bg-input/30 dark:hover:bg-input/50 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40"/><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" data-slot="native-select-icon" class="pointer-events-none absolute top-1/2 end-2.5 size-4 -translate-y-1/2 text-muted-foreground"><path d="m6 9 6 6 6-6"/></svg></div>;
}
/** Preserve native option selection, disabled state and system popup colors. */
export function NativeSelectOption(props: JSX.OptionHTMLAttributes<HTMLOptionElement>) {
 const rest=omit(props,'class');return <option {...rest} data-slot="native-select-option" class={cn('bg-[Canvas] text-[CanvasText]',props.class)}/>;
}
/** Group native options without inventing a second listbox. */
export function NativeSelectOptGroup(props: JSX.OptgroupHTMLAttributes<HTMLOptGroupElement>) {
 const rest=omit(props,'class');return <optgroup {...rest} data-slot="native-select-optgroup" class={cn('bg-[Canvas] text-[CanvasText]',props.class)}/>;
}
