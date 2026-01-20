import { createFileRoute } from '@tanstack/react-router';

import { VaultTokensStatistics } from '@/components/vaults/VaultTokensStatistics.jsx';

export const TokensComponent = () => {
  return <VaultTokensStatistics />;
};

export const Route = createFileRoute('/tokens')({
  component: TokensComponent,
});
