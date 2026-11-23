import { Button, Dialog, Portal } from '@chakra-ui/react';
import { useState } from 'react';

/** The resign button, which asks once more before the game is given up. */
export function ResignDialog({
  disabled,
  loading,
  onResign,
}: {
  disabled: boolean;
  loading: boolean;
  onResign: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(details) => setOpen(details.open)}
      placement="center"
      role="alertdialog"
    >
      <Dialog.Trigger asChild>
        <Button
          variant="outline"
          rounded="full"
          borderColor="hero.subtle"
          color="hero.fg"
          _hover={{ bg: 'hero.subtle' }}
          disabled={disabled}
          loading={loading}
        >
          Resign
        </Button>
      </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content rounded="2xl" maxW="sm">
            <Dialog.Header>
              <Dialog.Title>Resign this game?</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              The game ends at once and counts as a loss.
            </Dialog.Body>
            <Dialog.Footer>
              <Dialog.ActionTrigger asChild>
                <Button variant="ghost" rounded="full">
                  Keep playing
                </Button>
              </Dialog.ActionTrigger>
              <Button
                colorPalette="danger"
                rounded="full"
                onClick={() => {
                  setOpen(false);
                  onResign();
                }}
              >
                Resign
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
