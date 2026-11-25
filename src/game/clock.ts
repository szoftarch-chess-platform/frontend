import type { Clock } from '../api/types/game';
import type { Color } from '../api/types/shared';

export const LOW_MS = 30_000;
const TENTHS_MS = 10_000;

/** The time left of a color, counted down from the arrival for the running side. */
export function remainingMs(
  clock: Clock,
  color: Color,
  clockAt: number,
  now: number,
): number | undefined {
  const ms = color === 'white' ? clock.whiteMs : clock.blackMs;
  if (ms === undefined) {
    return undefined;
  }
  if (clock.running !== color) {
    return ms;
  }
  return Math.max(0, ms - Math.max(0, now - clockAt));
}

/** `m:ss`, and seconds with tenths under 10 seconds. */
export function formatClock(ms: number): string {
  if (ms < TENTHS_MS) {
    return (Math.floor(ms / 100) / 10).toFixed(1);
  }
  const seconds = Math.floor(ms / 1000);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}
