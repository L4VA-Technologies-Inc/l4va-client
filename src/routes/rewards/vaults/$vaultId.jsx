import { createFileRoute } from '@tanstack/react-router';

import { VaultDetails } from '@/pages/rewards/VaultDetails';

export const Route = createFileRoute('/rewards/vaults/$vaultId')({
  component: VaultDetails,
});
