import { useEffect, useState } from 'react';

import { LavaSteelSelect } from '@/components/shared/LavaSelect';
import { LavaIntervalPicker } from '@/components/shared/LavaIntervalPicker';
import { LavaSteelInput } from '@/components/shared/LavaInput';
import { LavaCheckbox } from '@/components/shared/LavaCheckbox';
import { HoverHelp } from '@/components/shared/HoverHelp';
import { ProposalOutcome } from '@/components/modals/CreateProposalModal/ProposalOutcome.jsx';
import { MIN_EXPANSION_DURATION_MS } from '@/components/vaults/constants/vaults.constants';
import { useCurrency } from '@/hooks/useCurrency';
import { ChainType } from '@/utils/types';

export default function AcquireExpansion({ onDataChange, error, vault }) {
  const { currencyLabel } = useCurrency();
  const isEvmVault = vault?.chainType === ChainType.ROBINHOOD;
  const exampleContributionAmount = isEvmVault ? 1 : 100;
  const [duration, setDuration] = useState(null);
  const [noLimit, setNoLimit] = useState(false); // eslint-disable-line no-unused-vars -- "No Limit" toggle is commented out below
  const [maxAda, setMaxAda] = useState('');
  const [noMax, setNoMax] = useState(false);
  // Market price is not supported for Robinhood acquire expansion yet (the API rejects it).
  const [priceType, setPriceType] = useState(isEvmVault ? 'limit' : 'market');
  const [limitPrice, setLimitPrice] = useState('');

  const evmOutcome = buildEvmOutcome({
    duration,
    maxEth: parseFloat(maxAda) || 0,
    noMax,
    price: parseFloat(limitPrice) || 0,
    supply: Number(vault?.ftTokenSupply) || 0,
    ticker: vault?.vaultTokenTicker,
  });

  const priceTypeOptions = [
    { value: 'market', label: isEvmVault ? 'Market Price - Coming Soon' : 'Market Price', disabled: isEvmVault },
    { value: 'limit', label: 'Limit Price' },
  ];

  useEffect(() => {
    // Cannot have both noLimit and noMax true - at least one limit must be set
    const hasAtLeastOneLimit = !(noLimit && noMax);

    const maxAdaNum = parseFloat(maxAda) || 0;
    const limitPriceNum = parseFloat(limitPrice) || 0;
    const MAX_ADA_LIMIT = 1000000000; // 1 billion ADA
    const MAX_LIMIT_PRICE = 1000000; // 1 million VT per 1 ADA

    // Calculate minimum limit price based on vault decimals to prevent on-chain multiplier = 0
    // multiplier = floor(limitPrice * 10^decimals / 10^6) >= 1  =>  limitPrice >= 10^(6 - decimals)
    const decimals = vault?.ftTokenDecimals || 6;
    const minLimitPrice = Math.pow(10, 6 - decimals);

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
  }, [duration, noLimit, maxAda, noMax, priceType, limitPrice, onDataChange, vault?.ftTokenDecimals]);

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-white">Acquire Expansion Configuration</h3>

        <div className="p-4 bg-steel-700 rounded-lg">
          <p className="text-sm text-gray-300">
            <strong>Acquire Expansion</strong> allows the vault to reopen for new {currencyLabel} contributions in
            exchange for newly minted vault tokens. Users send {currencyLabel} and receive VT based on the pricing model
            selected below.
          </p>
        </div>

        {/* Duration */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-300">
              Expansion Duration*
              <HoverHelp hint={`How long the vault will accept new ${currencyLabel} contributions`} />
            </label>
            {/* "No Limit" disabled for now: every expansion proposal must have an end time.
            <LavaCheckbox
              name="acquireExpansionNoLimit"
              checked={noLimit}
              onChange={e => setNoLimit(e.target.checked)}
              description="No Limit"
              disabled={noMax}
            /> */}
          </div>
          {!noLimit ? (
            <>
              <LavaIntervalPicker
                variant={'steel'}
                value={duration}
                onChange={setDuration}
                placeholder="DD:HH:MM"
                error={error && !duration}
                minMs={MIN_EXPANSION_DURATION_MS}
              />
            </>
          ) : (
            <div className="p-3 bg-steel-700 rounded-lg">
              <p className="text-sm text-gray-300">
                Vault will remain open until closed by governance action or max {currencyLabel} is reached
              </p>
            </div>
          )}
          {noLimit && noMax && (
            <p className="text-red-500 text-sm mt-2">
              At least one limit (Duration or Maximum {currencyLabel}) must be set
            </p>
          )}
        </div>

        {/* Max acquire amount */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-300">
              Maximum {currencyLabel}*
              <HoverHelp
                hint={`Total ${currencyLabel} that can be raised during this expansion window (max: 1 billion ${currencyLabel})`}
              />
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
                placeholder={`Enter maximum ${currencyLabel} (e.g., 10000)`}
                error={error && !maxAda}
              />
              {maxAda && parseFloat(maxAda) > 1000000 && (
                <p className="text-xs text-yellow-400 mt-1">
                  Large limit set ({parseFloat(maxAda).toLocaleString()} {currencyLabel}). Consider if this is
                  intentional.
                </p>
              )}
            </>
          ) : (
            <div className="p-3 bg-steel-700 rounded-lg">
              <p className="text-sm text-gray-300">
                Unlimited {currencyLabel} can be accepted until duration ends or governance closes the vault
              </p>
            </div>
          )}
        </div>

        {/* Price Type */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">VT Price per {currencyLabel}*</label>
          <LavaSteelSelect options={priceTypeOptions} value={priceType} onChange={setPriceType} />

          {priceType === 'limit' && (
            <div className="mt-3">
              <label className="flex items-center gap-1.5 text-sm font-medium text-gray-300 mb-2">
                Limit Price (VT per 1 {currencyLabel})
                <HoverHelp
                  hint={`Fixed amount of vault tokens contributors will receive per 1 ${currencyLabel} (max: 1,000,000 VT)`}
                />
              </label>
              <LavaSteelInput
                type="number"
                step={Math.pow(10, 6 - (vault?.ftTokenDecimals || 6))}
                min={Math.pow(10, 6 - (vault?.ftTokenDecimals || 6))}
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
                placeholder={`Enter VT per 1 ${currencyLabel} (up to 6 decimals, max 1M)`}
                error={error && !limitPrice}
              />
              {error && !limitPrice && <p className="text-red-500 text-sm mt-1">Limit price is required</p>}
              {(() => {
                const decimals = vault?.ftTokenDecimals || 6;
                const minLimitPrice = Math.pow(10, 6 - decimals);
                const limitPriceNum = parseFloat(limitPrice) || 0;

                if (limitPrice && limitPriceNum > 0 && limitPriceNum < minLimitPrice) {
                  return (
                    <div className="mt-2 p-3 bg-red-900/20 border border-red-600/50 rounded">
                      <p className="text-red-400 text-sm font-medium">⚠️ Price Too Low</p>
                      <p className="text-red-300/90 text-xs mt-1">
                        With {decimals} decimals, minimum limit price is {minLimitPrice} VT per 1 {currencyLabel}. Lower
                        values would result in 0 tokens minted.
                      </p>
                    </div>
                  );
                }

                if (limitPrice && limitPriceNum > 0) {
                  return (
                    <div className="mt-2 p-3 bg-steel-800 rounded">
                      <p className="text-xs text-gray-400">Example calculation:</p>
                      <p className="text-sm text-primary font-mono mt-1">
                        {exampleContributionAmount} {currencyLabel} ={' '}
                        {(limitPriceNum * exampleContributionAmount).toLocaleString()} VT
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Min: {minLimitPrice} VT/{currencyLabel}
                      </p>
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
                  Contributors will receive VT based on the current market price
                  {isEvmVault ? ' from Uniswap' : ' from the Liquidity Pool'}:
                </p>
                <div className="p-3 bg-steel-800 rounded font-mono text-sm text-primary">
                  VT Amount = {currencyLabel} Sent x (Current VT/{currencyLabel} Price from{' '}
                  {isEvmVault ? 'Uniswap' : 'LP'})
                </div>
                <p className="text-xs text-gray-400">
                  {isEvmVault
                    ? `VT price is fetched from the Uniswap pool on Robinhood Chain at cycle close time`
                    : `This ensures contributors receive VT at fair market value based on DEX prices (DexHunter, Taptools)`}
                </p>
              </div>
              {!vault?.hasActiveLp && (
                <div className="p-3 bg-yellow-900/20 border border-yellow-600/50 rounded-lg">
                  <p className="text-yellow-400 text-sm font-medium">⚠️ Market Pricing Requirements:</p>
                  <p className="text-yellow-300/90 text-xs mt-1">
                    {isEvmVault
                      ? `This vault does not have an active Uniswap pool. Market pricing requires a VT pool with liquidity. Please use Limit Price instead.`
                      : `This vault does not have an active Liquidity Pool on DEXes. Market pricing requires an active LP with at least 1,000 ${currencyLabel} in liquidity. Please use Limit Price instead, or create an LP first.`}
                  </p>
                </div>
              )}
              {vault?.hasActiveLp && vault?.vtPrice && (
                <div className="p-3 bg-primary/10 border border-primary/30 rounded-lg">
                  <p className="text-primary text-sm font-medium">✓ {isEvmVault ? 'Uniswap Pool' : 'LP'} Detected</p>
                  <p className="text-gray-300 text-xs mt-1">
                    Current VT Price: {vault.vtPrice.toFixed(6)} {currencyLabel} per VT
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    Example: {exampleContributionAmount} {currencyLabel} = ~
                    {(exampleContributionAmount / vault.vtPrice).toFixed(2)} VT (at current price)
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
              <span className="text-gray-400">Max {currencyLabel}:</span>{' '}
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

        {isEvmVault && (
          <ProposalOutcome storageKey="acquire-expansion" summary={evmOutcome.summary} steps={evmOutcome.steps} />
        )}
      </div>
    </div>
  );
}

const formatCount = n =>
  n >= 1
    ? n.toLocaleString('en', { maximumFractionDigits: 2 })
    : new Intl.NumberFormat('en', { maximumSignificantDigits: 4 }).format(n);

const formatDuration = ms => {
  if (!ms) return null;
  const d = Math.floor(ms / 86400000);
  const h = Math.floor((ms % 86400000) / 3600000);
  return [d ? `${d} day${d === 1 ? '' : 's'}` : null, h ? `${h} h` : null].filter(Boolean).join(' ') || 'under an hour';
};

/** Robinhood acquire expansion, step by step, from the values entered so far. */
function buildEvmOutcome({ duration, maxEth, noMax, price, supply, ticker }) {
  const durationText = formatDuration(duration);
  const vt = ticker || 'VT';
  const newVtAtMax = !noMax && maxEth > 0 && price > 0 ? maxEth * price : null;
  const dilutionPct = newVtAtMax && supply > 0 ? (newVtAtMax / (supply + newVtAtMax)) * 100 : null;

  const steps = [
    {
      title: durationText ? `The vault opens for ${durationText}.` : 'The vault opens for the set duration.',
      detail: 'The window starts when the vote passes. It ends at that time, or earlier if the ETH maximum is reached.',
    },
    {
      title: price > 0 ? `Buyers get ${formatCount(price)} ${vt} per 1 ETH.` : 'Buyers get VT at the limit price.',
      detail: 'Anyone can send ETH while the window is open. The price is fixed by this proposal.',
    },
    {
      title: !noMax && maxEth > 0 ? `At most ${formatCount(maxEth)} ETH is accepted.` : 'No ETH maximum.',
      detail:
        !noMax && maxEth > 0
          ? 'Contributions that would go over it are refused. Once it is reached, the window closes ' +
            'within minutes (at most ~15 minutes, while started contributions finish) and the new VT is minted to buyers.'
          : 'The window takes any amount of ETH until it ends.',
    },
    {
      title: 'Current holders are diluted.',
      detail:
        newVtAtMax != null
          ? `If the maximum is reached, ${formatCount(newVtAtMax)} new ${vt} are minted` +
            (dilutionPct != null ? `, about ${formatCount(dilutionPct)}% of the supply after the raise.` : '.') +
            ' The ETH raised stays in the vault.'
          : `New ${vt} is minted for every ETH raised. The ETH raised stays in the vault.`,
    },
  ];
  const summary =
    price > 0 && !noMax && maxEth > 0
      ? `Sells up to ${formatCount(newVtAtMax)} new ${vt} at ${formatCount(price)} ${vt}/ETH for up to ${formatCount(maxEth)} ETH${durationText ? ` over ${durationText}` : ''}.`
      : `Opens the vault to buyers at a fixed ${vt}/ETH price${durationText ? ` for ${durationText}` : ''}.`;
  return { steps, summary };
}
