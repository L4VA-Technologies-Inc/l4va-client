import { createFileRoute } from '@tanstack/react-router';

import { RewardsOverview } from '@/pages/rewards/RewardsOverview';

const RewardsComponent = () => <RewardsOverview />;

export const Route = createFileRoute('/rewards')({
  component: RewardsComponent,
});
