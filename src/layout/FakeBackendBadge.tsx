import { Badge } from '@chakra-ui/react';
import { useBackend } from '../api/backend-context';

/** Marks the fake mode, so a screenshot or a demo is not mistaken for the real system. */
export function FakeBackendBadge() {
  const backend = useBackend();
  if (backend.kind !== 'fake') {
    return null;
  }
  return (
    <Badge colorPalette="orange" variant="solid" size="md">
      FAKE BACKEND
    </Badge>
  );
}
