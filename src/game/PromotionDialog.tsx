import { Button, Dialog, HStack, Portal } from '@chakra-ui/react';
import { defaultPieces } from 'react-chessboard';
import type { Color } from '../api/types/shared';

const PIECES = [
  { letter: 'q', name: 'Queen' },
  { letter: 'r', name: 'Rook' },
  { letter: 'b', name: 'Bishop' },
  { letter: 'n', name: 'Knight' },
];

/** Asks for the piece of a promotion. Closing it without a choice puts the pawn back. */
export function PromotionDialog({
  open,
  color,
  onChoose,
  onCancel,
}: {
  open: boolean;
  color: Color;
  onChoose: (letter: string) => void;
  onCancel: () => void;
}) {
  const prefix = color === 'white' ? 'w' : 'b';
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(details) => !details.open && onCancel()}
      placement="center"
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content rounded="2xl" maxW="sm">
            <Dialog.Header>
              <Dialog.Title>Promote the pawn to</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body pb="6">
              <HStack gap="3" justify="center">
                {PIECES.map(({ letter, name }) => (
                  <Button
                    key={letter}
                    aria-label={name}
                    variant="subtle"
                    boxSize="16"
                    p="1.5"
                    rounded="xl"
                    bg="board.light"
                    onClick={() => onChoose(letter)}
                  >
                    {defaultPieces[`${prefix}${letter.toUpperCase()}`]()}
                  </Button>
                ))}
              </HStack>
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
