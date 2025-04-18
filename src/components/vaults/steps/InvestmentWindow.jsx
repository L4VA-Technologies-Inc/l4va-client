import { addMilliseconds } from 'date-fns';

import { Label } from '@/components/ui/label';
import { LavaRadio } from '@/components/shared/LavaRadio';
import { LavaDatePicker } from '@/components/shared/LavaDatePicker';
import { LavaWhitelist } from '@/components/shared/LavaWhitelist';
import { LavaIntervalPicker } from '@/components/shared/LavaIntervalPicker';
import { LavaInput } from '@/components/shared/LavaInput';

import { VAULT_PRIVACY_TYPES } from '@/components/vaults/constants/vaults.constants';

export const InvestmentWindow = ({
  data,
  errors = {},
  updateField,
}) => {
  const vaultPrivacy = data.privacy;

  const handleChange = (e) => {
    const { name, value } = e.target;
    const numericValue = value.replace(/[^0-9.]/g, '');

    const parts = numericValue.split('.');
    const sanitizedValue = parts.length > 2 ? `${parts[0]}.${parts[1]}` : numericValue;

    if (parts.length === 2 && parts[1].length > 2) {
      return;
    }

    updateField(name, sanitizedValue === '' ? '' : +sanitizedValue);
  };

  const getMinInvestmentDate = () => {
    if (data.contributionOpenWindowType === 'custom') {
      return addMilliseconds(
        new Date(data.contributionOpenWindowTime),
        data.contributionDuration,
      );
    }
    return null;
  };

  const minDate = getMinInvestmentDate();

  return (
    <div className="grid grid-cols-2">
      <div className="px-[36px]">
        {vaultPrivacy === VAULT_PRIVACY_TYPES.PUBLIC ? null : (
          <div className="mb-[60px]">
            <LavaWhitelist
              allowCsv
              csvData={data.investorsWhitelistCsv}
              itemFieldName="walletAddress"
              itemPlaceholder="Wallet address"
              label="Investor whitelist"
              setCsvData={(csvData) => updateField('investorsWhitelistCsv', csvData)}
              setWhitelist={(assets) => updateField('investorsWhitelist', assets)}
              whitelist={data.investorsWhitelist || []}
            />
            {errors.investorsWhitelist && (
              <p className="text-red-600 mt-1">
                {errors.investorsWhitelist}
              </p>
            )}
          </div>
        )}
        <div>
          <Label className="uppercase text-[20px] font-bold" htmlFor="investmentWindowDuration">
            *INVESTMENT WINDOW DURATION
          </Label>
          <div className="mt-4">
            <LavaIntervalPicker
              value={data.investmentWindowDuration}
              onChange={(date) => updateField('investmentWindowDuration', date)}
            />
            {errors.investmentWindowDuration && (
              <p className="text-red-600 mt-1">{errors.investmentWindowDuration}</p>
            )}
          </div>
        </div>
        <div className="mt-[60px]">
          <div className="uppercase text-[20px] font-bold">
            *INVESTMENT WINDOW OPEN TIME
          </div>
          <div className="mt-4">
            <LavaRadio
              name="investmentOpenWindowType"
              options={[
                {
                  name: 'upon-asset-window-closing',
                  label: 'Upon Asset Window Closing',
                },
                {
                  name: 'custom',
                  label: 'Custom',
                },
              ]}
              value={data.investmentOpenWindowType || ''}
              onChange={(value) => updateField('investmentOpenWindowType', value)}
            />
            {errors.investmentOpenWindowType && (
              <p className="text-red-600 mt-1">{errors.investmentOpenWindowType}</p>
            )}

            {data.investmentOpenWindowType === 'custom' && (
              <div className="mt-4">
                <LavaDatePicker
                  minDate={minDate}
                  value={data.investmentOpenWindowTime}
                  onChange={(date) => updateField('investmentOpenWindowTime', date)}
                />
                {errors.investmentOpenWindowTime && (
                  <p className="text-red-600 mt-1">{errors.investmentOpenWindowTime}</p>
                )}
                {minDate && (
                  <p className="text-orange-500 mt-1">
                    Cannot be earlier than {minDate.toLocaleDateString()}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="px-[36px]">
        <LavaInput
          required
          error={errors.offAssetsOffered}
          label="% OF ASSETS OFFERED"
          name="offAssetsOffered"
          placeholder="XX.XX"
          suffix="%"
          type="text"
          value={data.offAssetsOffered || ''}
          onChange={handleChange}
        />
        <div className="mt-[60px]">
          <LavaInput
            required
            error={errors.ftInvestmentReserve}
            label="FT INVESTMENT RESERVE"
            name="ftInvestmentReserve"
            placeholder="XX.XX"
            suffix="%"
            type="text"
            value={data.ftInvestmentReserve || ''}
            onChange={handleChange}
          />
        </div>
        <div className="mt-[60px]">
          <LavaInput
            required
            error={errors.liquidityPoolContribution}
            label="% LIQUIDITY POOL CONTRIBUTION"
            name="liquidityPoolContribution"
            placeholder="XX.XX"
            suffix="%"
            type="text"
            value={data.liquidityPoolContribution || ''}
            onChange={handleChange}
          />
        </div>
      </div>
    </div>
  );
};
