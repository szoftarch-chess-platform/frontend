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

export function validateRegistration(request: RegisterRequest): FieldErrors {
  const errors: FieldErrors = {};
  const add = (field: string, message: string) => {
    (errors[field] ??= []).push(message);
  };

  const { userName, email, password } = request;
  if (userName.length < USER_NAME_MIN || userName.length > USER_NAME_MAX) {
    add(
      'userName',
      `The user name must be ${USER_NAME_MIN} to ${USER_NAME_MAX} characters long.`,
    );
  }
  if (userName !== '' && !USER_NAME_PATTERN.test(userName)) {
    add(
      'userName',
      'The user name may contain only English letters, digits, _ and -.',
    );
  }

  if (email === '') {
    add('email', 'The email address is required.');
  } else if (codePointLength(email) > EMAIL_MAX) {
    add(
      'email',
      `The email address must be at most ${EMAIL_MAX} characters long.`,
    );
  } else if (!EMAIL_PATTERN.test(email)) {
    add('email', 'The email address is not valid.');
  }

  const passwordLength = codePointLength(password);
  if (passwordLength < PASSWORD_MIN) {
    add(
      'password',
      `The password must be at least ${PASSWORD_MIN} characters long.`,
    );
  } else if (passwordLength > PASSWORD_MAX) {
    add(
      'password',
      `The password must be at most ${PASSWORD_MAX} characters long.`,
    );
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
