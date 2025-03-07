import { Public } from '@/components/vaults/steps/AssetContributon/Public.jsx';
import { Private } from '@/components/vaults/steps/AssetContributon/Private.jsx';

export const AssetContribution = ({
  data,
  errors = {},
  updateField,
}) => {
  const vaultPrivacy = data.privacy;
  console.log(vaultPrivacy);
  return (
    <Private data={data} errors={errors} updateField={updateField} />
  );
};
