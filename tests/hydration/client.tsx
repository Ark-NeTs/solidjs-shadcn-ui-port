// Hydrate real SSR markup on demand, exposing disposal without replacing the claimed nodes; D19/D90.
import {AdminMenuHydration} from './admin-menu';
import { hydrate } from '@solidjs/web';
import { HydrationFixture } from './fixture';
import { MinimalTabs, type ProbeMode } from './tabs-minimal';
import { createLoadingRequest, HydrationLoading } from './loading';
import { createErroredRequest, HydrationErrored } from './errored';
import { MinimalRetry, type RetryMode } from './retry-minimal';
import '../../playground/index.css';
const root = document.getElementById('hydration-root')!;
const start = document.getElementById('hydrate') as HTMLButtonElement;
const stop = document.getElementById('dispose') as HTMLButtonElement;
let dispose: (() => void) | undefined;
const loadingRequest = root.dataset.loading ? createLoadingRequest(1) : undefined;
const erroredRequest = root.dataset.errored ? createErroredRequest(1) : undefined;
const lateReject = document.getElementById('reject-detached');
if (lateReject && erroredRequest) lateReject.onclick = () => {
  erroredRequest.reject();
  lateReject.dataset.rejected = 'true';
};
const lateResolve = document.getElementById('resolve-detached');
if (lateResolve && loadingRequest) lateResolve.onclick = () => {
  loadingRequest.resolve();
  lateResolve.dataset.resolved = 'true';
};
/** Select the matching source fixture without evaluating unrelated component trees. */
function renderPage() {
  if (root.dataset.adminMenu) return <AdminMenuHydration/>;
  if (root.dataset.retry) return <MinimalRetry mode={root.dataset.retry as RetryMode}/>;
  if (erroredRequest) return <HydrationErrored request={erroredRequest}/>;
  if (loadingRequest) return <HydrationLoading request={loadingRequest} native={root.dataset.loading === 'native'}/>;
  if (root.dataset.probe) return <MinimalTabs mode={root.dataset.probe as ProbeMode}/>;
  return <HydrationFixture initiallyOpen={root.dataset.open === 'false' ? false : root.dataset.open as 'popover' | 'alert'}/>;
}
start.onclick = () => {
  start.disabled = true;
  dispose = hydrate(renderPage, root, { renderId: 'acceptance' });
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
