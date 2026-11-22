import type { Backend, BackendOptions } from './backend';

/**
 * Loads the fake backend in the fake mode and the real one everywhere else. Vite replaces the
 * variable with a constant when it builds, and the production build never sets it, so it drops
 * the import of the fakes and they are not part of the bundle.
 */
export async function loadBackend(
  options: BackendOptions = {},
): Promise<Backend> {
  if (import.meta.env.VITE_FAKE_BACKEND === 'true') {
    const fake = await import('./fake');
    return fake.createBackend();
  }
  const real = await import('./real');
  return real.createBackend(options);
}
