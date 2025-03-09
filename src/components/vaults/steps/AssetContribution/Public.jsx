import { LavaRadioGroup } from '@/components/shared/LavaRadioGroup';
import { LavaDatePicker } from '@/components/shared/LavaDatePicker';
import { LavaWhitelist } from '@/components/shared/LavaWhitelist';
import { LavaMinMaxInput } from '@/components/shared/LavaMinMaxInput';

export const Public = ({
  data,
  errors = {},
  updateField,
}) => (
  <div className="grid grid-cols-2">
    <div className="px-[36px]">
      <div>
        <LavaRadioGroup
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
        <LavaRadioGroup
          label="*Contribution window open time"
          name="contributionWindowOpenTime"
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
          value={data.contributionWindowOpenTime || ''}
          onChange={(value) => updateField('contributionWindowOpenTime', value)}
        />
        {errors.contributionWindowOpenTime && (
          <p className="text-main-red mt-1">{errors.contributionWindowOpenTime}</p>
        )}
        {data.contributionWindowOpenTime === 'custom' && (
          <div className="mt-4">
            <LavaDatePicker
              value={data.contributionWindowOpenDate}
              onChange={(date) => updateField('contributionWindowOpenDate', date)}
            />
            {errors.contributionWindowOpenDate && (
              <p className="text-main-red mt-1">{errors.contributionWindowOpenDate}</p>
            )}
          </div>
        )}
      </div>
    </div>

    <div className="px-[36px]">
      <div>
        <LavaWhitelist
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
          *Asset window
        </div>
        <div className="mt-4">
          <LavaDatePicker
            value={data.assetWindowDate}
            onChange={(date) => updateField('assetWindowDate', date)}
          />
          {errors.assetWindowDate && (
            <p className="text-main-red mt-1">{errors.assetWindowDate}</p>
          )}
        </div>
      </div>
      <div className="mt-[60px]">
        <div className="uppercase text-[20px] font-bold">
          Asset Count Cap
        </div>
        <div className="mt-4">
          <div className="flex flex-col space-y-2">
            <LavaMinMaxInput
              label="Collection ABC"
              maxValue={data.maxAssetCountCap}
              minValue={data.minAssetCountCap}
              onMaxChange={(value) => updateField('maxAssetCountCap', value)}
              onMinChange={(value) => updateField('minAssetCountCap', value)}
            />
            {errors.minAssetCountCap && (
              <p className="text-main-red mt-1">{errors.minAssetCountCap}</p>
            )}
            {errors.maxAssetCountCap && (
              <p className="text-main-red mt-1">{errors.maxAssetCountCap}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
);
