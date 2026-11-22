import { describe, expect, it } from 'vitest';
import { ApiError, SessionExpiredError } from './api-error';

describe('ApiError', () => {
  it('takes its message from the detail, then the title, then the status', () => {
    expect(
      new ApiError(409, { title: 'Conflict', detail: 'Taken.' }).message,
    ).toBe('Taken.');
    expect(new ApiError(404, { title: 'Not Found' }).message).toBe('Not Found');
    expect(new ApiError(429).message).toBe('The request failed with 429.');
  });

  it('gives no field errors when the problem has none', () => {
    expect(new ApiError(500, { title: 'Error' }).fieldErrors).toEqual({});
    expect(new ApiError(401).fieldErrors).toEqual({});
  });

  it('ignores field errors of an unexpected shape', () => {
    const problem = { errors: { userName: 'not a list' } };
    expect(new ApiError(400, problem as never).fieldErrors).toEqual({});
  });

  it('marks an ended session as a 401', () => {
    const error = new SessionExpiredError();
    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(401);
  });
});
