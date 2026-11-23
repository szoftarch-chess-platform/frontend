import { describe, expect, it } from 'vitest';
import { formatClock, remainingMs } from './clock';

describe('the clock', () => {
  it.each([
    [600000, '10:00'],
    [599999, '9:59'],
    [61000, '1:01'],
    [10000, '0:10'],
    [9999, '9.9'],
    [940, '0.9'],
    [0, '0.0'],
  ])('shows %i ms as %s', (ms, text) => {
    expect(formatClock(ms)).toBe(text);
  });

  it('counts down only the running side, from the arrival, and not below zero', () => {
    const clock = { whiteMs: 5000, blackMs: 7000, running: 'white' as const };
    expect(remainingMs(clock, 'white', 1000, 3000)).toBe(3000);
    expect(remainingMs(clock, 'black', 1000, 3000)).toBe(7000);
    expect(remainingMs(clock, 'white', 1000, 99000)).toBe(0);
    expect(remainingMs({ blackMs: 7000 }, 'white', 0, 0)).toBeUndefined();
  });
});
