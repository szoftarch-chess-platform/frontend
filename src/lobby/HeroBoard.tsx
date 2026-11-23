import { Box } from '@chakra-ui/react';
import { Chess } from 'chess.js';
import { ChessBoard } from '../game/ChessBoard';

const opening = new Chess();
['e4', 'e5', 'Nf3', 'Nf6', 'Bc4'].forEach((move) => opening.move(move));

/** A board in a real opening position, as the image of the lobby. */
export function HeroBoard() {
  return (
    <Box aria-hidden>
      <ChessBoard
        id="lobby-board"
        fen={opening.fen()}
        size="26rem"
        lastMove="f1c4"
      />
    </Box>
  );
}
