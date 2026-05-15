import { createFileRoute } from '@tanstack/react-router';

import { RewardsOverview } from '@/pages/rewards/RewardsOverview';

export const Route = createFileRoute('/rewards/')({
  component: RewardsOverview,
});
