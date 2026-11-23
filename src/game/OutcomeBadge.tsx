import { Badge } from '@chakra-ui/react';
import { OUTCOME_TEXT, OUTCOME_TOKEN, type Outcome } from './outcome';

/** The outcome of a finished game from the side of the user, such as Won or Draw. */
export function OutcomeBadge({ outcome }: { outcome: Outcome }) {
  return (
    <Badge
      size="lg"
      bg={`outcome.${OUTCOME_TOKEN[outcome]}.bg`}
      color={`outcome.${OUTCOME_TOKEN[outcome]}.fg`}
    >
      {OUTCOME_TEXT[outcome]}
    </Badge>
  );
}
