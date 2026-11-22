import { describe, expect, it } from 'vitest';

describe('the Web Locks stand-in', () => {
  it('runs requests for the same name one after the other', async () => {
    const order: string[] = [];

    const first = navigator.locks.request('refresh', async () => {
      order.push('first starts');
      await new Promise((resolve) => setTimeout(resolve, 10));
      order.push('first ends');
    });
    const second = navigator.locks.request('refresh', () => {
      order.push('second');
    });

    await Promise.all([first, second]);
    expect(order).toEqual(['first starts', 'first ends', 'second']);
  });

  it('releases the lock when a callback fails', async () => {
    const failing = navigator.locks.request('refresh', () => {
      throw new Error('refresh failed');
    });
    await expect(failing).rejects.toThrow('refresh failed');

    await expect(
      navigator.locks.request('refresh', () => 'next'),
    ).resolves.toBe('next');
  });

  it('returns the value of the callback', async () => {
    await expect(navigator.locks.request('other', () => 42)).resolves.toBe(42);
  });
});
