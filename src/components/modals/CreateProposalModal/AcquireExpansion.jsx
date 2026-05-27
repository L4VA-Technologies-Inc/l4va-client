import { useEffect, useState } from 'react';

import { LavaSteelSelect } from '@/components/shared/LavaSelect';
import { LavaIntervalPicker } from '@/components/shared/LavaIntervalPicker';
import { LavaSteelInput } from '@/components/shared/LavaInput';
import { LavaCheckbox } from '@/components/shared/LavaCheckbox';
import { HoverHelp } from '@/components/shared/HoverHelp';

export default function AcquireExpansion({ onDataChange, error, vault }) {
  const [duration, setDuration] = useState(null);
  const [noLimit, setNoLimit] = useState(false);
  const [maxAda, setMaxAda] = useState('');
  const [noMax, setNoMax] = useState(false);
  const [priceType, setPriceType] = useState('market');
  const [limitPrice, setLimitPrice] = useState('');

  const priceTypeOptions = [
    { value: 'market', label: 'Market Price' },
    { value: 'limit', label: 'Limit Price' },
  ];

  useEffect(() => {
    // Cannot have both noLimit and noMax true - at least one limit must be set
    const hasAtLeastOneLimit = !(noLimit && noMax);

    const maxAdaNum = parseFloat(maxAda) || 0;
    const limitPriceNum = parseFloat(limitPrice) || 0;
    const MAX_ADA_LIMIT = 1000000000; // 1 billion ADA
    const MAX_LIMIT_PRICE = 1000000; // 1 million VT per 1 ADA

    // Calculate minimum limit price based on vault decimals to prevent multiplier = 0
    const decimals = vault?.ftTokenDecimals || 6;
    const minLimitPrice = Math.pow(10, -decimals);

    const isValid =
      (noLimit || duration > 0) &&
      (noMax || (maxAda && maxAdaNum > 0 && maxAdaNum <= MAX_ADA_LIMIT)) &&
      hasAtLeastOneLimit &&
      priceType &&
      (priceType === 'market' || (limitPrice && limitPriceNum >= minLimitPrice && limitPriceNum <= MAX_LIMIT_PRICE));

    // Convert ADA to lovelace for backend (1 ADA = 1,000,000 lovelace)
    const maxAdaLovelace = noMax ? null : Math.floor(Math.min(maxAdaNum, MAX_ADA_LIMIT) * 1000000) || null;

    onDataChange?.({
      acquireExpansionDuration: noLimit ? null : duration,
      acquireExpansionNoLimit: noLimit,
      acquireExpansionMaxAda: maxAdaLovelace,
      acquireExpansionNoMax: noMax,
      acquireExpansionPriceType: priceType,
      acquireExpansionLimitPrice: priceType === 'limit' ? Math.min(limitPriceNum, MAX_LIMIT_PRICE) : null,
      isValid,
    });
  }, [duration, noLimit, maxAda, noMax, priceType, limitPrice, onDataChange, vault?.ft_token_decimals]);

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-white">Acquire Expansion Configuration</h3>

        <div className="p-4 bg-steel-700 rounded-lg">
          <p className="text-sm text-gray-300">
            <strong>Acquire Expansion</strong> allows the vault to reopen for new ADA contributions in exchange for
            newly minted vault tokens. Users send ADA and receive VT based on the pricing model selected below.
          </p>
        </div>

        {/* Duration */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-300">
              Expansion Duration*
              <HoverHelp hint="How long the vault will accept new ADA contributions" />
            </label>
            <LavaCheckbox
              name="acquireExpansionNoLimit"
              checked={noLimit}
              onChange={e => setNoLimit(e.target.checked)}
              description="No Limit"
              disabled={noMax}
            />
          </div>
          {!noLimit ? (
            <>
              <LavaIntervalPicker
                variant={'steel'}
                value={duration}
                onChange={setDuration}
                placeholder="DD:HH:MM"
                error={error && !duration}
              />
            </>
          ) : (
            <div className="p-3 bg-steel-700 rounded-lg">
              <p className="text-sm text-gray-300">
                Vault will remain open until closed by governance action or max ADA is reached
              </p>
            </div>
          )}
          {noLimit && noMax && (
            <p className="text-red-500 text-sm mt-2">At least one limit (Duration or Maximum ADA) must be set</p>
          )}
        </div>

        {/* Max ADA */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-300">
              Maximum ADA*
              <HoverHelp hint="Total ADA that can be raised during this expansion window (max: 1 billion ADA)" />
            </label>
            <LavaCheckbox
              name="acquireExpansionNoMax"
              checked={noMax}
              onChange={e => setNoMax(e.target.checked)}
              description="No Max"
              disabled={noLimit}
            />
          </div>
          {!noMax ? (
            <>
              <LavaSteelInput
                type="number"
                min="1"
                max="1000000000"
                step="1"
                value={maxAda}
                onChange={value => {
                  const numValue = parseFloat(value);
                  if (numValue > 1000000000) {
                    setMaxAda('1000000000');
                  } else {
                    setMaxAda(value);
                  }
                }}
                placeholder="Enter maximum ADA (e.g., 10000)"
                error={error && !maxAda}
              />
              {maxAda && parseFloat(maxAda) > 1000000 && (
                <p className="text-xs text-yellow-400 mt-1">
                  Large limit set ({parseFloat(maxAda).toLocaleString()} ADA). Consider if this is intentional.
                </p>
              )}
            </>
          ) : (
            <div className="p-3 bg-steel-700 rounded-lg">
              <p className="text-sm text-gray-300">
                Unlimited ADA can be accepted until duration ends or governance closes the vault
              </p>
            </div>
          )}
        </div>

        {/* Price Type */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">VT Price per ADA*</label>
          <LavaSteelSelect options={priceTypeOptions} value={priceType} onChange={setPriceType} />

          {priceType === 'limit' && (
            <div className="mt-3">
              <label className="flex items-center gap-1.5 text-sm font-medium text-gray-300 mb-2">
                Limit Price (VT per 1 ADA)
                <HoverHelp hint="Fixed amount of vault tokens contributors will receive per 1 ADA (max: 1,000,000 VT)" />
              </label>
              <LavaSteelInput
                type="number"
                step="0.000001"
                min="0"
                max="1000000"
                value={limitPrice}
                onChange={value => {
                  const numValue = parseFloat(value);
                  if (numValue > 1000000) {
                    setLimitPrice('1000000');
                  } else {
                    setLimitPrice(value);
                  }
                }}
                placeholder="Enter VT per 1 ADA (up to 6 decimals, max 1M)"
                error={error && !limitPrice}
              />
              {error && !limitPrice && <p className="text-red-500 text-sm mt-1">Limit price is required</p>}
              {(() => {
                const decimals = vault?.ftTokenDecimals || 6;
                const minLimitPrice = Math.pow(10, -decimals);
                const limitPriceNum = parseFloat(limitPrice) || 0;

                if (limitPrice && limitPriceNum > 0 && limitPriceNum < minLimitPrice) {
                  return (
                    <div className="mt-2 p-3 bg-red-900/20 border border-red-600/50 rounded">
                      <p className="text-red-400 text-sm font-medium">⚠️ Price Too Low</p>
                      <p className="text-red-300/90 text-xs mt-1">
                        With {decimals} decimals, minimum limit price is {minLimitPrice} VT per 1 ADA. Lower values
                        would result in 0 tokens minted.
                      </p>
                    </div>
                  );
                }

                if (limitPrice && limitPriceNum > 0) {
                  return (
                    <div className="mt-2 p-3 bg-steel-800 rounded">
                      <p className="text-xs text-gray-400">Example calculation:</p>
                      <p className="text-sm text-primary font-mono mt-1">
                        100 ₳ = {(limitPriceNum * 100).toLocaleString()} VT
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Min: {minLimitPrice} VT/ADA</p>
                    </div>
                  );
                }

                return null;
              })()}
            </div>
          )}

          {priceType === 'market' && (
            <div className="mt-3 space-y-2">
              <div className="p-4 bg-steel-700 rounded-lg space-y-2">
                <p className="text-sm text-gray-300">
                  <strong>Market Price Calculation:</strong>
                </p>
                <p className="text-sm text-gray-300">
                  Contributors will receive VT based on the current market price from the Liquidity Pool:
                </p>
                <div className="p-3 bg-steel-800 rounded font-mono text-sm text-primary">
                  VT Amount = ADA Sent × (Current VT/ADA Price from LP)
                </div>
                <p className="text-xs text-gray-400">
                  This ensures contributors receive VT at fair market value based on DEX prices (DexHunter, Taptools)
                </p>
              </div>
              {!vault?.hasActiveLp && (
                <div className="p-3 bg-yellow-900/20 border border-yellow-600/50 rounded-lg">
                  <p className="text-yellow-400 text-sm font-medium">⚠️ Market Pricing Requirements:</p>
                  <p className="text-yellow-300/90 text-xs mt-1">
                    This vault does not have an active Liquidity Pool on DEXes. Market pricing requires an active LP
                    with at least 1,000 ADA in liquidity. Please use <strong>Limit Price</strong> instead, or create an
                    LP first.
                  </p>
                </div>
              )}
              {vault?.hasActiveLp && vault?.vtPrice && (
                <div className="p-3 bg-primary/10 border border-primary/30 rounded-lg">
                  <p className="text-primary text-sm font-medium">✓ LP Detected</p>
                  <p className="text-gray-300 text-xs mt-1">Current VT Price: {vault.vtPrice.toFixed(6)} ₳ per VT</p>
                  <p className="text-gray-400 text-xs mt-1">
                    Example: 100 ₳ = ~{(100 / vault.vtPrice).toFixed(2)} VT (at current price)
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Summary Box */}
        {/* <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg">
          <h4 className="text-sm font-semibold text-primary mb-2">Expansion Summary</h4>
          <div className="space-y-1 text-sm text-gray-300">
            <p>
              <span className="text-gray-400">Duration:</span>{' '}
              {noLimit
                ? 'No limit'
                : duration
                  ? `${Math.floor(duration / 86400000)}d ${Math.floor((duration % 86400000) / 3600000)}h ${Math.floor((duration % 3600000) / 60000)}m`
                  : 'Not set'}
            </p>
            <p>
              <span className="text-gray-400">Max ADA:</span>{' '}
              {noMax ? 'Unlimited' : maxAda ? `${parseFloat(maxAda).toLocaleString()} ₳` : 'Not set'}
            </p>
            <p>
              <span className="text-gray-400">Pricing:</span>{' '}
              {priceType === 'market'
                ? 'Market price (from LP)'
                : limitPrice
                  ? `${limitPrice} VT per 1 ₳`
                  : 'Not set'}
            </p>
          </div>
        </div> */}
      </div>
    </div>
  );
}
