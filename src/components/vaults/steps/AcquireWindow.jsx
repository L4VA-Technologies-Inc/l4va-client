import { addMilliseconds } from 'date-fns';
import { Lock } from 'lucide-react';

import { Label } from '@/components/ui/label';
import { LavaRadio } from '@/components/shared/LavaRadio';
import { LavaDatePicker } from '@/components/shared/LavaDatePicker';
import { LavaIntervalPicker } from '@/components/shared/LavaIntervalPicker';
import { LavaInput } from '@/components/shared/LavaInput';
import { useCurrency } from '@/hooks/useCurrency';
import { useNetwork } from '@/hooks/useNetwork';
import {
  getReserveHint,
  getLiquidityPoolContributionHint,
  MIN_ACQUIRE_WINDOW_DURATION_MS,
} from '@/components/vaults/constants/vaults.constants';

export const AcquireWindow = ({
  data,
  errors = {},
  updateField,
  isPresetConfigLocked = false,
  isAdvancedPresetAvailable = true,
}) => {
  const isAcquireOnly = data.isAcquireOnly === true;
  const { currencyLabel: assetSymbol } = useCurrency();
  const { isRobinHood } = useNetwork();
  const maxAcquireThreshold = 100000;
  const minAcquireThresholdRangeHint = isRobinHood
    ? `Allowed range when set: 0.01 to 100,000 ${assetSymbol}.`
    : `Allowed range when set: 1+ ${assetSymbol} (max 100,000 ${assetSymbol}).`;

  const handleChange = e => {
    const { name, value } = e.target;
    const numericValue = value.replace(/[^0-9.]/g, '');

    const parts = numericValue.split('.');
    const sanitizedValue = parts.length > 2 ? `${parts[0]}.${parts[1]}` : numericValue;

    if (parts.length === 2 && parts[1].length > 2) {
      return;
    }

    if (sanitizedValue !== '') {
      const limitedValue = Math.min(Number(sanitizedValue), 100);
      updateField(name, limitedValue);
    } else {
      updateField(name, null);
    }
  };

  const getMinAcquireDate = () => {
    if (data.contributionOpenWindowType === 'custom') {
      return addMilliseconds(new Date(data.contributionOpenWindowTime), data.contributionDuration);
    }
    return null;
  };

  const minDate = getMinAcquireDate();

  return (
    <div className="my-16 grid grid-cols-1 md:grid-cols-2 gap-16 min-w-0 overflow-x-hidden">
      <div className="space-y-12 min-w-0">
        <div>
          <Label className="uppercase font-bold" htmlFor="acquireWindowDuration">
            *ACQUIRE WINDOW DURATION
          </Label>
          <div className="mt-4">
            <LavaIntervalPicker
              id="acquireWindowDuration"
              value={data.acquireWindowDuration}
              onChange={date => updateField('acquireWindowDuration', date)}
              minMs={MIN_ACQUIRE_WINDOW_DURATION_MS}
            />
            {errors.acquireWindowDuration && <p className="text-red-600 mt-1">{errors.acquireWindowDuration}</p>}
          </div>
        </div>
        <div>
          <div className="uppercase font-bold">*ACQUIRE WINDOW OPEN TIME</div>
          <div className="mt-4">
            <LavaRadio
              name="acquireOpenWindowType"
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
              value={data.acquireOpenWindowType || ''}
              onChange={value => updateField('acquireOpenWindowType', value)}
            />
            {errors.acquireOpenWindowType && <p className="text-red-600 mt-1">{errors.acquireOpenWindowType}</p>}
            {data.acquireOpenWindowType === 'custom' && (
              <div className="mt-4">
                <LavaDatePicker
                  minDate={minDate}
                  value={data.acquireOpenWindowTime}
                  onChange={date => updateField('acquireOpenWindowTime', date)}
                />
                {errors.acquireOpenWindowTime && <p className="text-red-600 mt-1">{errors.acquireOpenWindowTime}</p>}
                {minDate && (
                  <p className="text-orange-500 mt-1">Cannot be earlier than {minDate.toLocaleDateString()}</p>
                )}
              </div>
            )}
          </div>
        </div>
        {isAcquireOnly && (
          <div className="mt-4">
            <LavaInput
              error={errors.minAcquireThreshold}
              label={`MINIMUM ${assetSymbol} THRESHOLD (OPTIONAL)`}
              id="minAcquireThreshold"
              name="minAcquireThreshold"
              placeholder={isRobinHood ? 'e.g. 0.01' : 'e.g. 10000'}
              suffix={assetSymbol}
              type="text"
              value={
                data.minAcquireThreshold !== null && data.minAcquireThreshold !== undefined
                  ? String(data.minAcquireThreshold)
                  : ''
              }
              onChange={e => {
                if (isRobinHood) {
                  const raw = e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');

                  // Allow natural partial typing, but block committed values below 0.01 ETH.
                  if (raw !== '') {
                    const isPartialInput = raw === '0' || raw === '0.' || raw === '0.0';
                    const parsed = Number(raw);
                    if (!isPartialInput && !Number.isNaN(parsed) && parsed < 0.01) {
                      return;
                    }
                    if (!Number.isNaN(parsed) && parsed > maxAcquireThreshold) {
                      return;
                    }
                  }

                  updateField('minAcquireThreshold', raw === '' ? null : raw);
                  return;
                }
                const raw = e.target.value.replace(/[^0-9]/g, '');
                updateField('minAcquireThreshold', raw === '' ? null : Math.min(Number(raw), maxAcquireThreshold));
              }}
              onBlur={() => {
                if (!isRobinHood) return;
                if (data.minAcquireThreshold === null || data.minAcquireThreshold === undefined) return;
                const parsed = Number(data.minAcquireThreshold);
                if (Number.isNaN(parsed)) {
                  updateField('minAcquireThreshold', null);
                  return;
                }
                if (parsed > 0 && parsed < 0.01) {
                  updateField('minAcquireThreshold', '0.01');
                  return;
                }
                if (parsed > maxAcquireThreshold) {
                  updateField('minAcquireThreshold', String(maxAcquireThreshold));
                }
              }}
              hint={
                data.liquidityPoolContribution > 0
                  ? `${minAcquireThresholdRangeHint} Optional. Vault locks only if at least this much ${assetSymbol} is acquired. With ${data.liquidityPoolContribution}% LP Contribution, both this threshold and the LP liquidity minimum must be met, or the vault fails and all ${assetSymbol} is refunded.`
                  : `${minAcquireThresholdRangeHint} Optional. Vault locks only if at least this much ${assetSymbol} is acquired. If not set, any acquired ${assetSymbol} can lock the vault. If none is acquired, the vault fails and all ${assetSymbol} is refunded.`
              }
            />
            {data.liquidityPoolContribution > 0 && (
              <p className="text-orange-500 mt-2 text-sm">
                Warning. With {data.liquidityPoolContribution}% LP Contribution, your vault has TWO thresholds that must
                be met:
                <br />
                1. Your minimum {assetSymbol} threshold (if set)
                <br />
                2. LP minimum liquidity requirement (calculated automatically)
                <br />
                The vault will fail if EITHER threshold is not reached during the acquire window.
              </p>
            )}
          </div>
        )}
      </div>
      <div className="space-y-12 min-w-0">
        {(isPresetConfigLocked || isAcquireOnly) && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-steel-800 border border-steel-700 text-dark-100 text-xs font-russo uppercase">
            <Lock className="w-3.5 h-3.5 flex-shrink-0" />
            {isAcquireOnly
              ? 'Acquire-Only: Tokens for Acquirers is fixed at 100%'
              : isAdvancedPresetAvailable
                ? 'Values set by preset — select Advanced preset to customise'
                : 'Advanced mode is disabled — values are managed by the preset'}
          </div>
        )}
        <div>
          <LavaInput
            required
            error={errors.tokensForAcquires}
            label="TOKENS FOR ACQUIRERS (%)"
            name="tokensForAcquires"
            placeholder="XX"
            suffix="%"
            type="text"
            value={data.tokensForAcquires === 0 ? '0' : data.tokensForAcquires ? String(data.tokensForAcquires) : ''}
            onChange={handleChange}
            disabled={isPresetConfigLocked || isAcquireOnly}
            hint="The percentage (%) of net vault tokens minted (total vault tokens minus LP Contribution) which will be received by Acquirers when vault locks."
          />
        </div>
        <div>
          <LavaInput
            required
            error={errors.acquireReserve}
            label="RESERVE (%)"
            name="acquireReserve"
            placeholder="XX"
            suffix="%"
            type="text"
            value={data.acquireReserve === 0 ? '0' : data.acquireReserve ? String(data.acquireReserve) : ''}
            onChange={handleChange}
            hint={getReserveHint(assetSymbol)}
            disabled={isPresetConfigLocked || isAcquireOnly || data.tokensForAcquires === 0}
          />
          {!isAcquireOnly && data.acquireReserve < 100 && data.tokensForAcquires > 0 && (
            <p className="text-orange-500 mt-1">
              Warning: Reserve % of &lt; 100% means that assets contributed will be valued at less than 100% of market
              price (floor price for NFTs / spot price for CNTs at end of Contribution window).
            </p>
          )}
        </div>
        <div>
          <LavaInput
            required
            error={errors.liquidityPoolContribution}
            label="LIQUIDITY POOL (LP) CONTRIBUTION (%)"
            name="liquidityPoolContribution"
            placeholder="XX"
            suffix="%"
            type="text"
            value={
              data.liquidityPoolContribution === 0
                ? '0'
                : data.liquidityPoolContribution
                  ? String(data.liquidityPoolContribution)
                  : ''
            }
            onChange={handleChange}
            disabled={isAcquireOnly ? false : isPresetConfigLocked}
            hint={getLiquidityPoolContributionHint(assetSymbol)}
          />
          {data.liquidityPoolContribution === 0 && (
            <p className="text-orange-500 mt-1">
              Warning: 0% LP Contribution means there will NOT be a liquidity pool launched for this Vault.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
