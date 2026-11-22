import { Alert } from '@chakra-ui/react';
import { useGameStore } from './store';

export function ConnectionBanner() {
  const connection = useGameStore((store) => store.connection);
  if (connection === 'connected') {
    return null;
  }
  return (
    <Alert.Root status={connection === 'lost' ? 'warning' : 'info'}>
      <Alert.Indicator />
      <Alert.Title>
        {connection === 'lost'
          ? 'Connection lost, reconnecting…'
          : 'Connecting to the game server…'}
      </Alert.Title>
    </Alert.Root>
  );
}
