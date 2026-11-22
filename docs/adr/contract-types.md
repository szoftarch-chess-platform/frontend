# FE-ADR-10: Hand-written types of the contracts

**Related:** ADR-7, ADR-8, [FE-ADR-9](fake-backends.md)

## Context

The contracts `platform-service.openapi.yaml`, `game-service.asyncapi.yaml` and `shared-schemas.yaml` of the infra repo describe every message of the frontend. ADR-7 lets every repo decide whether it generates types from them. ADR-7 and ADR-8 also ask that a reader ignores unknown fields, treats `null` like a missing field and does not fail on an unknown value of an enum.

## Decision

- The TypeScript types of the contracts are written by hand, one file for each contract in `src/api/types/`.
- Each file names its contract and the `info.version` that it follows in a comment at the top. When the version in the infra repo changes, the file is checked.
- The examples of the contracts are typed constants in the fakes (FE-ADR-9), so an example that does not match its type fails the type check.
- An enum whose unknown values the app must survive, such as the result, the reason of the end and the error codes, also accepts any other string, and the app shows a general text for an unknown value.
- Optional fields are read so that `null` counts as missing.

## Rationale

- The contracts have about 25 small schemas, so the types are quick to write and easy to read, such as the player as a union of the user and the bot.
- No script has to read the sibling repo, and the CI needs no checkout of the infra repo.
- No tool generates the acknowledgements of Socket.IO from the `reply` of AsyncAPI, so the types of the socket would be hand-written anyway.

## Rejected alternatives

- **openapi-typescript for the REST API:** the types always match the contract after a generation, but they are verbose, they depend on the infra checkout, and the shared schemas would exist twice next to the hand-written types of the socket.
- **Modelina for the AsyncAPI document:** its output is harder to read, and it does not understand the acknowledgements.

## Consequences

- Review checks that the types follow the contract, as ADR-7 asks for the code.

## Sources

- openapi-typescript: https://github.com/openapi-ts/openapi-typescript
- AsyncAPI Modelina: https://github.com/asyncapi/modelina
