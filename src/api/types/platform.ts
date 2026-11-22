// Types of the contract platform-service.openapi.yaml 2.0.0 in the infra repo (FE-ADR-10).
// Check this file when the info.version of the contract changes.

import type { Uuid } from './shared';

/** The signed-in user of `GET /api/users/me`. */
export type CurrentUser = {
  id: Uuid;
  userName: string;
};
