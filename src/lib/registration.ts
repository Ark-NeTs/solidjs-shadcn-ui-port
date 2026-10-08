// Register compound parts without server signal writes; browser registrations stay reactive; D19/D90.
import { createSignal, type Accessor } from 'solid-js';
import { isServer } from '@solidjs/web';
/** SSR registration is render-local metadata; only the browser needs reactive invalidation. */
export function createRegistration<T>(initial: T): readonly [Accessor<T>, (next: T) => void, (update: (current: T) => T) => void] {
  // Box accessors as values: a function initializer becomes a derived hydration source in Solid 2.
  const [current, setCurrent] = createSignal({ value: initial }, { ownedWrite: true });
  if (isServer) {
    let current = initial;
    return [() => current, next => { current = next; }, update => { current = update(current); }];
  }
  // Functional updates read the live registry, avoiding hydration snapshots served by untrack().
  return [() => current().value, next => { setCurrent({ value: next }); }, update => { setCurrent(current => ({ value: update(current.value) })); }];
}
