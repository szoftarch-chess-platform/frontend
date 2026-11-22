# FE-ADR-6: react-chessboard for the board

**Related:** F-3, F-5, F-6, NF-7, X-5, ADR-1, ADR-8, ADR-9, [FE-ADR-5](state-management.md), [FE-ADR-7](styling.md)

## Context

F-5 asks that the users move their pieces with the cursor and that the board highlights the legal moves of the selected piece, which chess.js gives (ADR-9). The board also has to show the side of the user at the bottom, offer a choice of piece for a promotion, which the contract sends as a move such as `e7e8q` (ADR-8), put back a move that the game-service refuses, and replay a finished game without moves of its own. The images of the services are published, and ADR-9 rejected a library under the GPL for that reason.

## Decision

- The board is react-chessboard 5, which is configured through its `options` property.
- Its position is always set from outside. It shows the FEN of the store, or that FEN with the move that waits for its acknowledgement, so a refused move goes back when the FEN of the store is shown again.
- chess.js gives the legal moves of the selected square, which the board shows as styles of the squares. It also checks a dropped move before the client sends `makeMove`, and it gives the last move and a king in check for their highlights.
- The board shows the color of the user at the bottom.
- The replay of a finished game uses the same board without dragging.
- An own `ChessBoard` component wraps the library, so the rest of the app does not depend on its interface.
- The colors of the squares and the highlights come from the theme (FE-ADR-7).

## Rationale

- It is a React component under the MIT license with dragging, clicking, the orientation, styles for each square and a choice of piece for the promotion.
- A position set from outside fits the game-service as the authority on the game (ADR-1).
- With the wrapper a later change of the library touches one component.
- Colors from the theme let the board follow the display styles of X-5.

## Rejected alternatives

- **cm-chessboard:** MIT and rich in extensions, but not a React component, so it would need an own wrapper around its lifecycle.
- **chessground:** the board of Lichess with the best handling, but it is under the GPL-3.0, which ADR-9 rejected for chessops.
- **An own board:** no dependency, but dragging, the promotion, the animations and the images of the pieces would all be own work.

## Consequences

- Version 5 changed the interface of the library, so older examples on the web do not apply.

## Open questions

- Whether the promotion uses the built-in choice of the library or an own dialog.

## Sources

- react-chessboard: https://github.com/Clariity/react-chessboard
- cm-chessboard: https://github.com/shaack/cm-chessboard
- chessground: https://github.com/lichess-org/chessground
