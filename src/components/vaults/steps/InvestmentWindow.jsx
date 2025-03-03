import { Info } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { LavaRadioGroup } from '@/components/shared/LavaRadioGroup';
import { LavaDatePicker } from '@/components/shared/LavaDatePicker';

export const InvestmentWindow = ({
  data,
  errors = {},
  updateField,
}) => {
  const handleChange = (e) => {
    const { id, value } = e.target;
    updateField(id, value);
  };

  return (
    <div className="grid grid-cols-2">
      <div className="px-[36px]">
        <div>
          <Label className="uppercase text-[20px] font-bold text-white" htmlFor="investmentWindowDuration">
            *INVESTMENT WINDOW DURATION
          </Label>
          <div className="mt-4">
            <LavaDatePicker
              value={data.investmentWindowDuration}
              onChange={(date) => updateField('investmentWindowDuration', date)}
            />
            {errors.investmentWindowDuration && (
              <p className="text-main-red mt-1">{errors.investmentWindowDuration}</p>
            )}
          </div>
        </div>

        <div className="mt-[60px]">
          <div className="uppercase text-[20px] font-bold text-white">
            *INVESTMENT WINDOW OPEN TIME
          </div>
          <div className="mt-4">
            <LavaRadioGroup
              name="investmentWindowOpenTime"
              options={[
                {
                  id: 'assetClose',
                  label: 'Upon Asset Window Closing',
                },
                {
                  id: 'custom',
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
                />
                {errors.investmentWindowOpenDate && (
                  <p className="text-main-red mt-1">{errors.investmentWindowOpenDate}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-[36px]">
        <div>
          <Label className="uppercase text-[20px] font-bold text-white" htmlFor="percentAssetsOffered">
            % OF ASSETS OFFERED
          </Label>
          <Input
            className="rounded-[10px] py-4 pl-5 text-[20px] bg-input-bg border-dark-600 h-[60px] mt-4"
            id="percentAssetsOffered"
            placeholder="XX.XX%"
            style={{ fontSize: '20px' }}
            value={data.percentAssetsOffered || ''}
            onChange={handleChange}
          />
          {errors.percentAssetsOffered && (
            <p className="text-main-red mt-1">{errors.percentAssetsOffered}</p>
          )}
        </div>

        <div className="mt-[60px]">
          <Label className="uppercase text-[20px] font-bold text-white" htmlFor="ftInvestmentWindow">
            FT INVESTMENT WINDOW
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
          <Label className="uppercase text-[20px] font-bold text-white flex items-center" htmlFor="ftInvestmentReserve">
            FT INVESTMENT RESERVE
            <Info className="ml-2 inline-block" color="white" size={16} />
          </Label>
          <Input
            className="rounded-[10px] py-4 pl-5 text-[20px] bg-input-bg border-dark-600 h-[60px] mt-4"
            id="ftInvestmentReserve"
            placeholder="10%"
            style={{ fontSize: '20px' }}
            value={data.ftInvestmentReserve || ''}
            onChange={handleChange}
          />
          {errors.ftInvestmentReserve && (
            <p className="text-main-red mt-1">{errors.ftInvestmentReserve}</p>
          )}
        </div>

        <div className="mt-[60px]">
          <Label className="uppercase text-[20px] font-bold text-white" htmlFor="percentLiquidityPoolContribution">
            % LIQUIDITY POOL CONTRIBUTION
          </Label>
          <Input
            className="rounded-[10px] py-4 pl-5 text-[20px] bg-input-bg border-dark-600 h-[60px] mt-4"
            id="percentLiquidityPoolContribution"
            placeholder="XX.XX%"
            style={{ fontSize: '20px' }}
            value={data.percentLiquidityPoolContribution || ''}
            onChange={handleChange}
          />
          {errors.percentLiquidityPoolContribution && (
            <p className="text-main-red mt-1">{errors.percentLiquidityPoolContribution}</p>
          )}
        </div>
      </div>
    </div>
  );
};
