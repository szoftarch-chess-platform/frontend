import { Box } from '@chakra-ui/react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';

const opening = new Chess();
['e4', 'e5', 'Nf3', 'Nf6', 'Bc4'].forEach((move) => opening.move(move));
const lastMove = {
  backgroundColor: 'var(--chakra-colors-highlight-last-move)',
};

/** A board in a real opening position, as the image of the lobby. */
export function HeroBoard() {
  return (
    <Box
      aria-hidden
      w={{ base: 'full', lg: '26rem' }}
      maxW="26rem"
      rounded="2xl"
      overflow="hidden"
      shadow="2xl"
      outline="6px solid"
      outlineColor="hero.subtle"
    >
      <Chessboard
        options={{
          id: 'lobby-board',
          position: opening.fen(),
          allowDragging: false,
          allowDrawingArrows: false,
          showAnimations: false,
          lightSquareStyle: {
            backgroundColor: 'var(--chakra-colors-board-light)',
          },
          darkSquareStyle: {
            backgroundColor: 'var(--chakra-colors-board-dark)',
          },
          lightSquareNotationStyle: {
            color: 'var(--chakra-colors-board-dark)',
          },
          darkSquareNotationStyle: {
            color: 'var(--chakra-colors-board-light)',
          },
          squareStyles: { f1: lastMove, c4: lastMove },
        }}
      />
    </Box>
  );
}
