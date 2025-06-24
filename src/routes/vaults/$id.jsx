import { createFileRoute, useParams, Navigate } from '@tanstack/react-router';

import { EditVault } from '@/components/vaults/EditVault';
import { VaultProfileView } from '@/components/vault-profile/VaultProfileView';
import { Spinner } from '@/components/Spinner';
import { useVault } from '@/services/api/queries';
import { VAULT_STATUSES } from '@/components/vaults/constants/vaults.constants';

function VaultComponent() {
  const id = useParams({
    from: '/vaults/$id',
    select: params => params.id,
  });

  const { data, isLoading, error } = useVault(id);
  const vault = data?.data;

  if (!id) {
    return <Navigate replace to="/vaults" />;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (error || !vault) {
    return <Navigate replace to="/vaults" />;
  }

  if (vault.vaultStatus === VAULT_STATUSES.DRAFT) {
    return <EditVault vault={vault} />;
  }

  return <VaultProfileView vault={vault} />;
}

export const Route = createFileRoute('/vaults/$id')({
  component: VaultComponent,
});
