import { Box, Stack, Text } from '@chakra-ui/react';
import { useState } from 'react';
import { ChessBoard } from '../game/ChessBoard';
import { positionOf, randomOpening } from './openings';

/**
 * A board in the position of a well-known opening with its name under it, as the image of the
 * lobby, the sign-in and the registration. Every visit picks another opening at random.
 */
export function HeroBoard() {
  const [opening] = useState(randomOpening);
  const { fen, lastMove } = positionOf(opening);

  return (
    <Stack as="figure" gap="3" align="center">
      <Box aria-hidden>
        <ChessBoard
          id="lobby-board"
          fen={fen}
          size="26rem"
          lastMove={lastMove}
        />
      </Box>
      <Text as="figcaption" fontSize="sm" opacity="0.8">
        {opening.name}
      </Text>
    </Stack>
  );
}
