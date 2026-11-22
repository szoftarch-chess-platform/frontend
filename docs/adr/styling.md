# FE-ADR-7: Chakra UI for the components and the themes

**Related:** NF-2, NF-7, X-5, [FE-ADR-6](chessboard.md), [FE-ADR-8](testing.md)

## Context

The pages need forms, buttons, dialogs, notifications, tables and loading states with a unified look (NF-2). X-5 may later offer several display styles of the board and the pieces, so changing the colors of the app has to be easy.

## Decision

- The components and the styling come from Chakra UI 3.
- The theme is one system made with `createSystem` in `src/theme/`. It defines the tokens, such as colors, fonts and radii, and the semantic tokens that the components use, such as the colors of the squares, of the highlights and of a clock that runs low.
- The components use only semantic tokens and no raw color values. A new theme gives the semantic tokens new values.
- The board is not a Chakra component, so its colors read the CSS variables that Chakra creates for the semantic tokens.
- The colors of the squares are the one distinctive element of the app's look. The lobby opens with a deep green band that shows a read-only board of react-chessboard in an opening position, its two choices carry a light and a dark square, and the logo is four squares. The rest stays quiet, with rounded surfaces, pill buttons and the system fonts.
- Pieces are always the SVG pieces of react-chessboard, never the chess symbols of Unicode.
- The parts that Chakra 3 ships as snippets, such as the toaster and the password field, are copied into `src/components/ui/` with its CLI.
- The types of the own tokens are generated with the typegen command of the Chakra CLI.

## Rationale

- The team asked for unified styling and for themes that are easy to change.
- The chess symbols of Unicode are drawn by whatever font the system has, so their shape and even their fill differ between the platforms, while the SVG pieces look the same everywhere.
- Semantic tokens give every color one name and one place, so a theme is a set of values, and the board follows it through the CSS variables.
- Chakra ships accessible forms, dialogs, notifications and tables, so the pages do not build them.
- It is under the MIT license.

## Rejected alternatives

- **CSS Modules:** no dependency, but every component and the unified look would be own work.
- **Tailwind CSS:** fast for layouts, but it has no components, and its long class lists are a syntax of its own.
- **Mantine or MUI:** complete component libraries too, but the team chose Chakra.

## Consequences

- Most guides on the web describe Chakra 2. Version 3 uses `createSystem` instead of `extendTheme`, needs no framer-motion, and ships some parts as snippets.
- The tests render the components inside the provider of Chakra (FE-ADR-8).
- Chakra uses Emotion, which adds its runtime to the bundle.

## Sources

- Chakra UI installation: https://chakra-ui.com/docs/get-started/installation
- Chakra UI semantic tokens: https://chakra-ui.com/docs/theming/semantic-tokens
- Chakra UI CLI: https://chakra-ui.com/docs/get-started/cli
