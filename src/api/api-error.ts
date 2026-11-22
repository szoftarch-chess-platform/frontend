import type { FieldErrors, Problem } from './types/platform';

/**
 * An answer of the REST API with an error status. `problem` holds the ProblemDetails of the
 * body when there is one. The 401 of the gateway and its 429 have no body.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly problem?: Problem;

  constructor(status: number, problem?: Problem) {
    super(
      problem?.detail ?? problem?.title ?? `The request failed with ${status}.`,
    );
    this.name = 'ApiError';
    this.status = status;
    this.problem = problem;
  }

  /** The messages by field of a 400 or a 409, or an empty object. */
  get fieldErrors(): FieldErrors {
    const errors = (this.problem as { errors?: unknown } | undefined)?.errors;
    return isFieldErrors(errors) ? errors : {};
  }
}

/** The session has ended, and the user has to sign in again. */
export class SessionExpiredError extends ApiError {
  constructor() {
    super(401);
    this.name = 'SessionExpiredError';
    this.message = 'The session has ended.';
  }
}

function isFieldErrors(value: unknown): value is FieldErrors {
  return (
    typeof value === 'object' &&
    value !== null &&
    Object.values(value).every(
      (messages) =>
        Array.isArray(messages) &&
        messages.every((message) => typeof message === 'string'),
    )
  );
}
