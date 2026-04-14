import { createFileRoute } from '@tanstack/react-router';

import { VaultsList } from '@/pages/rewards/VaultsList';

const VaultsListComponent = () => <VaultsList />;

export const Route = createFileRoute('/rewards/vaults/')({
  component: VaultsListComponent,
});
