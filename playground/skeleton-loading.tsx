// Real Solid 2 async-boundary lifecycle through public component exports; D19/D90.
import { createMemo, createSignal, For, Loading, Show } from 'solid-js';
import { Skeleton } from 'shadcn-solidjs-theme/ui/skeleton';
import { Button } from 'shadcn-solidjs-theme/ui/button';
import { Input } from 'shadcn-solidjs-theme/ui/input';
import { Label } from 'shadcn-solidjs-theme/ui/label';

type Request = { id: number; promise: Promise<string>; resolve: () => void };
/** Hold a real promise until the example's explicit completion action. */
function createRequest(id: number): Request {
  let complete!: (value: string) => void;
  const promise = new Promise<string>(resolve => { complete = resolve; });
  return { id, promise, resolve: () => complete(`Profile ${id} is ready`) };
}
/** Read the asynchronous memo only underneath Loading. */
function Profile(props: { request: Request }) {
  const value = createMemo(() => props.request.promise);
  return <p data-testid="ready-profile">{value()}</p>;
}
/** Keep the request controls and editable shell alive while the async slot changes. */
export function SkeletonLoading() {
  const first = createRequest(1);
  const [requests, setRequests] = createSignal([first]);
  const [current, setCurrent] = createSignal<Request | undefined>(first);
  const [completed, setCompleted] = createSignal<number[]>([]);
  const dark = new URLSearchParams(location.search).has('dark');
  /** Mount a fresh boundary with its own unresolved request. */
  function mount() {
    const request = createRequest(requests().length + 1);
    setRequests([...requests(), request]);
    setCurrent(request);
  }
  /** Settle even detached requests so late completion can be inspected. */
  function complete(request: Request) {
    request.resolve();
    setCompleted([...completed(), request.id]);
  }
  return <main class={dark ? 'dark bg-background text-foreground' : undefined}>
    <h1 class="mb-6 text-xl font-semibold">Skeleton async lifecycle</h1>
    <div class="mb-6 space-y-2"><Label for="profile-draft">Profile draft</Label><Input id="profile-draft" defaultValue="Keep this draft" /></div>
    <div class="mb-6 flex flex-wrap gap-3">
      <Button onClick={mount}>Mount next request</Button>
      <Button variant="outline" onClick={() => setCurrent(undefined)}>Unmount profile</Button>
      <For each={requests()}>{request => <Button variant="outline" disabled={completed().includes(request.id)} onClick={() => complete(request)}>Resolve request {request.id}</Button>}</For>
    </div>
    <section aria-label="Profile preview" class="rounded-lg border p-4">
      <Show when={current()} keyed fallback={<p>Profile unmounted</p>}>{request =>
        <Loading fallback={<div data-testid="profile-fallback" aria-busy="true">
          <p role="status">Loading profile {request.id}</p>
          <div class="mt-3 space-y-3"><Skeleton class="size-12 rounded-full"/><Skeleton class="h-4 w-full max-w-80"/><Skeleton class="h-4 w-1/2"/></div>
        </div>}><Profile request={request}/></Loading>
      }</Show>
    </section>
  </main>;
}
