import { LavaRadio } from '@/components/shared/LavaRadio';
import { LavaDatePicker } from '@/components/shared/LavaDatePicker';
import { LavaWhitelistWithCaps } from '@/components/shared/LavaWhitelistWithCaps';
import { LavaIntervalPicker } from '@/components/shared/LavaIntervalPicker';

export const Public = ({
  data,
  errors = {},
  updateField,
}) => (
  <div className="grid grid-cols-2">
    <div className="px-[36px]">
      <div>
        <LavaRadio
          label="*Valuation type"
          name="valuationType"
          options={[
            {
              name: 'lbe',
              label: 'LBE (Liquidity Bootstrapping Event)',
            },
          ]}
          value={data.valuationType || ''}
          onChange={(value) => updateField('valuationType', value)}
        />
        {errors.valuationType && (
          <p className="text-main-red mt-1">{errors.valuationType}</p>
        )}
      </div>
      <div className="mt-[60px]">
        <LavaRadio
          label="*Contribution window open time"
          name="contributionOpenWindowType"
          options={[
            {
              name: 'launch',
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
    </div>
    <div className="px-[36px]">
      <div>
        <LavaWhitelistWithCaps
          label="Asset Whitelist"
          setWhitelist={(assets) => updateField('whitelistAssets', assets)}
          whitelist={data.whitelistAssets || []}
        />
        {errors.whitelistAssets && (
          <p className="text-main-red mt-1">{errors.whitelistAssets}</p>
        )}
      </div>
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
    </div>
  </div>
);
