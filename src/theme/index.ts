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
      },
    },
  },
});

export const system = createSystem(defaultConfig, config);
