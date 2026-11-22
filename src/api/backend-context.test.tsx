import { render, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useBackend } from './backend-context';
import { BackendProvider } from './BackendProvider';

describe('useBackend', () => {
  it('returns the backend of the provider', () => {
    const backend = { kind: 'fake' } as const;
    const { result } = renderHook(() => useBackend(), {
      wrapper: ({ children }) => (
        <BackendProvider backend={backend}>{children}</BackendProvider>
      ),
    });
    expect(result.current).toBe(backend);
  });

  it('fails outside a provider', () => {
    // React reports the error of the render on the console, which is expected here.
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    function Consumer() {
      useBackend();
      return null;
    }
    expect(() => render(<Consumer />)).toThrow(
      'useBackend must be used inside a BackendProvider.',
    );
    consoleError.mockRestore();
  });
});
