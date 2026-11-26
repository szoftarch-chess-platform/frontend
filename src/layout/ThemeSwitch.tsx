import { Box, HStack } from '@chakra-ui/react';
import { useState } from 'react';
import {
  applyTheme,
  currentTheme,
  THEMES,
  type ThemeId,
} from '../theme/theme-choice';

// A swatch shows a light and a dark square of its own theme, whichever theme is active, so it
// reads the palettes and not the semantic tokens.
const SQUARES: Record<ThemeId, [light: string, dark: string]> = {
  green: ['brand.100', 'brand.700'],
  brown: ['walnut.100', 'walnut.400'],
};

const cssVar = (token: string) =>
  `var(--chakra-colors-${token.replace('.', '-')})`;

/** A floating pill in the bottom right corner that switches the colors of the app. */
export function ThemeSwitch() {
  const [theme, setTheme] = useState(currentTheme);

  return (
    <HStack
      role="group"
      aria-label="Theme"
      position="fixed"
      bottom="4"
      right="4"
      zIndex="sticky"
      gap="2.5"
      p="2"
      bg="bg"
      rounded="full"
      borderWidth="1px"
      shadow="md"
    >
      {THEMES.map(({ id, label }) => {
        const [light, dark] = SQUARES[id];
        const active = theme === id;
        return (
          <Box
            key={id}
            as="button"
            aria-label={`${label} theme`}
            aria-pressed={active}
            title={`${label} theme`}
            boxSize="7"
            rounded="full"
            cursor="pointer"
            bg={`linear-gradient(135deg, ${cssVar(light)} 50%, ${cssVar(dark)} 50%)`}
            outline="2px solid"
            outlineOffset="2px"
            outlineColor={active ? 'brand.solid' : 'transparent'}
            transition="transform 0.15s, outline-color 0.15s"
            _hover={{ transform: 'scale(1.1)' }}
            _focusVisible={{ outlineColor: 'brand.focusRing' }}
            onClick={() => {
              applyTheme(id);
              setTheme(id);
            }}
          />
        );
      })}
    </HStack>
  );
}
