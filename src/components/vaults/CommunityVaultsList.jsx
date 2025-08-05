import { useState } from 'react';

import { VaultList } from '@/components/vaults/VaultsList';
import { useVaults } from '@/services/api/queries';

const VAULT_TABS = {
  CONTRIBUTE: 'Contribute',
  ACQUIRE: 'Acquire',
  UPCOMING: 'Upcoming',
  PAST: 'Past',
};

const TABS = Object.values(VAULT_TABS);

// Map tab names to API filter values
const TAB_TO_FILTER = {
  [VAULT_TABS.ACQUIRE]: 'acquire',
  [VAULT_TABS.CONTRIBUTE]: 'contribution',
  [VAULT_TABS.UPCOMING]: 'published',
  [VAULT_TABS.PAST]: 'locked',
};

export const CommunityVaultsList = ({ className = '' }) => {
  const [activeTab, setActiveTab] = useState(TABS[0]);

  const { data, isLoading, error } = useVaults(TAB_TO_FILTER[activeTab]);

  const vaults = data?.data?.items || [];
  //Test

  return (
    <VaultList
      className={className}
      error={error?.message}
      isLoading={isLoading}
      tabs={TABS}
      title="Community Vaults"
      vaults={vaults}
      onTabChange={setActiveTab}
    />
  );
};
