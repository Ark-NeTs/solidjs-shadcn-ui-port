// Vitest setup (D49): register jest-dom matchers, stub the browser APIs jsdom
// omits but Kobalte/corvu touch (corvu's Drawer observes element size via
// ResizeObserver; some primitives probe matchMedia), and auto-unmount Solid
// trees between tests so the jsdom document is clean per test.
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@solidjs/testing-library';
import { afterEach } from 'vitest';

if (!('ResizeObserver' in globalThis)) {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
}

if (!('matchMedia' in globalThis)) {
  globalThis.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener() {},
    removeListener() {},
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent: () => false,
  })) as unknown as typeof matchMedia;
}

afterEach(() => cleanup());
