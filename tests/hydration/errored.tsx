// Real promise rejection and explicit Errored recovery after pending SSR hydration; D19/D90.
import { createMemo, createSignal, Errored, For, Loading, Show, untrack } from 'solid-js';
import { Button } from 'shadcn-solidjs-theme/ui/button';
import { Input } from 'shadcn-solidjs-theme/ui/input';
import { Label } from 'shadcn-solidjs-theme/ui/label';
import { Skeleton } from 'shadcn-solidjs-theme/ui/skeleton';

type Request = { id: number; promise: Promise<string>; readonly status: 'pending' | 'fulfilled' | 'rejected'; resolve: () => void; reject: () => void };
/** Expose real promise settlement; do not catch or suppress rejected results in the harness. */
export function createErroredRequest(id: number): Request {
  let resolve!: (value: string) => void;let reject!: (reason: Error) => void;
  let status: Request['status'] = 'pending';
  const promise = new Promise<string>((complete, fail) => { resolve = complete;reject = fail; });
  return { id, promise, get status() { return status; },
    resolve() { if (status !== 'pending') return;status = 'fulfilled';resolve(`Profile ${id} is ready`); },
    reject() { if (status !== 'pending') return;status = 'rejected';reject(new Error(`Profile ${id} failed`)); },
  };
}
/** Read the current real promise under both Loading and Errored. */
function Profile(props: { request: Request }) {
  const profile = createMemo(() => props.request.promise);
  return <p data-testid="ready-profile">{profile()}</p>;
}
/** Keep user drafts outside the error/reset scope and make every retry an explicit fresh request. */
export function HydrationErrored(props: { request: Request }) {
  const first = untrack(() => props.request);
  // Fixed settlement controls stay reachable while Solid holds a pending transaction.
  // Four slots let duplicate-retry tests detect an accidental fourth request.
  const requests = [first, ...[2, 3, 4].map(createErroredRequest)];
  let active = first;
  const [current, setCurrent] = createSignal(first);
  const [mounted, setMounted] = createSignal(true);
  const [completed, setCompleted] = createSignal<number[]>([]);
  let draft: HTMLInputElement | undefined;
  /** Replace the active request; older promises remain available to test stale settlement. */
  function start() {
    const next = requests[active.id];
    if (!next) throw new Error('The error recovery fixture has exhausted its request slots');
    active = next;
    setCurrent(next);setMounted(true);
  }
  /** Reset the actual Errored boundary once, then return focus to the preserved draft. */
  function retry(reset: () => void) {
    if (active.status !== 'rejected') return;
    start();reset();draft?.focus();
  }
  /** Settle at most once while retaining controls for detached requests. */
  function settle(request: Request, reject: boolean) {
    if (request.status !== 'pending') return;
    if (reject) request.reject();else request.resolve();
    setCompleted(previous => [...previous, request.id]);
  }
  return <main class="mx-auto grid max-w-xl gap-4 p-6">
    <h1>Hydrated error recovery</h1>
    <Label for="error-draft">Profile draft</Label><Input ref={node => { draft = node; }} id="error-draft" defaultValue="Server draft"/>
    <p>Committed request count: <span data-testid="request-count">{current().id}</span></p>
    <div class="flex flex-wrap gap-2">
      <Button onClick={start}>Start newer request</Button>
      <Button onClick={() => setMounted(false)}>Unmount profile</Button>
      <For each={requests}>{request => <>
        <Button disabled={completed().includes(request.id)} onClick={() => settle(request, false)}>Resolve request {request.id}</Button>
        <Button disabled={completed().includes(request.id)} onClick={() => settle(request, true)}>Reject request {request.id}</Button>
      </>}</For>
    </div>
    <section aria-label="Profile preview">
      <Show when={mounted()} fallback={<p>Profile unmounted</p>}>
        <Errored fallback={(error, reset) => <div data-testid="profile-error">
          <p role="alert">{String(error())}. Your draft is preserved. Retry to load this profile.</p>
          <Button onClick={() => retry(reset)}>Retry profile</Button>
        </div>}>
          <Loading fallback={<div data-testid="profile-fallback" aria-busy="true"><p role="status">Loading profile {current().id}</p><Skeleton class="h-8 w-32"/></div>}>
            <Profile request={current()}/>
          </Loading>
        </Errored>
      </Show>
    </section>
  </main>;
}
