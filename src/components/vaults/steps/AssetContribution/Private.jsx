import { LavaRadio } from '@/components/shared/LavaRadio';
import { LavaDatePicker } from '@/components/shared/LavaDatePicker';
import { LavaWhitelist } from '@/components/shared/LavaWhitelist';
import { LavaWhitelistWithCaps } from '@/components/shared/LavaWhitelistWithCaps';
import { LavaSelect } from '@/components/shared/LavaSelect';
import { LavaInput } from '@/components/shared/LavaInput';
import { LavaIntervalPicker } from '@/components/shared/LavaIntervalPicker';
import { handleNumberInput } from '@/utils/core.utils';
import {
  VAULT_PRIVACY_TYPES,
  VALUE_METHOD_HINT,
  MIN_CONTRIBUTION_DURATION_MS,
} from '@/components/vaults/constants/vaults.constants';

export const Private = ({ data, errors = {}, updateField }) => {
  const { valueMethod, privacy: vaultPrivacy } = data;

  const valueMethodOptions =
    vaultPrivacy === VAULT_PRIVACY_TYPES.PRIVATE
      ? [
          {
            name: 'lbe',
            label: 'Market / Floor Price',
          },
          {
            name: 'fixed',
            label: 'Fixed',
          },
        ]
      : [{ name: 'lbe', label: 'Market / Floor Price' }];

  return (
    <div className="my-16 grid grid-cols-1 md:grid-cols-2 gap-16">
      <div className="space-y-12">
        <div>
          <LavaRadio
            label="*Vault Value Method"
            name="valueMethod"
            options={valueMethodOptions}
            value={data.valueMethod || ''}
            onChange={value => console.log(value) || updateField('valueMethod', value)}
            hint={VALUE_METHOD_HINT}
          />
          {errors.valueMethod && <p className="text-red-600 mt-1">{errors.valueMethod}</p>}
        </div>
        {valueMethod === 'fixed' && (
          <>
            <div>
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
                onChange={value => updateField('valuationCurrency', value)}
              />
            </div>
            <div>
              <LavaInput
                required
                error={errors.valuationAmount}
                label="Valuation Amount"
                placeholder="#,###,###"
                type="text"
                value={data.valuationAmount || ''}
                onChange={e => {
                  const sanitizedValue = handleNumberInput(e.target.value);
                  updateField('valuationAmount', sanitizedValue);
                }}
              />
            </div>
          </>
        )}
        <div>
          <div className="uppercase font-bold">*Contribution duration</div>
          <div className="mt-4">
            <LavaIntervalPicker
              value={data.contributionDuration}
              onChange={value => updateField('contributionDuration', value)}
              minDays={Math.floor(MIN_CONTRIBUTION_DURATION_MS / (1000 * 60 * 60 * 24))}
            />
            {errors.contributionDuration && <p className="text-red-600 mt-1">{errors.contributionDuration}</p>}
          </div>
        </div>
        <div>
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
            onChange={value => updateField('contributionOpenWindowType', value)}
          />
          {errors.contributionOpenWindowType && (
            <p className="text-red-600 mt-1">{errors.contributionOpenWindowType}</p>
          )}
          {data.contributionOpenWindowType === 'custom' && (
            <div className="mt-4">
              <LavaDatePicker
                value={data.contributionOpenWindowTime}
                onChange={date => updateField('contributionOpenWindowTime', date)}
              />
              {errors.contributionOpenWindowTime && (
                <p className="text-red-600 mt-1">{errors.contributionOpenWindowTime}</p>
              )}
            </div>
          )}
        </div>
        {valueMethod === 'lbe' ? (
          <div>
            <LavaWhitelist
              required
              itemPlaceholder="Enter Wallet Address"
              label="Contributor Whitelist"
              setWhitelist={assets => updateField('contributorWhitelist', assets)}
              whitelist={data.contributorWhitelist || []}
            />
            {errors.contributorWhitelist && <p className="text-red-600 mt-1">{errors.contributorWhitelist}</p>}
          </div>
        ) : null}
      </div>
      <div className="space-y-12">
        <div>
          <LavaWhitelistWithCaps
            required
            label="Asset Whitelist"
            setWhitelist={assets => updateField('assetsWhitelist', assets)}
            whitelist={data.assetsWhitelist || []}
            errors={errors}
          />
          {errors.assetsWhitelist && <p className="text-red-600 mt-1">{errors.assetsWhitelist}</p>}
        </div>
      </div>
    </div>
  );
};
