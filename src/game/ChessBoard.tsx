import { Box } from '@chakra-ui/react';
import type { CSSProperties } from 'react';
import { Chessboard, type ChessboardOptions } from 'react-chessboard';
import type { Color, UciMove } from '../api/types/shared';
import type { Target } from './rules';

type ChessBoardProps = {
  id: string;
  fen: string;
  size: string;
  orientation?: Color;
  lastMove?: UciMove;
  check?: string;
  selected?: string;
  targets?: Target[];
} & Pick<
  ChessboardOptions,
  'canDragPiece' | 'onPieceDrag' | 'onPieceDrop' | 'onSquareClick'
>;

const token = (name: string) => `var(--chakra-colors-${name})`;

const reducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** The board of the app, with the colors and the highlights of the theme. */
export function ChessBoard({
  id,
  fen,
  size,
  orientation = 'white',
  lastMove,
  check,
  selected,
  targets = [],
  ...handlers
}: ChessBoardProps) {
  const styles: Record<string, CSSProperties> = {};
  const add = (square: string, style: CSSProperties) => {
    styles[square] = { ...styles[square], ...style };
  };
  if (lastMove) {
    add(lastMove.slice(0, 2), {
      backgroundColor: token('highlight-last-move'),
    });
    add(lastMove.slice(2, 4), {
      backgroundColor: token('highlight-last-move'),
    });
  }
  if (selected) {
    add(selected, { backgroundColor: token('highlight-selected') });
  }
  if (check) {
    add(check, {
      backgroundImage: `radial-gradient(circle, ${token('highlight-check')} 30%, transparent 75%)`,
    });
  }
  const dot = token('highlight-legal-move');
  const ring = token('highlight-legal-move-ring');
  for (const { square, capture } of targets) {
    add(square, {
      backgroundImage: capture
        ? `radial-gradient(circle, transparent 66%, ${ring} 67%, ${ring} 71%, ${dot} 72%)`
        : `radial-gradient(circle, ${dot} 15%, ${ring} 16%, ${ring} 19%, transparent 20%)`,
    });
  }

  return (
    <Box
      w={{ base: 'full', lg: size }}
      maxW={size}
      rounded="2xl"
      overflow="hidden"
      shadow="2xl"
      outline="6px solid"
      outlineColor="hero.subtle"
    >
      <Chessboard
        options={{
          id,
          position: fen,
          boardOrientation: orientation,
          allowDragging: !!handlers.onPieceDrop,
          allowDrawingArrows: false,
          showAnimations: !reducedMotion(),
          lightSquareStyle: { backgroundColor: token('board-light') },
          darkSquareStyle: { backgroundColor: token('board-dark') },
          lightSquareNotationStyle: { color: token('board-dark') },
          darkSquareNotationStyle: { color: token('board-light') },
          squareStyles: styles,
          ...handlers,
        }}
      />
    </Box>
  );
}
