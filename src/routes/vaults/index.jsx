import { createFileRoute } from '@tanstack/react-router';

import { CommunityVaultsList } from '@/components/vaults/CommunityVaultsList';

const VaultsComponent = () => <CommunityVaultsList />;

export const Route = createFileRoute('/vaults/')({
  component: VaultsComponent,
});
