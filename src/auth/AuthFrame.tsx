import { Box, Heading, Stack, Text } from '@chakra-ui/react';
import type { ReactNode } from 'react';
import { HeroBand } from '../layout/HeroBand';
import { HeroBoard } from '../lobby/HeroBoard';

/**
 * The green band of the sign-in and the registration, with the board of the lobby next to a
 * white card that holds the form. Small screens show only the card.
 */
export function AuthFrame({
  title,
  intro,
  footer,
  children,
}: {
  title: string;
  intro: string;
  footer: ReactNode;
  children: ReactNode;
}) {
  return (
    <HeroBand
      asideWidth="28rem"
      board={
        <Box hideBelow="lg">
          <HeroBoard />
        </Box>
      }
    >
      <Stack gap="6" minW="0">
        <Stack gap="3">
          <Heading as="h1" size="5xl" letterSpacing="tight">
            {title}
          </Heading>
          <Text fontSize="lg" opacity="0.85">
            {intro}
          </Text>
        </Stack>
        <Box
          bg="bg"
          color="fg"
          p={{ base: '5', md: '6' }}
          rounded="2xl"
          shadow="lg"
        >
          {children}
        </Box>
        <Text>{footer}</Text>
      </Stack>
    </HeroBand>
  );
}
