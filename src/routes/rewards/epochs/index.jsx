import { createFileRoute } from '@tanstack/react-router';

import { EpochsList } from '@/pages/rewards/EpochsList';

const EpochsListComponent = () => <EpochsList />;

export const Route = createFileRoute('/rewards/epochs/')({
  component: EpochsListComponent,
});
