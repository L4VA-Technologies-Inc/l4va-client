import { VaultList } from './VaultsList';

import { useMyDraftVaults } from '@/services/api/queries';

export const FeaturedVaultsList = ({ className = '' }) => {
  const { data, isLoading, error } = useMyDraftVaults();
  const vaults = data?.data?.items || [];

  return (
    <VaultList
      className={className}
      error={error?.message}
      isLoading={isLoading}
      title="Featured Vaults"
      vaults={vaults}
    />
  );
};
