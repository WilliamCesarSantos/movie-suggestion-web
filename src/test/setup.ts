import "@testing-library/jest-dom/vitest";
import { beforeAll, afterEach, afterAll } from "vitest";
import { server } from "./server";

// Some jsdom + Node version combinations do not expose a usable localStorage.
// Install a tiny in-memory Storage shim so production code that reads/writes
// window.localStorage keeps working inside tests.
function installLocalStorageShim() {
  if (typeof window === "undefined") return;
  if (typeof window.localStorage !== "undefined" && window.localStorage !== null) {
    return;
  }
  const store = new Map<string, string>();
  const shim: Storage = {
    get length() {
      return store.size;
    },
    clear() {
      store.clear();
    },
    getItem(key: string) {
      return store.has(key) ? (store.get(key) as string) : null;
    },
    key(index: number) {
      return Array.from(store.keys())[index] ?? null;
    },
    removeItem(key: string) {
      store.delete(key);
    },
    setItem(key: string, value: string) {
      store.set(key, String(value));
    },
  };
  Object.defineProperty(window, "localStorage", {
    configurable: true,
    value: shim,
  });
}

installLocalStorageShim();

// jsdom has no IntersectionObserver; pages with infinite scroll (CatalogPage) need one.
// Tests that need to trigger intersections stub their own via vi.stubGlobal.
if (typeof globalThis.IntersectionObserver === "undefined") {
  class NoopIntersectionObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  }
  Object.defineProperty(globalThis, "IntersectionObserver", {
    configurable: true,
    writable: true,
    value: NoopIntersectionObserver,
  });
}

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => {
  server.resetHandlers();
  if (typeof window !== "undefined" && window.localStorage) {
    window.localStorage.clear();
  }
});
afterAll(() => server.close());
