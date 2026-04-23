import { createFileRoute } from '@tanstack/react-router';

import { VestingPage } from '@/pages/rewards/VestingPage';

const VestingPageComponent = () => <VestingPage />;

export const Route = createFileRoute('/rewards/vesting')({
  component: VestingPageComponent,
});
