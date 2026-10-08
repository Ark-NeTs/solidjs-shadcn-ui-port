// Public-export fixtures for canceled resets and live native form ownership; D19/D90.
import { createSignal, flush, Show } from 'solid-js';
import { Checkbox, type CheckedState } from 'shadcn-solidjs-theme/ui/checkbox';
import { Switch } from 'shadcn-solidjs-theme/ui/switch';
import { Button } from 'shadcn-solidjs-theme/ui/button';

/** Expose native reset, owner changes and disposal without repairing control state. */
export function ToggleForms() {
  const query = new URLSearchParams(location.search);
  const binary = query.has('switch');
  const initial = query.has('mixed') ? 'indeterminate' : true;
  const [owner, setOwner] = createSignal<string | undefined>('first');
  const [mounted, setMounted] = createSignal(true);
  const [cancel, setCancel] = createSignal(true);
  const [requests, setRequests] = createSignal<string[]>([]);
  /** Log public requests, including any erroneous notification after disposal. */
  function record(value: CheckedState) { setRequests([...requests(), String(value)]); }
  /** Dispatch a native reset on an existing form. */
  function reset(id: string) { (document.getElementById(id) as HTMLFormElement).reset(); }
  /** Commit owner changes/disposal before the reset helper's queued task. */
  function resetThen(change: 'owner' | 'unmount') {
    reset('second');
    if (change === 'owner') setOwner('first');
    else setMounted(false);
    flush();
  }
  return <main onReset={event => { if (cancel()) event.preventDefault(); }}>
    <h1>{binary ? 'Switch' : 'Checkbox'} form lifecycle</h1>
    <p>Reset cancellation happens while the event bubbles beyond the form.</p>
    <form id="first" aria-label="First form">
      <Show when={mounted()}>
        <Show when={binary} fallback={<Checkbox aria-label="Preference" name="preference" value="yes" form={owner()} defaultChecked={initial} onCheckedChange={record}/> }>
          <Switch aria-label="Preference" name="preference" value="yes" form={owner()} defaultChecked onCheckedChange={record}/>
        </Show>
      </Show>
    </form>
    <form id="second" aria-label="Second form"/>
    <div class="samples my-6">
      <Button onClick={() => setCancel(!cancel())}>{cancel() ? 'Allow resets' : 'Cancel resets'}</Button>
      <Button type="reset" form="first">Reset first</Button>
      <Button type="reset" form="second">Reset second</Button>
      <Button onClick={() => setOwner('first')}>Own by first</Button>
      <Button onClick={() => setOwner('second')}>Own by second</Button>
      <Button onClick={() => setOwner('missing')}>Detach from forms</Button>
      <Button onClick={() => setOwner(undefined)}>Use ancestor form</Button>
      <Button onClick={() => resetThen('owner')}>Reset second then reassign</Button>
      <Button onClick={() => resetThen('unmount')}>Reset second then unmount</Button>
      <Button onClick={() => setMounted(true)}>Remount</Button>
    </div>
    <p>Requests: <output data-testid="requests">{JSON.stringify(requests())}</output></p>
  </main>;
}
