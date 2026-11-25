# Frontend tasks after the review of the requests to the other repos

The points of [requests-to-other-repos.md](requests-to-other-repos.md) that belonged to the other repos are done on the `feature/live-game-fixes` branches of the game-service, the infra and the frontend. This list says what is left for the frontend.

## SAN in the move list

ADR-8 now says that the user interface shows the moves in SAN. The contracts still use UCI, and the frontend derives the SAN.

- The replay shows its moves in SAN in the `MoveList` of `src/pages/GameReplayPage.tsx`. The function `positionsOf` of `src/game/rules.ts` already plays the moves with chess.js, and `chess.move` returns the SAN of every move too.
- Decide whether the game page gets a move list too, which FE-ADR-4 rejected because a list in UCI would add little.
- Rewrite FE-ADR-4 together with the change, where it says that ADR-8 rules out SAN and where it describes a list in UCI.
- Delete the point on SAN from the next steps of [README.md](README.md) at the end.

## Optional fix of the finished games

`src/game/GameConnection.tsx` refetches the `['games']` queries right at `gameEnded`, which is usually too early, as the request on a signal that a finished game is stored describes. Until that signal exists, a second refetch with a delay lets the recent games of the lobby show the new game without another visit.
