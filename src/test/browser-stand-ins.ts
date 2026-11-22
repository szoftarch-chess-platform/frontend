// Stand-ins for the browser interfaces that jsdom does not implement. Each one is installed
// only if the interface is missing, so a newer jsdom with its own version wins.

type LockCallback<T> = (lock: Lock | null) => T | Promise<T>;

/**
 * A Web Locks API that keeps exclusive locks in memory. Requests for the same name run one
 * after the other, which is what the token refresh of FE-ADR-5 relies on.
 */
class InMemoryLockManager {
  private readonly tails = new Map<string, Promise<unknown>>();

  request<T>(name: string, callback: LockCallback<T>): Promise<T>;
  request<T>(
    name: string,
    options: LockOptions,
    callback: LockCallback<T>,
  ): Promise<T>;
  request<T>(
    name: string,
    optionsOrCallback: LockOptions | LockCallback<T>,
    maybeCallback?: LockCallback<T>,
  ): Promise<T> {
    const callback =
      typeof optionsOrCallback === 'function'
        ? optionsOrCallback
        : maybeCallback!;
    const lock = { name, mode: 'exclusive' } as Lock;

    const previous = this.tails.get(name) ?? Promise.resolve();
    const result = previous.then(() => callback(lock));
    // The next request waits for this one, whether it succeeds or fails.
    const tail = result.catch(() => undefined);
    this.tails.set(name, tail);
    void tail.then(() => {
      if (this.tails.get(name) === tail) {
        this.tails.delete(name);
      }
    });
    return result;
  }

  query(): Promise<LockManagerSnapshot> {
    return Promise.resolve({ held: [], pending: [] });
  }
}

class NoopResizeObserver {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

export function installBrowserStandIns(): void {
  if (!('locks' in navigator)) {
    Object.defineProperty(navigator, 'locks', {
      configurable: true,
      value: new InMemoryLockManager(),
    });
  }

  if (typeof window.matchMedia !== 'function') {
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: (query: string): MediaQueryList =>
        ({
          matches: false,
          media: query,
          onchange: null,
          addEventListener: () => {},
          removeEventListener: () => {},
          addListener: () => {},
          removeListener: () => {},
          dispatchEvent: () => false,
        }) as MediaQueryList,
    });
  }

  if (typeof window.ResizeObserver !== 'function') {
    Object.defineProperty(window, 'ResizeObserver', {
      configurable: true,
      value: NoopResizeObserver,
    });
  }
}
