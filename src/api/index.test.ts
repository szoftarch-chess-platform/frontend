import { afterEach, describe, expect, it, vi } from 'vitest';
import { loadBackend } from './index';

describe('loadBackend', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('loads the fake backend in the fake mode', async () => {
    vi.stubEnv('VITE_FAKE_BACKEND', 'true');
    expect((await loadBackend()).kind).toBe('fake');
  });

  it('loads the real backend without the variable', async () => {
    vi.stubEnv('VITE_FAKE_BACKEND', undefined);
    expect((await loadBackend()).kind).toBe('real');
  });

  it('loads the real backend for any other value', async () => {
    vi.stubEnv('VITE_FAKE_BACKEND', 'false');
    expect((await loadBackend()).kind).toBe('real');
  });
});
