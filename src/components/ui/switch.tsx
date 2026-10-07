// Native binary switch with Kobalte evaluated first and sibling sizes/styles; D19/D90.
import { merge, omit } from 'solid-js';
import { cn } from '../../lib/utils';
import { createNativeToggle, type CheckedState, type ToggleProps } from '../../lib/toggle';
export type SwitchProps = Omit<ToggleProps, 'checked' | 'defaultChecked' | 'onCheckedChange'> & {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  size?: 'sm' | 'default';
};

/** Present a native checkbox as a switch, keeping one focus target and real form participation. */
export function Switch(props: SwitchProps) {
  const toggle = createNativeToggle(merge(omit(props, 'onCheckedChange'), {onCheckedChange: (value: CheckedState) => props.onCheckedChange?.(value === true)}));
  const rest = omit(props, 'class', 'ref', 'checked', 'defaultChecked', 'onCheckedChange', 'onClick', 'onChange', 'size');
  return <span class="relative inline-flex shrink-0 align-middle group/switch" data-size={props.size ?? 'default'}>
    <input {...rest} ref={element => toggle.ref(element)} type="checkbox" role="switch" data-slot="switch" data-size={props.size ?? 'default'}
      checked={toggle.current() === true} defaultChecked={toggle.initial === true}
      aria-checked={toggle.current() === true ? 'true' : 'false'} aria-readonly={props.readonly ? 'true' : undefined}
      data-state={toggle.current() ? 'checked' : 'unchecked'}
      data-checked={toggle.current() ? '' : undefined} data-unchecked={!toggle.current() ? '' : undefined}
      data-disabled={props.disabled ? '' : undefined} onClick={toggle.onClick} onChange={toggle.onChange}
      class={cn('peer group/switch relative inline-flex shrink-0 items-center rounded-full border border-transparent transition-all outline-none after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-[size=default]:h-[18.4px] data-[size=default]:w-[32px] data-[size=sm]:h-[14px] data-[size=sm]:w-[24px] dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 data-checked:bg-primary data-unchecked:bg-input dark:data-unchecked:bg-input/80 data-disabled:cursor-not-allowed data-disabled:opacity-50', 'appearance-none cursor-pointer', props.class)} />
    <span data-slot="switch-thumb" aria-hidden="true" data-checked={toggle.current() ? '' : undefined} data-unchecked={!toggle.current() ? '' : undefined}
      class={cn('pointer-events-none block rounded-full bg-background ring-0 transition-transform group-data-[size=default]/switch:size-4 group-data-[size=sm]/switch:size-3 group-data-[size=default]/switch:data-checked:translate-x-[calc(100%-2px)] group-data-[size=sm]/switch:data-checked:translate-x-[calc(100%-2px)] dark:data-checked:bg-primary-foreground group-data-[size=default]/switch:data-unchecked:translate-x-0 group-data-[size=sm]/switch:data-unchecked:translate-x-0 dark:data-unchecked:bg-foreground', 'absolute start-px top-1/2 -translate-y-1/2 rtl:group-data-[size=default]/switch:data-checked:-translate-x-[calc(100%-2px)] rtl:group-data-[size=sm]/switch:data-checked:-translate-x-[calc(100%-2px)]')} />
  </span>;
}
