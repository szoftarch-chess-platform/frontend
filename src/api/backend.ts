/**
 * Everything through which the app reaches the services. The pages see only this type. The
 * clients of the REST API and of the game socket join it in steps 2 and 3.
 */
export type Backend = {
  readonly kind: 'real' | 'fake';
};
