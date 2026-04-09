import { createFileRoute } from '@tanstack/react-router';

import { EpochDetails } from '@/pages/rewards/EpochDetails';

export const Route = createFileRoute('/rewards/epochs/$id')({
  component: EpochDetails,
});
