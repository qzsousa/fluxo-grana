import { vi } from "vitest";

// jsdom already provides window, document and localStorage.
// Just guarantee isolation between tests.
beforeEach(() => {
  vi.clearAllMocks();
  window.localStorage.clear();
});
