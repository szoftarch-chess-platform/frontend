/**
 * The number of the history page from the `page` query parameter (FE-ADR-4). Anything that is not
 * a whole number of at least 1 counts as the first page.
 */
export function parsePageParam(value: string | null): number {
  if (value === null || !/^\d+$/.test(value)) {
    return 1;
  }
  const page = Number(value);
  return Number.isSafeInteger(page) && page >= 1 ? page : 1;
}
