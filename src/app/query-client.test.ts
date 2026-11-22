import { describe, expect, it } from 'vitest';
import { shouldRetry } from './query-client';

describe('shouldRetry', () => {
  it.each([400, 401, 403, 404, 409, 429, 499])(
    'does not retry an answer with status %i',
    (status) => {
      expect(shouldRetry(0, { status })).toBe(false);
    },
  );

  it.each([500, 502, 503])('retries an answer with status %i', (status) => {
    expect(shouldRetry(0, { status })).toBe(true);
  });

  it('retries an error without a status, such as a lost connection', () => {
    expect(shouldRetry(0, new TypeError('Failed to fetch'))).toBe(true);
    expect(shouldRetry(0, null)).toBe(true);
  });

  it('stops after two retries', () => {
    expect(shouldRetry(1, new Error('down'))).toBe(true);
    expect(shouldRetry(2, new Error('down'))).toBe(false);
  });
});
