import { LavaRadio } from '@/components/shared/LavaRadio';
import { LavaDatePicker } from '@/components/shared/LavaDatePicker';
import { LavaWhitelistWithCaps } from '@/components/shared/LavaWhitelistWithCaps';
import { LavaIntervalPicker } from '@/components/shared/LavaIntervalPicker';
import { VALUE_METHOD_HINT } from '@/components/vaults/constants/vaults.constants';

export const Public = ({ data, errors = {}, updateField }) => (
  <div className="grid grid-cols-2">
    <div className="px-[36px]">
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
    <div className="px-[36px]">
      <div>
        <LavaWhitelistWithCaps
          required
          label="Asset Whitelist"
          setWhitelist={assets => updateField('assetsWhitelist', assets)}
          whitelist={data.assetsWhitelist || []}
        />
        {errors.assetsWhitelist && <p className="text-red-600 mt-1">{errors.assetsWhitelist}</p>}
      </div>
      <div className="mt-[60px]">
        <div className="uppercase text-[20px] font-bold">*Contribution duration</div>
        <div className="mt-4">
          <LavaIntervalPicker
            value={data.contributionDuration}
            onChange={value => updateField('contributionDuration', value)}
          />
          {errors.contributionDuration && <p className="text-red-600 mt-1">{errors.contributionDuration}</p>}
        </div>
      </div>
    </div>
  </div>
);
