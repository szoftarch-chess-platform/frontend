// The theme that the user picked, kept in the browser across visits. The theme is the
// `data-theme` attribute of `<html>`, which the conditions of the tokens in `index.ts` read.

export const THEMES = [
  { id: 'green', label: 'Green' },
  { id: 'brown', label: 'Brown' },
] as const;

export type ThemeId = (typeof THEMES)[number]['id'];

const STORAGE_KEY = 'theme';

function isThemeId(value: unknown): value is ThemeId {
  return THEMES.some((theme) => theme.id === value);
}

/** The saved theme, or green when none is saved or the storage is blocked. */
export function savedTheme(): ThemeId {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return isThemeId(value) ? value : 'green';
  } catch {
    return 'green';
  }
}

export function currentTheme(): ThemeId {
  const value = document.documentElement.dataset.theme;
  return isThemeId(value) ? value : 'green';
}

/** Shows the theme at once and saves it for the next visit. */
export function applyTheme(theme: ThemeId, save = true) {
  document.documentElement.dataset.theme = theme;
  if (!save) {
    return;
  }
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Without storage the theme still holds until the page is closed.
  }
}
