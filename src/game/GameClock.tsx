import { Box, Text } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import type { Color } from '../api/types/shared';
import { formatClock, LOW_MS, remainingMs } from './clock';
import { useGameStore } from './store';

const TICK_MS = 100;

/** The clock of one color, counted down locally while it runs. */
export function GameClock({ color }: { color: Color }) {
  const clock = useGameStore((store) => store.game?.clock);
  const clockAt = useGameStore((store) => store.clockAt) ?? 0;
  const running = clock?.running === color;
  const now = useNow(running);

  const ms = clock && remainingMs(clock, color, clockAt, now);
  if (ms === undefined) {
    return <Text color="fg.muted">No clock</Text>;
  }

  const low = ms < LOW_MS;
  return (
    <Box
      px="4"
      py="2"
      rounded="xl"
      minW="24"
      textAlign="center"
      fontSize="2xl"
      fontWeight={running ? 'bold' : 'medium'}
      fontVariantNumeric="tabular-nums"
      bg={running ? (low ? 'clock.low' : 'clock.running.bg') : 'bg.muted'}
      color={running ? 'clock.running.fg' : low ? 'clock.low' : 'fg.muted'}
    >
      {formatClock(ms)}
    </Box>
  );
}

/** The current time, updated several times a second while `ticking`. */
function useNow(ticking: boolean): number {
  const [now, setNow] = useState(() => performance.now());
  useEffect(() => {
    if (!ticking) {
      return;
    }
    const timer = setInterval(() => setNow(performance.now()), TICK_MS);
    return () => clearInterval(timer);
  }, [ticking]);
  return now;
}
