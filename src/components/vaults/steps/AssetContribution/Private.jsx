import { LavaRadio } from '@/components/shared/LavaRadio';
import { LavaDatePicker } from '@/components/shared/LavaDatePicker';
import { LavaWhitelist } from '@/components/shared/LavaWhitelist';
import { LavaWhitelistWithCaps } from '@/components/shared/LavaWhitelistWithCaps';
import { LavaSelect } from '@/components/shared/LavaSelect';
import { LavaInput } from '@/components/shared/LavaInput';
import { LavaIntervalPicker } from '@/components/shared/LavaIntervalPicker';

import { handleNumberInput } from '@/utils/core.utils';

import { VAULT_PRIVACY_TYPES } from '@/components/vaults/constants/vaults.constants';


export const Private = ({
  data,
  errors = {},
  updateField,
}) => {
  const { valuationType, privacy: vaultPrivacy } = data;

  const valuationOptions = vaultPrivacy === VAULT_PRIVACY_TYPES.PRIVATE ? [
    {
      name: 'lbe',
      label: 'LBE (Liquidity Bootstrapping Event)',
    },
    {
      name: 'fixed',
      label: 'Fixed',
    },
  ] : [{ name: 'lbe', label: 'LBE (Liquidity Bootstrapping Event)' }];

  return (
    <div className="grid grid-cols-2">
      <div className="px-[36px]">
        <div>
          <LavaRadio
            label="*Valuation type"
            name="valuationType"
            options={valuationOptions}
            value={data.valuationType || ''}
            onChange={(value) => updateField('valuationType', value)}
          />
          {errors.valuationType && (
            <p className="text-main-red mt-1">{errors.valuationType}</p>
          )}
        </div>
        {valuationType === 'fixed' && (
          <>
            <div className="mt-[60px]">
              <LavaSelect
                required
                error={errors.valuationCurrency}
                label="Valuation Currency"
                options={[
                  { id: 'ADA', label: 'ADA' },
                  { id: 'USD', label: 'USD' },
                ]}
                placeholder="Select currency"
                value={data.valuationCurrency || ''}
                onChange={(value) => updateField('valuationCurrency', value)}
              />
            </div>
            <div className="mt-[60px]">
              <LavaInput
                required
                error={errors.valuationAmount}
                label="Valuation Amount"
                placeholder="#,###,###"
                type="text"
                value={data.valuationAmount || ''}
                onChange={(e) => {
                  const sanitizedValue = handleNumberInput(e.target.value);
                  updateField('valuationAmount', sanitizedValue);
                }}
              />
            </div>
          </>
        )}
        <div className="mt-[60px]">
          <div className="uppercase text-[20px] font-bold">
            *Contribution duration
          </div>
          <div className="mt-4">
            <LavaIntervalPicker
              value={data.contributionDuration}
              onChange={(value) => updateField('contributionDuration', value)}
            />
            {errors.contributionDuration && (
              <p className="text-main-red mt-1">{errors.contributionDuration}</p>
            )}
          </div>
        </div>
        <div className="mt-[60px]">
          <LavaRadio
            label="*Contribution window open type"
            name="contributionOpenWindowType"
            options={[
              {
                name: 'upon-vault-launch',
                label: 'Upon Vault Launch',
              },
              {
                name: 'custom',
                label: 'Custom',
              },
            ]}
            value={data.contributionOpenWindowType || ''}
            onChange={(value) => updateField('contributionOpenWindowType', value)}
          />
          {errors.contributionOpenWindowType && (
            <p className="text-main-red mt-1">{errors.contributionOpenWindowType}</p>
          )}
          {data.contributionOpenWindowType === 'custom' && (
            <div className="mt-4">
              <LavaDatePicker
                value={data.contributionOpenWindowTime}
                onChange={(date) => updateField('contributionOpenWindowTime', date)}
              />
              {errors.contributionOpenWindowTime && (
                <p className="text-main-red mt-1">{errors.contributionOpenWindowTime}</p>
              )}
            </div>
          )}
        </div>
        {valuationType === 'lbe' ? (
          <div className="mt-[60px]">
            <LavaWhitelist
              label="Contributor Whitelist"
              setWhitelist={(assets) => updateField('whitelistContributors', assets)}
              whitelist={data.whitelistContributors || []}
            />
            {errors.whitelistContributors && (
              <p className="text-main-red mt-1">{errors.whitelistContributors}</p>
            )}
          </div>
        ) : null}
      </div>
      <div className="px-[36px]">
        <div>
          <LavaWhitelistWithCaps
            required
            label="Asset Whitelist"
            setWhitelist={(assets) => updateField('assetsWhitelist', assets)}
            whitelist={data.assetsWhitelist || []}
          />
          {errors.assetsWhitelist && (
            <p className="text-main-red mt-1">{errors.assetsWhitelist}</p>
          )}
        </div>
      </div>
    </div>
  );
};
