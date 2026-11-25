import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { useBackend } from '../api/backend-context';
import { startGameConnection } from './connection';

/**
 * Keeps the socket open while it is mounted, opens the game page when a game starts, and
 * refreshes the finished games when one ends.
 */
export function GameConnection() {
  const { gameSocket } = useBackend();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  // `navigate` changes on every page change, so the connection reads it from a ref.
  const navigateRef = useRef(navigate);
  useEffect(() => {
    navigateRef.current = navigate;
  }, [navigate]);
  useEffect(
    () =>
      startGameConnection(gameSocket, {
        onGameStarted: () => navigateRef.current('/game'),
        onGameEnded: () =>
          void queryClient.invalidateQueries({ queryKey: ['games'] }),
      }),
    [gameSocket, queryClient],
  );
  return null;
}
