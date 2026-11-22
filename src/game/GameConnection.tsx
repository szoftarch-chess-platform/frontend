import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { useBackend } from '../api/backend-context';
import { startGameConnection } from './connection';

/** Keeps the socket open while it is mounted, and opens the game page when a game starts. */
export function GameConnection() {
  const { gameSocket } = useBackend();
  const navigate = useNavigate();
  // `navigate` changes on every page change, so the connection reads it from a ref.
  const navigateRef = useRef(navigate);
  useEffect(() => {
    navigateRef.current = navigate;
  }, [navigate]);
  useEffect(
    () => startGameConnection(gameSocket, () => navigateRef.current('/game')),
    [gameSocket],
  );
  return null;
}
