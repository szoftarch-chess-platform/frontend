import { ApiError } from '../api/api-error';
import type { FieldErrors } from '../api/types/platform';

export type FormErrors = {
  fields: FieldErrors;
  message?: string;
};

// Provisional texts until the team decides them (docs/README.md).
const GENERIC = 'Something went wrong. Try again.';

/**
 * Turns a failed sign-in or registration into texts for the form. Field errors that no field of
 * the form shows, such as `$` for a malformed body, also get a general message, so the user
 * always sees why nothing happened.
 */
export function toFormErrors(
  error: unknown,
  formFields: readonly string[],
): FormErrors {
  if (!(error instanceof ApiError)) {
    return { fields: {}, message: GENERIC };
  }

  const fields = error.fieldErrors;
  if (formFields.some((field) => fields[field]?.length)) {
    return { fields };
  }
  if (error.status === 401) {
    return { fields, message: 'The user name or the password is wrong.' };
  }
  if (error.status === 429) {
    return {
      fields,
      message: 'Too many attempts. Wait a moment and try again.',
    };
  }
  return { fields, message: error.problem?.detail ?? GENERIC };
}
