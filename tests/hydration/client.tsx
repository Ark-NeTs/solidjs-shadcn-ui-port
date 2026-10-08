// Hydrate real SSR markup on demand, exposing disposal without replacing the claimed nodes; D19/D90.
import { hydrate } from '@solidjs/web';
import { HydrationFixture } from './fixture';
import { MinimalTabs, type ProbeMode } from './tabs-minimal';
import { createLoadingRequest, HydrationLoading } from './loading';
import '../../playground/index.css';
const root = document.getElementById('hydration-root')!;
const start = document.getElementById('hydrate') as HTMLButtonElement;
const stop = document.getElementById('dispose') as HTMLButtonElement;
let dispose: (() => void) | undefined;
const loadingRequest = root.dataset.loading ? createLoadingRequest(1) : undefined;
const lateResolve = document.getElementById('resolve-detached');
if (lateResolve && loadingRequest) lateResolve.onclick = () => {
  loadingRequest.resolve();
  lateResolve.dataset.resolved = 'true';
};
start.onclick = () => {
  start.disabled = true;
  dispose = hydrate(() => loadingRequest ? <HydrationLoading request={loadingRequest} native={root.dataset.loading === 'native'}/> : root.dataset.probe ? <MinimalTabs mode={root.dataset.probe as ProbeMode}/> : <HydrationFixture initiallyOpen={root.dataset.open === 'false' ? false : root.dataset.open as 'popover' | 'alert'}/>, root, { renderId: 'acceptance' });
  root.dataset.hydrated = 'true';
  stop.disabled = false;
};
stop.onclick = () => {
  dispose?.();
  root.replaceChildren();
  root.dataset.hydrated = 'disposed';
  stop.disabled = true;
};
start.dataset.ready = 'true';
