import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';

// The themes of the app (FE-ADR-7). Components use only the semantic tokens below, never raw
// colors. The green theme is the base value of every token, and the brown theme gives a token
// another value under the `_brown` condition, which holds while `<html>` has `data-theme="brown"`.
// After a change of the token names, run `npm run theme:types` to update the TypeScript types.
const config = defineConfig({
  conditions: {
    brown: '&[data-theme=brown], [data-theme=brown] &',
  },
  theme: {
    tokens: {
      colors: {
        // The brand colors of the themes. Palettes with the shades that Chakra expects.
        brand: {
          50: { value: '#eef6ee' },
          100: { value: '#d4e9d3' },
          200: { value: '#a9d3a7' },
          300: { value: '#7dbb7a' },
          400: { value: '#57a353' },
          500: { value: '#3d8a3a' },
          600: { value: '#2f6e2d' },
          700: { value: '#245524' },
          800: { value: '#1a3e1a' },
          900: { value: '#0f2610' },
          950: { value: '#081608' },
        },
        walnut: {
          50: { value: '#f8f1ea' },
          100: { value: '#ecdccb' },
          200: { value: '#d9bb9a' },
          300: { value: '#c39a6c' },
          400: { value: '#ab7c4b' },
          500: { value: '#8f6236' },
          600: { value: '#744d2a' },
          700: { value: '#5c3c21' },
          800: { value: '#432b18' },
          900: { value: '#2c1c10' },
          950: { value: '#1a1009' },
        },
      },
    },
    semanticTokens: {
      colors: {
        // The roles that Chakra components read from the active color palette, so that
        // `colorPalette="brand"` follows the theme on every component.
        brand: {
          solid: {
            value: {
              base: '{colors.brand.600}',
              _brown: '{colors.walnut.600}',
            },
          },
          contrast: { value: 'white' },
          fg: {
            value: {
              base: '{colors.brand.700}',
              _brown: '{colors.walnut.700}',
            },
          },
          muted: {
            value: {
              base: '{colors.brand.100}',
              _brown: '{colors.walnut.100}',
            },
          },
          subtle: {
            value: { base: '{colors.brand.50}', _brown: '{colors.walnut.50}' },
          },
          emphasized: {
            value: {
              base: '{colors.brand.200}',
              _brown: '{colors.walnut.200}',
            },
          },
          focusRing: {
            value: {
              base: '{colors.brand.500}',
              _brown: '{colors.walnut.500}',
            },
          },
        },
        // A palette for actions that cannot be undone, such as resigning.
        danger: {
          solid: { value: '{colors.red.600}' },
          contrast: { value: 'white' },
          fg: { value: '{colors.red.700}' },
          muted: { value: '{colors.red.100}' },
          subtle: { value: '{colors.red.50}' },
          emphasized: { value: '{colors.red.200}' },
          focusRing: { value: '{colors.red.500}' },
        },
        board: {
          light: { value: { base: '#dde8cf', _brown: '#f0d9b5' } },
          dark: { value: { base: '{colors.brand.700}', _brown: '#b58863' } },
        },
        highlight: {
          lastMove: { value: 'rgba(214, 222, 96, 0.7)' },
          selected: { value: 'rgba(214, 222, 96, 0.9)' },
          legalMove: { value: 'rgba(214, 222, 96, 0.95)' },
          legalMoveRing: {
            value: {
              base: 'rgba(8, 22, 8, 0.55)',
              _brown: 'rgba(26, 16, 9, 0.55)',
            },
          },
          check: { value: 'rgba(220, 38, 38, 0.85)' },
        },
        clock: {
          low: { value: '{colors.red.600}' },
          running: {
            bg: {
              value: {
                base: '{colors.brand.700}',
                _brown: '{colors.walnut.700}',
              },
            },
            fg: { value: 'white' },
          },
        },
        // The band at the top of the lobby.
        hero: {
          bg: {
            value: {
              base: '{colors.brand.800}',
              _brown: '{colors.walnut.800}',
            },
          },
          fg: { value: 'white' },
          subtle: { value: '{colors.whiteAlpha.200}' },
        },
        // The result of a finished game from the side of the user.
        outcome: {
          won: {
            bg: { value: '{colors.green.100}' },
            fg: { value: '{colors.green.800}' },
          },
          lost: {
            bg: { value: '{colors.red.100}' },
            fg: { value: '{colors.red.800}' },
          },
          other: {
            bg: { value: '{colors.gray.100}' },
            fg: { value: '{colors.gray.700}' },
          },
        },
      },
    },
  },
});

export const system = createSystem(defaultConfig, config);
