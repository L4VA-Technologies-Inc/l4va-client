import { LavaRadio } from '@/components/shared/LavaRadio';
import { LavaDatePicker } from '@/components/shared/LavaDatePicker';
import { LavaWhitelistWithCaps } from '@/components/shared/LavaWhitelistWithCaps';
import { LavaIntervalPicker } from '@/components/shared/LavaIntervalPicker';
import { MIN_CONTRIBUTION_DURATION_MS, VALUE_METHOD_HINT } from '@/components/vaults/constants/vaults.constants';

export const Public = ({ data, errors = {}, updateField }) => (
  <div className="my-16 grid grid-cols-1 md:grid-cols-2 gap-16">
    <div className="space-y-12">
      <div>
        <LavaRadio
          label="*Vault Value Method"
          name="valueMethod"
          options={[
            {
              name: 'lbe',
              label: 'Market / Floor Price',
            },
          ]}
          value={data.valueMethod || ''}
          onChange={value => updateField('valueMethod', value)}
          hint={VALUE_METHOD_HINT}
        />
        {errors.valueMethod && <p className="text-red-600 mt-1">{errors.valueMethod}</p>}
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
        {errors.contributionOpenWindowType && <p className="text-red-600 mt-1">{errors.contributionOpenWindowType}</p>}
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
    </div>
    <div className="space-y-12">
      <div>
        <LavaWhitelistWithCaps
          required
          label="Asset Whitelist"
          setWhitelist={assets => updateField('assetsWhitelist', assets)}
          whitelist={data.assetsWhitelist || []}
          errors={errors}
          vaultType={data.type}
        />
        {errors.assetsWhitelist && <p className="text-red-600 mt-1">{errors.assetsWhitelist}</p>}
      </div>
    </div>
    <div className="space-y-12">
      <div>
        <div className="uppercase font-bold">*Contribution duration</div>
        <div className="mt-4">
          <LavaIntervalPicker
            value={data.contributionDuration}
            error={errors.contributionDuration}
            onChange={value => updateField('contributionDuration', value)}
            minDays={Math.floor(MIN_CONTRIBUTION_DURATION_MS / (1000 * 60 * 60 * 24))}
          />
          {errors.contributionDuration && <p className="text-red-600 mt-1">{errors.contributionDuration}</p>}
        </div>
      </div>
    </div>
  </div>
);
