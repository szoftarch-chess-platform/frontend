import { useEffect } from 'react';
import { useBackend } from '../api/backend-context';
import { startGameConnection } from './connection';

/** Keeps the socket open while it is mounted. */
export function GameConnection() {
  const { gameSocket } = useBackend();
  useEffect(() => startGameConnection(gameSocket), [gameSocket]);
  return null;
}
