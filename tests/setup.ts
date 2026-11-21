import '@testing-library/jest-dom';

// In-memory indexedDB shim for JSDOM test environment
if (typeof window !== 'undefined' && !window.indexedDB) {
  (window as any).indexedDB = {
    open: () => ({
      result: {},
      addEventListener: () => {},
      onupgradeneeded: () => {},
      onsuccess: () => {},
      onerror: () => {},
    }),
  };
}

class LocalStorageMock {
  private store = new Map<string, string>();
  get length() {
    return this.store.size;
  }
  clear() {
    this.store.clear();
  }
  getItem(key: string) {
    return this.store.get(key) ?? null;
  }
  setItem(key: string, value: string) {
    this.store.set(key, String(value));
  }
  removeItem(key: string) {
    this.store.delete(key);
  }
  key(index: number) {
    return Array.from(this.store.keys())[index] ?? null;
  }
}

const mockStorage = new LocalStorageMock();
Object.defineProperty(globalThis, 'localStorage', {
  value: mockStorage,
  writable: true,
  configurable: true,
});
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'localStorage', {
    value: mockStorage,
    writable: true,
    configurable: true,
  });
}

