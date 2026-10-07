// Shared native toggle state and form reset ownership; D19/D90. No headless internals leak.
import { createEffect, createSignal, untrack } from 'solid-js';
import type { JSX } from '@solidjs/web';

export type CheckedState = boolean | 'indeterminate';
export type ToggleProps = Omit<JSX.InputHTMLAttributes<HTMLInputElement>,
  'checked' | 'defaultChecked' | 'type' | 'size' | 'children' | 'role' | 'aria-checked'> & {
  checked?: CheckedState;
  defaultChecked?: CheckedState;
  onCheckedChange?: (checked: CheckedState) => void;
};

/** Invoke Solid's ordinary or data-bound native event handler. */
export function callToggleHandler(handler: ToggleProps['onClick'] | ToggleProps['onChange'], event: Event & {currentTarget: HTMLInputElement; target: Element}) {
  if (Array.isArray(handler)) handler[0](handler[1], event as never);
  else if (typeof handler === 'function') handler(event as never);
}

/** Keep uncontrolled state local; controlled state always comes from the caller. */
export function createNativeToggle(props: ToggleProps) {
  const initial = untrack(() => props.defaultChecked ?? false);
  const [local, setLocal] = createSignal<CheckedState>(initial);
  const [element, setElement] = createSignal<HTMLInputElement | undefined>(undefined, {ownedWrite: true});
  const current = () => props.checked ?? local();
  /** Notify once per actual state change; a controlled caller may reject the request. */
  function request(next: CheckedState) {
    if (next === current()) return;
    if (props.checked === undefined) setLocal(next);
    props.onCheckedChange?.(next);
  }
  /** Restore the actual input after a rejected controlled edit or native form reset. */
  function synchronize(input: HTMLInputElement) {
    input.checked = current() === true;
    input.indeterminate = current() === 'indeterminate';
  }
  /** Capture the native input for form association and forward the public ref. */
  function ref(input: HTMLInputElement) {
    setElement(input);
    if (typeof props.ref === 'function') props.ref(input);
  }
  /** Read-only checkboxes need explicit click cancellation; HTML does not enforce readonly. */
  function onClick(event: MouseEvent & {currentTarget: HTMLInputElement; target: Element}) {
    callToggleHandler(props.onClick, event);
    if (props.readonly) event.preventDefault();
  }
  /** Preserve native change events and synchronize controlled acceptance without another event. */
  function onChange(event: Event & {currentTarget: HTMLInputElement; target: Element}) {
    callToggleHandler(props.onChange, event);
    if (!event.defaultPrevented) request(event.currentTarget.checked);
    synchronize(event.currentTarget);
  }
  createEffect(() => [element(), props.form] as const, ([input]) => {
    const form = input?.form;
    if (!form) return;
    let active = true;
    /** Wait until all reset listeners and the browser default action have finished. */
    function onReset(event: Event) {
      queueMicrotask(() => {
        if (!active || event.defaultPrevented) return;
        request(initial);
        synchronize(input!);
      });
    }
    form.addEventListener('reset', onReset);
    return () => {active = false; form.removeEventListener('reset', onReset);};
  });
  return {current, initial, ref, onClick, onChange};
}
