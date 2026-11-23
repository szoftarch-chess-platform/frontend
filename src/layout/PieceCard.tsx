import { Flex, Heading, Stack, Text } from '@chakra-ui/react';
import type { ReactNode } from 'react';
import { defaultPieces } from 'react-chessboard';

/** A white card with a piece on a square of the board, a title, a line of text and an action. */
export function PieceCard({
  tone,
  piece,
  title,
  text,
  children,
}: {
  tone: 'light' | 'dark';
  piece: string;
  title: ReactNode;
  text: ReactNode;
  children?: ReactNode;
}) {
  return (
    <Flex
      gap="5"
      align="center"
      wrap="wrap"
      bg="bg"
      color="fg"
      p="5"
      rounded="2xl"
      shadow="lg"
    >
      <Flex
        aria-hidden
        boxSize="16"
        p="1.5"
        rounded="xl"
        bg={tone === 'light' ? 'board.light' : 'board.dark'}
      >
        {defaultPieces[piece]()}
      </Flex>
      <Stack gap="1" flex="1" minW="32">
        <Heading as="h2" size="lg">
          {title}
        </Heading>
        <Text color="fg.muted">{text}</Text>
      </Stack>
      {children}
    </Flex>
  );
}
