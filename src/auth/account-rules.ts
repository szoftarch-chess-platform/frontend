import type {
  FieldErrors,
  LoginRequest,
  RegisterRequest,
} from '../api/types/platform';

// The rules of the accounts, which the platform-service checks too. The lengths of the passwords
// and the email addresses count Unicode code points, as the contract and the server do, not the
// UTF-16 units of `string.length`.

const USER_NAME_PATTERN = /^[A-Za-z0-9_-]+$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+$/;

const USER_NAME_MIN = 3;
const USER_NAME_MAX = 20;
const EMAIL_MAX = 254;
const PASSWORD_MIN = 8;
const PASSWORD_MAX = 128;

export function codePointLength(text: string): number {
  return [...text].length;
}

/** One rule of a field, with the text that the form shows for it before and while typing. */
export type Requirement = {
  text: string;
  met: (value: string) => boolean;
};

/**
 * The rules of the registration by field. The form lists them under the fields, and the check
 * before sending refuses a field by the texts of the rules that it breaks.
 */
export const REGISTRATION_RULES: Record<keyof RegisterRequest, Requirement[]> =
  {
    userName: [
      {
        text: `${USER_NAME_MIN} to ${USER_NAME_MAX} characters`,
        met: (value) =>
          value.length >= USER_NAME_MIN && value.length <= USER_NAME_MAX,
      },
      {
        text: 'Only English letters, digits, _ and -',
        met: (value) => USER_NAME_PATTERN.test(value),
      },
    ],
    email: [
      {
        text: 'An address such as name@example.com',
        met: (value) =>
          codePointLength(value) <= EMAIL_MAX && EMAIL_PATTERN.test(value),
      },
    ],
    password: [
      {
        text: `${PASSWORD_MIN} to ${PASSWORD_MAX} characters`,
        met: (value) => {
          const length = codePointLength(value);
          return length >= PASSWORD_MIN && length <= PASSWORD_MAX;
        },
      },
    ],
  };

export function validateRegistration(request: RegisterRequest): FieldErrors {
  const errors: FieldErrors = {};
  for (const field of Object.keys(REGISTRATION_RULES) as Array<
    keyof RegisterRequest
  >) {
    const broken = REGISTRATION_RULES[field]
      .filter((rule) => !rule.met(request[field]))
      .map((rule) => rule.text);
    if (broken.length > 0) {
      errors[field] = broken;
    }
  }
  return errors;
}

export function validateLogin(request: LoginRequest): FieldErrors {
  const errors: FieldErrors = {};
  if (request.userName === '') {
    errors.userName = ['The user name is required.'];
  }
  if (request.password === '') {
    errors.password = ['The password is required.'];
  } else if (codePointLength(request.password) > PASSWORD_MAX) {
    errors.password = [
      `The password must be at most ${PASSWORD_MAX} characters long.`,
    ];
  }
  return errors;
}

export function hasErrors(errors: FieldErrors): boolean {
  return Object.keys(errors).length > 0;
}
