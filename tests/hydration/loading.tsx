// Real pending SSR Loading boundary with caller-controlled promises and native drafts; D19/D90.
import { createMemo, createSignal, For, Loading, Show, untrack } from 'solid-js';
import { Button } from 'shadcn-solidjs-theme/ui/button';
import { Input } from 'shadcn-solidjs-theme/ui/input';
import { Label } from 'shadcn-solidjs-theme/ui/label';
import { Skeleton } from 'shadcn-solidjs-theme/ui/skeleton';

type LoadingRequest = { id: number; promise: Promise<string>; resolve: () => void };
/** Give each boundary a stable real promise whose completion the browser test controls. */
export function createLoadingRequest(id: number): LoadingRequest {
  let resolve!: (value: string) => void;
  const promise = new Promise<string>(complete => { resolve = complete; });
  return { id, promise, resolve: () => resolve(`Profile ${id} is ready`) };
}
/** Read async data within Loading so Solid owns fallback replacement and disposal. */
function Profile(props: { request: LoadingRequest }) {
  const profile = createMemo(() => props.request.promise);
  return <p data-testid="ready-profile">{profile()}</p>;
}
/** Keep the draft and request controls outside the independently disposable boundary. */
export function HydrationLoading(props: { request: LoadingRequest; native?: boolean }) {
  const first = untrack(() => props.request);
  const [requests, setRequests] = createSignal([first]);
  const [current, setCurrent] = createSignal<LoadingRequest | undefined>(first);
  const [completed, setCompleted] = createSignal<number[]>([]);
  /** Create a fresh owner and request rather than reviving a disposed boundary. */
  function mount() {
    const next = createLoadingRequest(requests().length + 1);
    setRequests([...requests(), next]);setCurrent(next);
  }
  /** Settle removed requests too, making late arrivals directly observable. */
  function complete(request: LoadingRequest) {
    request.resolve();setCompleted([...completed(), request.id]);
  }
  return <main class="mx-auto grid max-w-xl gap-4 p-6">
    <h1>Hydrated Loading boundary</h1>
    <Label for="loading-draft">Profile draft</Label><Input id="loading-draft" defaultValue="Server draft"/>
    <div class="flex flex-wrap gap-2">
      <Button onClick={mount}>Mount next request</Button>
      <Button onClick={() => setCurrent(undefined)}>Unmount profile</Button>
      <For each={requests()}>{request => <Button disabled={completed().includes(request.id)} onClick={() => complete(request)}>Resolve request {request.id}</Button>}</For>
    </div>
    <section aria-label="Profile preview">
      <Show when={current()} keyed fallback={<p>Profile unmounted</p>}>{request =>
        <Loading fallback={<div data-testid="profile-fallback" aria-busy="true">
          <p role="status">Loading profile {request.id}</p>
          {props.native ? <><div data-slot="skeleton" aria-hidden="true"/><div data-slot="skeleton" aria-hidden="true"/></> : <><Skeleton class="h-8 w-32"/><Skeleton class="mt-2 h-4 w-full"/></>}
        </div>}><Profile request={request}/></Loading>
      }</Show>
    </section>
  </main>;
}
