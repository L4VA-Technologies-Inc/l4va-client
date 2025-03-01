import { LavaRadioGroup } from '@/components/shared/LavaRadioGroup';
import { LavaDatePicker } from '@/components/shared/LavaDatePicker';
import { LavaWhitelistAssets } from '@/components/shared/LavaWhitelistAssets';
import { LavaMinMaxInput } from '@/components/shared/LavaMinMaxInput';

export const AssetContribution = ({ data, setData }) => {
  const updateField = (fieldName, value) => {
    setData({
      ...data,
      [fieldName]: value,
    });
  };

  return (
    <div className="grid grid-cols-2">
      <div className="px-[36px]">
        <LavaRadioGroup
          label="*Valuation type"
          name="valuationType"
          options={[
            {
              id: 'lbe',
              label: 'LBE (Liquidity Bootstrapping Event)',
            },
          ]}
          value={data.valuationType || ''}
          onChange={(value) => updateField('valuationType', value)}
        />

        <div className="mt-[60px]">
          <LavaRadioGroup
            label="*Contribution window open time"
            name="contributionWindowOpenTime"
            options={[
              {
                id: 'launch',
                label: 'Upon Vault Launch',
              },
              {
                id: 'custom',
                label: 'Custom',
              },
            ]}
            value={data.contributionWindowOpenTime || ''}
            onChange={(value) => updateField('contributionWindowOpenTime', value)}
          />

          {data.contributionWindowOpenTime === 'custom' && (
            <div className="mt-4">
              <LavaDatePicker
                value={data.contributionWindowOpenDate}
                onChange={(date) => updateField('contributionWindowOpenDate', date)}
              />
            </div>
          )}
        </div>
      </div>

      <div className="px-[36px]">
        <LavaWhitelistAssets
          setWhitelistedAssets={(assets) => updateField('whitelistAssets', assets)}
          whitelistedAssets={data.whitelistAssets || []}
        />

        <div className="mt-[60px]">
          <div className="uppercase text-[20px] font-bold">
            *Asset window
          </div>
          <div className="mt-4">
            <LavaDatePicker
              value={data.assetWindowDate}
              onChange={(date) => updateField('assetWindowDate', date)}
            />
          </div>
        </div>

        <div className="mt-[60px]">
          <div className="uppercase text-[20px] font-bold">
            Asset Count Cap
          </div>
          <div className="mt-4">
            <div className="flex flex-col space-y-2">
              <LavaMinMaxInput
                maxValue={data.maxAssetCountCap}
                minValue={data.minAssetCountCap}
                onMaxChange={(value) => updateField('maxAssetCountCap', value)}
                onMinChange={(value) => updateField('minAssetCountCap', value)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
