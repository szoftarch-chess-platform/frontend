import { describe, expect, it } from 'vitest';
import {
  codePointLength,
  validateLogin,
  validateRegistration,
} from './account-rules';

const valid = {
  userName: 'alice',
  email: 'alice@example.com',
  password: 'correct horse battery',
};

describe('validateRegistration', () => {
  it('accepts a valid registration', () => {
    expect(validateRegistration(valid)).toEqual({});
  });

  it.each(['al', 'a'.repeat(21), ''])(
    'refuses the user name %j by its length',
    (userName) => {
      expect(validateRegistration({ ...valid, userName }).userName).toEqual([
        'The user name must be 3 to 20 characters long.',
      ]);
    },
  );

  it.each(['al ice', 'alice!', 'álice', 'al.ice'])(
    'refuses the user name %j by its characters',
    (userName) => {
      expect(validateRegistration({ ...valid, userName }).userName).toContain(
        'The user name may contain only English letters, digits, _ and -.',
      );
    },
  );

  it.each(['abc', 'Alice_1', 'a-b', 'a'.repeat(20)])(
    'accepts the user name %j',
    (userName) => {
      expect(validateRegistration({ ...valid, userName })).toEqual({});
    },
  );

  it.each([
    ['', 'The email address is required.'],
    ['alice', 'The email address is not valid.'],
    ['alice @example.com', 'The email address is not valid.'],
    [
      `${'a'.repeat(250)}@x.io`,
      'The email address must be at most 254 characters long.',
    ],
  ])('refuses the email %j', (email, message) => {
    expect(validateRegistration({ ...valid, email }).email).toEqual([message]);
  });

  it('counts the code points of an email address, as the server does', () => {
    // 254 code points, but 2 more UTF-16 units.
    const atTheLimit = `😀😀${'a'.repeat(240)}@example.com`;
    expect(atTheLimit).toHaveLength(256);
    expect(validateRegistration({ ...valid, email: atTheLimit })).toEqual({});
    expect(
      validateRegistration({ ...valid, email: `a${atTheLimit}` }).email,
    ).toEqual(['The email address must be at most 254 characters long.']);
  });

  it('refuses a password shorter than 8 code points', () => {
    expect(
      validateRegistration({ ...valid, password: 'short' }).password,
    ).toEqual(['The password must be at least 8 characters long.']);
  });

  it('refuses a password longer than 128 code points', () => {
    expect(
      validateRegistration({ ...valid, password: 'x'.repeat(129) }).password,
    ).toEqual(['The password must be at most 128 characters long.']);
  });

  it('counts an emoji as one character, as the server does', () => {
    // 7 emojis are 14 UTF-16 units but only 7 code points.
    const password = '😀'.repeat(7);
    expect(password.length).toBe(14);
    expect(validateRegistration({ ...valid, password }).password).toEqual([
      'The password must be at least 8 characters long.',
    ]);
    expect(
      validateRegistration({ ...valid, password: '😀'.repeat(8) }),
    ).toEqual({});
  });

  it('reports every invalid field at once', () => {
    const errors = validateRegistration({
      userName: '',
      email: '',
      password: '',
    });
    expect(Object.keys(errors).sort()).toEqual([
      'email',
      'password',
      'userName',
    ]);
  });
});

describe('validateLogin', () => {
  it('accepts any non-empty user name and password', () => {
    expect(validateLogin({ userName: 'x', password: 'y' })).toEqual({});
  });

  it('requires both fields', () => {
    expect(validateLogin({ userName: '', password: '' })).toEqual({
      userName: ['The user name is required.'],
      password: ['The password is required.'],
    });
  });

  it('refuses a password longer than 128 code points', () => {
    expect(
      validateLogin({ userName: 'alice', password: 'x'.repeat(129) }),
    ).toEqual({
      password: ['The password must be at most 128 characters long.'],
    });
  });
});

describe('codePointLength', () => {
  it('counts code points, not UTF-16 units', () => {
    expect(codePointLength('abc')).toBe(3);
    expect(codePointLength('😀a')).toBe(2);
  });
});
