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
    const sanitizedValue = parts.length > 2 ? parts[0] + '.' + parts[1] : numericValue;

    if (parts.length === 2 && parts[1].length > 2) {
      return;
    }

    const numValue = parseFloat(sanitizedValue);
    if (!isNaN(numValue) && numValue > 100) {
      return;
    }

    updateField(name, sanitizedValue);
  };

  const getMinInvestmentDate = () => {
    if (data.contributionOpenWindowType === 'custom') {
      return addMilliseconds(
        new Date(data.contributionOpenWindowTime),
        data.contributionDuration
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
              itemPlaceholder="Wallet address"
              label="Investor whitelist"
              setWhitelist={(assets) => updateField('investorWhitelist', assets)}
              whitelist={data.investorWhitelist || []}
            />
            {errors.investorWhitelist && (
              <p className="text-main-red mt-1">
                {errors.investorWhitelist}
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
              <p className="text-main-red mt-1">{errors.investmentWindowDuration}</p>
            )}
          </div>
        </div>
        <div className="mt-[60px]">
          <div className="uppercase text-[20px] font-bold">
            *INVESTMENT WINDOW OPEN TIME
          </div>
          <div className="mt-4">
            <LavaRadio
              name="investmentWindowOpenTime"
              options={[
                {
                  name: 'assetClose',
                  label: 'Upon Asset Window Closing',
                },
                {
                  name: 'custom',
                  label: 'Custom',
                },
              ]}
              value={data.investmentWindowOpenTime || ''}
              onChange={(value) => updateField('investmentWindowOpenTime', value)}
            />
            {errors.investmentWindowOpenTime && (
              <p className="text-main-red mt-1">{errors.investmentWindowOpenTime}</p>
            )}

            {data.investmentWindowOpenTime === 'custom' && (
              <div className="mt-4">
                <LavaDatePicker
                  value={data.investmentWindowOpenDate}
                  onChange={(date) => updateField('investmentWindowOpenDate', date)}
                  minDate={minDate}
                />
                {errors.investmentWindowOpenDate && (
                  <p className="text-main-red mt-1">{errors.investmentWindowOpenDate}</p>
                )}
                {minDate && (
                  <p className="text-main-orange mt-1">
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
          name="offAssetsOffered"
          label="% OF ASSETS OFFERED"
          placeholder="XX.XX%"
          type="text"
          required
          value={data.offAssetsOffered || ''}
          onChange={handleChange}
          error={errors.offAssetsOffered}
        />
        <div className="mt-[60px]">
          <Label className="uppercase text-[20px] font-bold" htmlFor="ftInvestmentWindow">
            *FT INVESTMENT WINDOW
          </Label>
          <div className="mt-4">
            <LavaDatePicker
              value={data.ftInvestmentWindow}
              onChange={(date) => updateField('ftInvestmentWindow', date)}
            />
            {errors.ftInvestmentWindow && (
              <p className="text-main-red mt-1">{errors.ftInvestmentWindow}</p>
            )}
          </div>
        </div>
        <div className="mt-[60px]">
          <LavaInput
            name="ftInvestmentReserve"
            label="FT INVESTMENT RESERVE"
            placeholder="XX.XX%"
            type="text"
            required
            value={data.ftInvestmentReserve || ''}
            onChange={handleChange}
            error={errors.ftInvestmentReserve}
          />
        </div>
        <div className="mt-[60px]">
          <LavaInput
            name="liquidityPoolContribution"
            label="% LIQUIDITY POOL CONTRIBUTION"
            placeholder="XX.XX%"
            type="text"
            required
            value={data.liquidityPoolContribution || ''}
            onChange={handleChange}
            error={errors.liquidityPoolContribution}
          />
        </div>
      </div>
    </div>
  );
};
