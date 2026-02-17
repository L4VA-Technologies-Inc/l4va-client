import { useEffect, useState } from 'react';

import { LavaSteelSelect, LavaMultiSelect } from '@/components/shared/LavaSelect';
import { LavaIntervalPicker } from '@/components/shared/LavaIntervalPicker';
import { LavaSteelInput } from '@/components/shared/LavaInput';
import { LavaCheckbox } from '@/components/shared/LavaCheckbox';

export default function Expansion({ onDataChange, error, vault }) {
  const [selectedPolicies, setSelectedPolicies] = useState([]);
  const [duration, setDuration] = useState(null);
  const [noLimit, setNoLimit] = useState(false);
  const [assetMax, setAssetMax] = useState('');
  const [noMax, setNoMax] = useState(false);
  const [priceType, setPriceType] = useState('market');
  const [limitPrice, setLimitPrice] = useState('');

  // Get whitelisted policies from vault
  const whitelistedPolicies =
    vault?.assetsWhitelist?.map(w => ({
      value: w.policyId,
      label: `${w.policyId.substring(0, 10)}...${w.policyId.substring(w.policyId.length - 8)}`,
    })) || [];

  const priceTypeOptions = [
    { value: 'market', label: 'Market Price' },
    { value: 'limit', label: 'Limit Price' },
  ];

  useEffect(() => {
    const isValid =
      selectedPolicies.length > 0 &&
      (noLimit || duration > 0) &&
      (noMax || (assetMax && parseInt(assetMax) > 0)) &&
      priceType &&
      (priceType === 'market' || (limitPrice && parseFloat(limitPrice) > 0));

    onDataChange?.({
      expansionPolicyIds: selectedPolicies,
      expansionDuration: noLimit ? null : duration,
      expansionNoLimit: noLimit,
      expansionAssetMax: noMax ? null : parseInt(assetMax) || null,
      expansionNoMax: noMax,
      expansionPriceType: priceType,
      expansionLimitPrice: priceType === 'limit' ? parseFloat(limitPrice) : null,
      isValid,
    });
  }, [selectedPolicies, duration, noLimit, assetMax, noMax, priceType, limitPrice, onDataChange]);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-white">Expansion Configuration</h3>

        <div className="p-4 bg-steel-700 rounded-lg">
          <p className="text-sm text-gray-300">
            <strong>Vault Expansion</strong> allows the vault to reopen for new asset contributions in exchange for
            newly minted vault tokens. Configure the parameters below to set the framework for accepting new assets.
          </p>
        </div>

        {/* Policy Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Select Asset Collections*</label>
          <LavaMultiSelect
            options={whitelistedPolicies}
            placeholder="Select policy IDs"
            value={selectedPolicies}
            onChange={value => setSelectedPolicies(Array.isArray(value) ? value : [])}
            className="min-w-full"
          />
          <p className="text-xs text-gray-400 mt-1">
            Select which whitelisted asset collections will be accepted during expansion
          </p>
          {error && selectedPolicies.length === 0 && (
            <p className="text-red-500 text-sm mt-1">Select at least one policy</p>
          )}
        </div>

        {/* Duration */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-300">Expansion Duration*</label>
            <LavaCheckbox checked={noLimit} onChange={e => setNoLimit(e.target.checked)} description="No Limit" />
          </div>
          {!noLimit ? (
            <>
              <LavaIntervalPicker
                value={duration}
                onChange={setDuration}
                placeholder="DD:HH:MM"
                error={error && !duration}
              />
              <p className="text-xs text-gray-400 mt-1">How long the vault will accept new contributions</p>
            </>
          ) : (
            <div className="p-3 bg-steel-700 rounded-lg">
              <p className="text-sm text-gray-300">
                Vault will remain open until closed by governance action or asset max is reached
              </p>
            </div>
          )}
        </div>

        {/* Asset Max */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-300">Maximum Assets*</label>
            <LavaCheckbox checked={noMax} onChange={e => setNoMax(e.target.checked)} description="No Max" />
          </div>
          {!noMax ? (
            <>
              <LavaSteelInput
                type="number"
                value={assetMax}
                onChange={setAssetMax}
                placeholder="Enter maximum number of assets"
                error={error && !assetMax}
              />
              <p className="text-xs text-gray-400 mt-1">
                Total number of new assets allowed (whole numbers for NFTs, tokens for FTs)
              </p>
            </>
          ) : (
            <div className="p-3 bg-steel-700 rounded-lg">
              <p className="text-sm text-gray-300">
                Unlimited assets can be accepted until duration ends or governance closes the vault
              </p>
            </div>
          )}
        </div>

        {/* Price Type */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Price per Asset*</label>
          <LavaSteelSelect options={priceTypeOptions} value={priceType} onChange={setPriceType} />

          {priceType === 'limit' && (
            <div className="mt-3">
              <LavaSteelInput
                type="number"
                step="0.00001"
                value={limitPrice}
                onChange={setLimitPrice}
                placeholder="Enter VT per asset (up to 5 decimals)"
                error={error && !limitPrice}
                label="Limit Price (VT per asset)"
              />
              <p className="text-xs text-gray-400 mt-1">
                Fixed amount of vault tokens contributors will receive per asset
              </p>
              {error && !limitPrice && <p className="text-red-500 text-sm mt-1">Limit price is required</p>}
            </div>
          )}

          {priceType === 'market' && (
            <div className="mt-3 p-4 bg-steel-700 rounded-lg space-y-2">
              <p className="text-sm text-gray-300">
                <strong>Market Price Calculation:</strong>
              </p>
              <p className="text-sm text-gray-300">Contributors will receive VT based on fair market value:</p>
              <div className="p-3 bg-steel-800 rounded font-mono text-sm text-primary">
                VT Amount = (Asset Floor Price ₳) ÷ (VT Price ₳)
              </div>
              <p className="text-xs text-gray-400">
                This ensures contributors receive a fair value equivalent in vault tokens based on current market prices
              </p>
            </div>
          )}
        </div>

        {/* Summary Box */}
        <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg">
          <h4 className="text-sm font-semibold text-primary mb-2">Expansion Summary</h4>
          <div className="space-y-1 text-sm text-gray-300">
            <p>
              <span className="text-gray-400">Collections:</span>{' '}
              {selectedPolicies.length > 0 ? `${selectedPolicies.length} selected` : 'None selected'}
            </p>
            <p>
              <span className="text-gray-400">Duration:</span>{' '}
              {noLimit
                ? 'No limit'
                : duration
                  ? `${Math.floor(duration / 86400000)}d ${Math.floor((duration % 86400000) / 3600000)}h ${Math.floor((duration % 3600000) / 60000)}m`
                  : 'Not set'}
            </p>
            <p>
              <span className="text-gray-400">Max Assets:</span> {noMax ? 'Unlimited' : assetMax || 'Not set'}
            </p>
            <p>
              <span className="text-gray-400">Pricing:</span>{' '}
              {priceType === 'market'
                ? 'Market price (fair value)'
                : limitPrice
                  ? `${limitPrice} VT per asset`
                  : 'Not set'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
