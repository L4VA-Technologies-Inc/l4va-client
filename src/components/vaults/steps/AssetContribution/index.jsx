import { Public } from '@/components/vaults/steps/AssetContribution/Public';
import { Private } from '@/components/vaults/steps/AssetContribution/Private';
import { SemiPrivate } from '@/components/vaults/steps/AssetContribution/SemiPrivate';
import { VAULT_PRIVACY_TYPES } from '@/components/vaults/constants/vaults.constants';

export const AssetContribution = ({ data, errors = {}, updateField }) => {
  const vaultPrivacy = data.privacy;

  const props = {
    data,
    errors,
    updateField,
  };
  
  if (vaultPrivacy === VAULT_PRIVACY_TYPES.PUBLIC) {
    return <Public {...props} />;
  }

  if (vaultPrivacy === VAULT_PRIVACY_TYPES.PRIVATE) {
    return <Private {...props} />;
  }
  
  if (vaultPrivacy === VAULT_PRIVACY_TYPES.SEMI_PRIVATE) {
    return <SemiPrivate {...props} />;
  }
  
  return <Public {...props} />;
};
