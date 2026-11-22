import { Heading, Stack, Text } from '@chakra-ui/react';
import { useSearchParams } from 'react-router';
import { parsePageParam } from '../routing/page-param';

export function HistoryPage() {
  const [searchParams] = useSearchParams();
  const page = parsePageParam(searchParams.get('page'));

  return (
    <Stack gap="4">
      <Heading as="h1" size="xl">
        History
      </Heading>
      <Text>Page {page}</Text>
      <Text color="fg.muted">The list of finished games comes in step 8.</Text>
    </Stack>
  );
}
