// Release every mounted owner and fail on Solid/browser diagnostics; D19.
import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach, expect, vi } from 'vitest';
import { cleanup } from '@solidjs/testing-library';
let warnings: ReturnType<typeof vi.spyOn>;
let errors: ReturnType<typeof vi.spyOn>;
beforeEach(() => { warnings = vi.spyOn(console, 'warn'); errors = vi.spyOn(console, 'error'); });
afterEach(() => { cleanup(); expect(warnings).not.toHaveBeenCalled(); expect(errors).not.toHaveBeenCalled(); vi.restoreAllMocks(); });
