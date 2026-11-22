import { describe, expect, it } from 'vitest';
import { parsePageParam } from './page-param';

describe('parsePageParam', () => {
  it.each([
    ['1', 1],
    ['2', 2],
    ['42', 42],
  ])('reads %s as page %i', (value, page) => {
    expect(parsePageParam(value)).toBe(page);
  });

  it.each([
    null,
    '',
    '0',
    '-1',
    '1.5',
    'abc',
    '2abc',
    ' 3',
    '99999999999999999999',
  ])('reads %j as the first page', (value) => {
    expect(parsePageParam(value)).toBe(1);
  });
});
