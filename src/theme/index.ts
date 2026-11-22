import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';

// The theme of the app (FE-ADR-7). Components use only the semantic tokens below, never raw
// colors, so another theme only gives these tokens other values. After a change of the token
// names, run `npm run theme:types` to update the TypeScript types of the tokens.
const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        // The brand color of the app. A palette with the shades that Chakra expects, so that
        // `colorPalette="brand"` works on every component.
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
      },
    },
    semanticTokens: {
      colors: {
        // The roles that Chakra components read from the active color palette.
        brand: {
          solid: { value: '{colors.brand.600}' },
          contrast: { value: 'white' },
          fg: { value: '{colors.brand.700}' },
          muted: { value: '{colors.brand.100}' },
          subtle: { value: '{colors.brand.50}' },
          emphasized: { value: '{colors.brand.200}' },
          focusRing: { value: '{colors.brand.500}' },
        },
        // The squares of the board. The board is not a Chakra component, so it reads these
        // through their CSS variables (FE-ADR-6).
        board: {
          light: { value: '#f0d9b5' },
          dark: { value: '#b58863' },
        },
        // The marks on the board.
        highlight: {
          legalMove: { value: 'rgba(20, 85, 30, 0.5)' },
          lastMove: { value: 'rgba(155, 199, 0, 0.41)' },
          check: { value: 'rgba(220, 38, 38, 0.6)' },
          selected: { value: 'rgba(20, 85, 30, 0.35)' },
        },
        // The clocks of a live game.
        clock: {
          running: { value: '{colors.fg}' },
          idle: { value: '{colors.fg.muted}' },
          low: { value: '{colors.red.600}' },
        },
      },
    },
  },
});

export const system = createSystem(defaultConfig, config);
