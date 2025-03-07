import { LavaRadioGroup } from '@/components/shared/LavaRadioGroup';
import { LavaDatePicker } from '@/components/shared/LavaDatePicker';
import { LavaWhitelist } from '@/components/shared/LavaWhitelist.jsx';
import { LavaMinMaxInput } from '@/components/shared/LavaMinMaxInput';
import { UploadZone } from '@/components/shared/LavaUploadZone.jsx';
import { LavaSelect } from '@/components/shared/LavaSelect';
import { LavaInput } from '@/components/shared/LavaInput';

export const Private = ({
  data,
  errors = {},
  updateField,
}) => {
  const { valuationType } = data;

  return (
    <div className="grid grid-cols-2">
      <div className="px-[36px]">
        <div>
          <LavaRadioGroup
            label="*Valuation type"
            name="valuationType"
            options={[
              {
                id: 'lbe',
                label: 'LBE (Liquidity Bootstrapping Event)',
              },
              {
                id: 'fixed',
                label: 'Fixed',
              },
            ]}
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
                placeholder="#,###.##"
                type="text"
                value={data.valuationAmount || ''}
                onChange={(e) => updateField('valuationAmount', e.target.value)}
              />
            </div>
          </>
        )}
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
          <UploadZone
            image={data.vaultImage}
            label="*Upload CSV"
            setImage={(image) => updateField('vaultImage', image)}
          />
          {errors.vaultImage && (
            <p className="text-main-red mt-1">{errors.vaultImage}</p>
          )}
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
};
