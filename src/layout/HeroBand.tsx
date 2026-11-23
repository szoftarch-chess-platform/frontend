import { Box, Container, Grid } from '@chakra-ui/react';
import type { ReactNode } from 'react';

/**
 * The deep green band at the top of a page, with a board next to its content. With `asideWidth`
 * the content keeps that width, and the board and the content stand in the middle.
 */
export function HeroBand({
  board,
  asideWidth,
  children,
}: {
  board: ReactNode;
  asideWidth?: string;
  children: ReactNode;
}) {
  return (
    <Box
      mx="calc(50% - 50vw)"
      mt="-10"
      py={{ base: '10', lg: '14' }}
      bg="hero.bg"
      color="hero.fg"
    >
      <Container>
        <Grid
          templateColumns={{
            base: '1fr',
            lg: `auto ${asideWidth ?? '1fr'}`,
          }}
          gap={{ base: '10', lg: '14' }}
          alignItems="center"
          justifyContent={asideWidth ? 'center' : undefined}
          maxW={asideWidth ? undefined : '6xl'}
        >
          {board}
          {children}
        </Grid>
      </Container>
    </Box>
  );
}
