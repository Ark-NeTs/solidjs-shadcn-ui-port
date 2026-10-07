// Native three-state checkbox with the sibling theme contract; D19/D90.
import { omit, Show } from 'solid-js';
import { cn } from '../../lib/utils';
import { createNativeToggle, type ToggleProps } from '../../lib/toggle';
export type { CheckedState } from '../../lib/toggle';
export type CheckboxProps = ToggleProps;

/** A named native input supplies keyboard, label and form semantics; Solid owns checked state. */
export function Checkbox(props: CheckboxProps) {
  const toggle = createNativeToggle(props);
  const rest = omit(props, 'class', 'ref', 'checked', 'defaultChecked', 'onCheckedChange', 'onClick', 'onChange');
  return <span class="relative inline-flex shrink-0 align-middle">
    <input {...rest} ref={element => toggle.ref(element)} type="checkbox" data-slot="checkbox"
      checked={toggle.current() === true} defaultChecked={toggle.initial === true}
      prop:indeterminate={toggle.current() === 'indeterminate'}
      aria-checked={toggle.current() === 'indeterminate' ? 'mixed' : toggle.current() === true ? 'true' : 'false'}
      aria-readonly={props.readonly ? 'true' : undefined}
      data-state={toggle.current() === 'indeterminate' ? 'indeterminate' : toggle.current() ? 'checked' : 'unchecked'}
      data-checked={toggle.current() === true ? '' : undefined}
      data-indeterminate={toggle.current() === 'indeterminate' ? '' : undefined}
      data-disabled={props.disabled ? '' : undefined}
      onClick={toggle.onClick} onChange={toggle.onChange}
      class={cn('peer relative flex size-4 shrink-0 items-center justify-center rounded-[4px] border border-input transition-colors outline-none group-has-disabled/field:opacity-50 after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 aria-invalid:aria-checked:border-primary dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground dark:data-checked:bg-primary', 'appearance-none data-indeterminate:border-primary data-indeterminate:bg-primary dark:data-indeterminate:bg-primary', props.class)} />
    <Show when={toggle.current() !== false}><span data-slot="checkbox-indicator" aria-hidden="true" class="pointer-events-none absolute inset-0 grid place-content-center text-primary-foreground transition-none [&>svg]:size-3.5"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d={toggle.current() === 'indeterminate' ? 'M5 12h14' : 'm5 12 4 4L19 6'} /></svg></span></Show>
  </span>;
}
