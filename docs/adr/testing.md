# FE-ADR-8: Tests with Vitest and formatting with Prettier

**Related:** NF-7, ADR-2, [FE-ADR-1](stack.md), [FE-ADR-5](state-management.md), [FE-ADR-7](styling.md), [FE-ADR-9](fake-backends.md)

## Context

The logic of the client, such as the changes of the game state, the clock, the refresh of the tokens and the rules of the forms, needs automated tests, and so do the components. Several people write the code, so it needs one format. The game-service already uses Vitest and Prettier.

## Decision

- The unit and component tests use Vitest with React Testing Library in jsdom.
- A setup file adds the matchers of jest-dom, replaces the browser interfaces that the code uses and jsdom lacks, such as the Web Locks API, and gives a helper that renders a component inside the providers of Chakra, TanStack Query and the router.
- The tests cover the pure logic first, which is the changes of the store, the clock, the HTTP client, the rules of the forms and the page parameter, and then the components.
- Prettier formats the code with the settings of the game-service, and `eslint-config-prettier` turns off the rules of ESLint that conflict with it.
- The scripts are `test`, `test:watch`, `test:cov`, `format` and `format:check`, with the names of the game-service.
- Playwright runs end-to-end tests later, when the first flow works. Two browser contexts play against each other in Chrome, Firefox and Edge (NF-7).

## Rationale

- Vitest uses the configuration of Vite, so TypeScript and the module resolution work without extra setup, and the team already knows it from the game-service.
- The same Prettier settings give the two TypeScript repos one style.
- Playwright drives the browsers of NF-7 and opens several separate contexts in one test, which is what a game between two users needs.

## Rejected alternatives

- **Jest:** it does not read the configuration of Vite and needs its own setup for TypeScript and ES modules.
- **Biome:** one tool for linting and formatting, but it would replace the existing ESLint setup with the rules of the React hooks.
- **Cypress:** one browser tab in a test, so two players in one test are hard.

## Consequences

- Formatting the existing files once adds semicolons to them.
- The CI runs `format:check` next to the lint and the tests.

## Sources

- Vitest: https://vitest.dev/
- React Testing Library: https://testing-library.com/docs/react-testing-library/intro/
- Prettier: https://prettier.io/
- Playwright: https://playwright.dev/
