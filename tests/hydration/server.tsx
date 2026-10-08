// Render deterministic HTML with hydration markers using the actual Solid server runtime; D19/D90.
import { generateHydrationScript, renderToString } from '@solidjs/web';
import { HydrationFixture } from './fixture';
import { MinimalTabs, type ProbeMode } from './tabs-minimal';
import { createLoadingRequest, HydrationLoading } from './loading';
export { probeModes } from './tabs-minimal';
export const bootstrap = generateHydrationScript();
/** Render one request variant and fail on server render/serialization errors. */
export function renderFixture(initiallyOpen: false | 'popover' | 'alert') {
  return renderToString(() => <HydrationFixture initiallyOpen={initiallyOpen}/>, { renderId: 'acceptance', onError: error => { throw error; } });
}

/** Render the reduced comparison with the same root namespace as its client. */
export function renderTabsProbe(mode: ProbeMode) {
  return renderToString(() => <MinimalTabs mode={mode}/>, { renderId: 'acceptance', onError: error => { throw error; } });
}

/** Emit an actual pending Loading fallback; the browser owns subsequent promise completion. */
export function renderLoading(native = false) {
  return renderToString(() => <HydrationLoading request={createLoadingRequest(1)} native={native}/>, { renderId: 'acceptance', onError: error => { throw error; } });
}
