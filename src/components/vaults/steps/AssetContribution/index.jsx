import { Public } from '@/components/vaults/steps/AssetContribution/Public.jsx';
import { Private } from '@/components/vaults/steps/AssetContribution/Private.jsx';
import { VAULT_TYPES } from '@/components/vaults/constants/vaults.constants.js';

export const AssetContribution = ({
  data,
  errors = {},
  updateField,
}) => {
  const vaultPrivacy = data.privacy;

  const props = {
    data,
    errors,
    updateField,
  };

  if (vaultPrivacy === VAULT_TYPES.PRIVATE) {
    return <Private {...props} />;
  }
  return (
    <Public {...props} />
  );
};
