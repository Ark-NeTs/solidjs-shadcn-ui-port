// Reusable controlled state and typed native handler composition; D19/D90.
import { createMemo, createSignal, untrack } from 'solid-js';
import type { JSX } from '@solidjs/web';
/** Keep one uncontrolled value; controlled callers retain authority over requests. */
export function createControllable<T>(value: () => T | undefined, initial: () => T, change: (value: T) => void) {
  const [local, setLocal] = createSignal<T>(() => untrack(initial));
  const current = createMemo(() => value() ?? local());
  return [current, (next: T) => {if (next === current()) return; if (value() === undefined) setLocal(() => next); change(next);}] as const;
}
/** Preserve native and data-bound handlers before internal behavior. */
export function callHandler<T extends HTMLElement, E extends Event>(handler: JSX.EventHandlerUnion<T, E> | undefined, event: E & {currentTarget: T; target: Element}) {
  if (Array.isArray(handler)) handler[0](handler[1], event);
  else if (typeof handler === 'function') handler(event);
}
