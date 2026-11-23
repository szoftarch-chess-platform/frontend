// Stand-ins for the browser interfaces that jsdom does not implement. Each one is installed
// only if the interface is missing, so a newer jsdom with its own version wins.

type LockCallback<T> = (lock: Lock | null) => T | Promise<T>;

/**
 * A Web Locks API that keeps exclusive locks in memory. Requests for the same name run one
 * after the other. With `ifAvailable`, a request for a name that is held or awaited gets `null`
 * at once instead of waiting, as in the browser.
 */
export class InMemoryLockManager {
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
    const options =
      typeof optionsOrCallback === 'function' ? {} : optionsOrCallback;
    const lock = { name, mode: 'exclusive' } as Lock;

    if (options.ifAvailable && this.tails.has(name)) {
      return Promise.resolve().then(() => callback(null));
    }

    const previous = this.tails.get(name) ?? Promise.resolve();
    const result = previous.then(() => callback(lock));
    const release = () => {
      if (this.tails.get(name) === tail) {
        this.tails.delete(name);
      }
    };
    const tail: Promise<void> = result.then(release, release);
    this.tails.set(name, tail);
    return result;
  }

  query(): Promise<LockManagerSnapshot> {
    return Promise.resolve({ held: [], pending: [] });
  }
}

/**
 * jsdom has no layout, so the board cannot measure its squares for an animation. The tests run
 * as for a user who asks for reduced motion.
 */
function reducedMotionMatchMedia(query: string): MediaQueryList {
  return {
    matches: query.includes('prefers-reduced-motion: reduce'),
    media: query,
    onchange: null,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    addListener: () => undefined,
    removeListener: () => undefined,
    dispatchEvent: () => false,
  };
}

export function installBrowserStandIns(): void {
  if (typeof window.matchMedia !== 'function') {
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: reducedMotionMatchMedia,
    });
  }
  if (!('locks' in navigator)) {
    Object.defineProperty(navigator, 'locks', {
      configurable: true,
      value: new InMemoryLockManager(),
    });
  }
}
