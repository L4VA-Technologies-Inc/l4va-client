import { Plus } from 'lucide-react';
import { useEffect, useRef, useMemo } from 'react';

import { AssetSearchInput } from '@/components/shared/AssetSearchInput';
import { LavaInput, LavaSteelInput } from '@/components/shared/LavaInput';
import { LavaRadio } from '@/components/shared/LavaRadio';
import { LavaCheckbox } from '@/components/shared/LavaCheckbox';
import { useAssetSource } from '@/hooks/useAssetSource';
import { cn } from '@/lib/utils';

const variants = {
  default: {
    dropdown: 'fixed z-[200] bg-steel-800 border border-steel-600 rounded-lg shadow-lg overflow-y-auto',
    policyInputClassName: 'pr-20',
    policyInputStyle: { fontSize: '20px' },
    addButton: 'border-2 border-white/20 rounded-lg p-2',
    itemSpacing: 'space-y-6',
  },
  steel: {
    dropdown: 'fixed z-[200] bg-steel-850 border border-steel-750 rounded-lg shadow-lg overflow-y-auto',
    policyInputClassName: 'pr-20',
    policyInputStyle: undefined,
    addButton: 'border border-steel-750 rounded-lg p-2',
    itemSpacing: 'space-y-4',
  },
};

export const LavaWhitelistWithCaps = ({
  required = false,
  label = 'Asset whitelist',
  hideLabel = false,
  itemPlaceholder = 'Search collection or paste Policy ID',
  whitelist = [],
  setWhitelist,
  maxItems = 10,
  errors = {},
  maxCapValue = 1000000000000, // 1 Trillion
  variant = 'default',
  isExpandable = false,
  onExpandableChange,
  reservedPolicyIds = [],
  showCountCaps = true,
}) => {
  const styles = variants[variant];
  const isSteel = variant === 'steel';
  // Shared column template so the header row and every asset row line up like a table.
  const tableGridCols = 'grid-cols-1 md:grid-cols-[minmax(260px,2fr)_repeat(3,minmax(0,1fr))]';

  const renderInput = ({ onChange, onBlur, style, ...rest }) => {
    if (isSteel) {
      return (
        <LavaSteelInput
          {...rest}
          onChange={onChange ? value => onChange({ target: { value } }) : undefined}
          onBlur={onBlur}
        />
      );
    }
    return <LavaInput {...rest} style={style} onChange={onChange} onBlur={onBlur} />;
  };
  const rowRefs = useRef({});
  const pendingFocusIdRef = useRef(null);

  // One shared source for every row: each `useAssetSource()` owns its paging
  // state and fires its own wallet requests, so the rows must not each resolve
  // their own.
  const assetSource = useAssetSource();
  const { isRobinHood, lookupPolicies } = assetSource;
  const walletPolicyIds = assetSource.policies;

  const reservedPolicyIdSet = useMemo(
    () => new Set(reservedPolicyIds.map(policyId => policyId?.toLowerCase()).filter(Boolean)),
    [reservedPolicyIds]
  );

  const getUsedPolicyIds = currentUniqueId =>
    new Set([
      ...reservedPolicyIdSet,
      ...whitelist
        .filter(item => item.uniqueId !== currentUniqueId && item.policyId)
        .map(item => item.policyId.toLowerCase()),
    ]);

  // Items loaded from a draft (or API) may not have a uniqueId, which causes all
  // dropdowns to share the same undefined key and open simultaneously. Assign stable
  // IDs in a single pass before any interaction can occur.
  useEffect(() => {
    const hasItemsWithoutId = whitelist.some(item => item && !item.uniqueId);
    if (!hasItemsWithoutId) return;

    setWhitelist(
      whitelist.map((item, idx) => (item && !item.uniqueId ? { ...item, uniqueId: Date.now() + idx } : item))
    );
  }, [whitelist, setWhitelist]);

  const handleInputChange = (uniqueId, value) => {
    updateAsset(uniqueId, 'policyId', value, {
      name: '',
      assetName: '',
      count: 1,
      collectionName: null,
      isVerified: null,
      verificationPlatform: null,
      imageUrl: null,
      image: null,
    });
  };

  const selectPolicyId = (uniqueId, policy) => {
    updateAsset(uniqueId, 'policyId', policy.policyId, {
      name: policy.name || '',
      assetName: policy.assetName || '',
      count: policy.count || 1,
      collectionName: policy.collectionName ?? null,
      isVerified: policy.isVerified ?? false,
      verificationPlatform: policy.verificationPlatform ?? null,
      imageUrl: policy.imageUrl ?? policy.image ?? null,
      image: policy.image ?? policy.imageUrl ?? null,
    });
  };

  // Backfill verification data for pre-populated items (e.g. edit draft)
  // so validation and badges work without re-selecting each policy.
  // Uses a single batch lookupPolicies call instead of N parallel searchPolicies
  // calls (each of which would fetch all wallet assets, causing N × 40+ API lookups).
  useEffect(() => {
    const assetsNeedingVerification = whitelist.filter(
      asset =>
        asset &&
        asset.policyId &&
        /^[0-9a-fA-F]{56}$/.test(asset.policyId) &&
        (asset.isVerified === undefined || asset.isVerified === null)
    );

    if (assetsNeedingVerification.length === 0) return;

    let isCancelled = false;

    const backfillVerification = async () => {
      try {
        const updatesByUniqueId = {};

        // Resolve from already-loaded wallet data first (no API call needed)
        const needsApiLookup = [];
        for (const asset of assetsNeedingVerification) {
          const localMatch = walletPolicyIds.find(policy => policy.policyId === asset.policyId);
          if (localMatch) {
            updatesByUniqueId[asset.uniqueId] = {
              isVerified: localMatch.isVerified ?? false,
              collectionName: localMatch.collectionName ?? asset.collectionName ?? null,
              verificationPlatform: localMatch.verificationPlatform ?? null,
              name: localMatch.name || asset.name || '',
              assetName: localMatch.assetName || asset.assetName || '',
              count: localMatch.count || asset.count || 1,
              isLpToken: localMatch.isLpToken ?? false,
              imageUrl: localMatch.imageUrl ?? asset.imageUrl ?? asset.image ?? null,
              image: localMatch.image ?? localMatch.imageUrl ?? asset.image ?? asset.imageUrl ?? null,
            };
          } else {
            needsApiLookup.push(asset);
          }
        }

        // Single batch API call for all remaining assets instead of N parallel calls
        if (needsApiLookup.length > 0) {
          const results = await lookupPolicies(needsApiLookup.map(a => a.policyId));
          needsApiLookup.forEach((asset, index) => {
            const result = results[index];
            if (!result) return;
            updatesByUniqueId[asset.uniqueId] = {
              isVerified: result.isVerified ?? false,
              collectionName: result.collectionName ?? asset.collectionName ?? null,
              verificationPlatform: result.verificationPlatform ?? null,
              name: result.name || asset.name || '',
              assetName: result.assetName || asset.assetName || '',
              count: result.count || asset.count || 1,
              isLpToken: result.isLpToken ?? false,
              imageUrl: result.imageUrl ?? asset.imageUrl ?? asset.image ?? null,
              image: result.image ?? result.imageUrl ?? asset.image ?? asset.imageUrl ?? null,
            };
          });
        }

        if (isCancelled || Object.keys(updatesByUniqueId).length === 0) return;

        const nextWhitelist = whitelist.map(asset => {
          const update = updatesByUniqueId[asset.uniqueId];
          if (!update || (asset.isVerified !== undefined && asset.isVerified !== null)) return asset;

          const updatedAsset = {
            ...asset,
            ...update,
            policyName: update.name || asset.policyName || 'N/A',
          };

          // LP token detection should override any previously selected non-LP valuation method
          if (update.isLpToken) {
            updatedAsset.valuationMethod = 'lp_token_dynamic';
          }

          return updatedAsset;
        });

        const hasChanges = nextWhitelist.some((asset, index) => asset !== whitelist[index]);
        if (hasChanges) {
          setWhitelist(nextWhitelist);
        }
      } catch (error) {
        console.error('Error backfilling asset verification:', error);
      }
    };

    backfillVerification();

    return () => {
      isCancelled = true;
    };
  }, [whitelist, walletPolicyIds, lookupPolicies, setWhitelist]);

  // EVM equivalent of the backfill above. EVM contract addresses (0x + 40 hex)
  // never match the Cardano policy-id regex, so resolve them here: pull metadata
  // and verification (Blockscout's reputation signal) from the held/chain-wide
  // token list. This also lets users paste any contract address manually and
  // have it looked up.
  useEffect(() => {
    if (!isRobinHood) return;

    const assetsNeedingVerification = whitelist.filter(
      asset =>
        asset &&
        asset.policyId &&
        /^0x[0-9a-fA-F]{40}$/.test(asset.policyId) &&
        (asset.isVerified === undefined || asset.isVerified === null)
    );

    if (assetsNeedingVerification.length === 0) return;

    let isCancelled = false;

    const backfillEvmVerification = async () => {
      try {
        const results = await lookupPolicies(assetsNeedingVerification.map(a => a.policyId));
        if (isCancelled) return;

        const updatesByUniqueId = {};
        assetsNeedingVerification.forEach((asset, index) => {
          const result = results[index];
          updatesByUniqueId[asset.uniqueId] = {
            isVerified: result?.isVerified ?? false,
            collectionName: result?.collectionName ?? asset.collectionName ?? null,
            name: result?.name || asset.name || '',
            assetName: result?.assetName || asset.assetName || '',
            count: result?.count || asset.count || 1,
            imageUrl: result?.imageUrl ?? asset.imageUrl ?? asset.image ?? null,
            image: result?.image ?? result?.imageUrl ?? asset.image ?? asset.imageUrl ?? null,
          };
        });

        const nextWhitelist = whitelist.map(asset => {
          const update = updatesByUniqueId[asset.uniqueId];
          if (!update || (asset.isVerified !== undefined && asset.isVerified !== null)) return asset;
          return {
            ...asset,
            ...update,
            verificationPlatform: null,
            policyName: update.name || asset.policyName || 'N/A',
          };
        });

        const hasChanges = nextWhitelist.some((asset, index) => asset !== whitelist[index]);
        if (hasChanges) {
          setWhitelist(nextWhitelist);
        }
      } catch (error) {
        console.error('Error backfilling EVM asset verification:', error);
      }
    };

    backfillEvmVerification();

    return () => {
      isCancelled = true;
    };
  }, [isRobinHood, whitelist, lookupPolicies, setWhitelist]);

  const handleRemoveOrClear = uniqueId => {
    const asset = whitelist.find(item => item.uniqueId === uniqueId);

    if (asset && asset.policyId) {
      updateAsset(uniqueId, 'policyId', '', {
        name: '',
        assetName: '',
        count: 1,
        collectionName: null,
        isVerified: null,
        verificationPlatform: null,
        imageUrl: null,
        image: null,
      });
    } else {
      const filteredAssets = whitelist.filter(asset => asset.uniqueId !== uniqueId);
      setWhitelist(filteredAssets);
    }
  };

  const addNewAsset = () => {
    if (whitelist.length >= maxItems) return;
    const uniqueId = Date.now();
    const newAsset = {
      policyId: '',
      assetName: '',
      name: '',
      count: 1,
      policyName: 'N/A',
      collectionName: null,
      isVerified: null,
      verificationPlatform: null,
      imageUrl: null,
      image: null,
      valuationMethod: 'market',
      customPriceAda: null,
      uniqueId,
    };

    if (showCountCaps) {
      newAsset.countCapMin = 1;
      newAsset.countCapMax = Math.min(1000, maxCapValue);
    }

    pendingFocusIdRef.current = uniqueId;
    setWhitelist([...whitelist, newAsset]);
  };

  // After "Add another", scroll the new row into view and focus its search field.
  useEffect(() => {
    const uniqueId = pendingFocusIdRef.current;
    if (!uniqueId) return;

    pendingFocusIdRef.current = null;
    const row = rowRefs.current[uniqueId];
    if (!row) return;

    row.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const input = row.querySelector('input');
    if (input) {
      // Wait a tick so scroll starts before focus steals attention on mobile.
      requestAnimationFrame(() => input.focus({ preventScroll: true }));
    }
  }, [whitelist]);

  const updateAsset = (uniqueId, field, val, policyData = {}) => {
    const updatedAssets = whitelist.map(asset =>
      asset.uniqueId === uniqueId
        ? {
            ...asset,
            [field]: val,
            ...(policyData.name !== undefined && { name: policyData.name }),
            ...(policyData.name !== undefined && { policyName: policyData.name || 'N/A' }),
            ...(policyData.assetName !== undefined && { assetName: policyData.assetName }),
            ...(policyData.count !== undefined && { count: policyData.count }),
            ...(policyData.collectionName !== undefined && { collectionName: policyData.collectionName }),
            ...(policyData.isVerified !== undefined && { isVerified: policyData.isVerified }),
            ...(policyData.verificationPlatform !== undefined && {
              verificationPlatform: policyData.verificationPlatform,
            }),
            ...(policyData.imageUrl !== undefined && { imageUrl: policyData.imageUrl }),
            ...(policyData.image !== undefined && { image: policyData.image }),
          }
        : asset
    );
    setWhitelist(updatedAssets);
  };

  return (
    <div className="w-full">
      {!hideLabel && (
        <div className="flex items-center justify-between mb-4">
          <div className="uppercase font-bold mb-2">
            {required ? '*' : ''}
            {label}
          </div>
          <button
            className={cn(styles.addButton, whitelist.length >= maxItems && 'opacity-50 cursor-not-allowed')}
            disabled={whitelist.length >= maxItems}
            type="button"
            onClick={addNewAsset}
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      )}
      {hideLabel && (
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-dark-100">
            {whitelist.filter(item => item?.policyId).length}/{maxItems} collections added
          </span>
          <button
            className={cn(
              'inline-flex items-center gap-2 text-sm text-white hover:text-orange-400 transition-colors',
              whitelist.length >= maxItems && 'opacity-50 cursor-not-allowed'
            )}
            disabled={whitelist.length >= maxItems}
            type="button"
            onClick={addNewAsset}
          >
            <Plus className="h-4 w-4" />
            Add another
          </button>
        </div>
      )}
      {onExpandableChange && (
        <div className="mb-4">
          <LavaCheckbox
            checked={Boolean(isExpandable)}
            description="Allows the vault whitelist to be expanded after creation."
            label="Expandable whitelist"
            name="isExpandable"
            onChange={e => onExpandableChange(e.target.checked)}
          />
        </div>
      )}
      <div className={cn(whitelist.length > 0 && 'border border-white/10 rounded-lg divide-y divide-white/10')}>
        {showCountCaps && whitelist.length > 0 && (
          <div className={cn('hidden md:grid gap-4 p-4 bg-steel-800/40', tableGridCols)}>
            <div>
              <span className="uppercase font-bold text-sm text-dark-100">*Collection</span>
              <p className="text-xs text-dark-100/70 mt-1 font-normal normal-case">Pick from wallet or search</p>
            </div>
            <div>
              <span className="uppercase font-bold text-sm text-dark-100">*Min cap</span>
              <p className="text-xs text-dark-100/70 mt-1 font-normal normal-case">Minimum units needed</p>
            </div>
            <div>
              <span className="uppercase font-bold text-sm text-dark-100">*Max cap</span>
              <p className="text-xs text-dark-100/70 mt-1 font-normal normal-case">Maximum units accepted</p>
            </div>
            <div>
              <span className="uppercase font-bold text-sm text-dark-100">*Valuation</span>
              <p className="text-xs text-dark-100/70 mt-1 font-normal normal-case">How this asset is priced</p>
            </div>
          </div>
        )}
        {whitelist.map((asset, index) => {
          return (
            <div
              key={asset.id || asset.uniqueId || `asset-${index}`}
              ref={el => {
                rowRefs.current[asset.uniqueId] = el;
              }}
              className={cn('p-4 grid gap-4 items-start', showCountCaps ? tableGridCols : 'grid-cols-1')}
            >
              <div className={styles.itemSpacing}>
                <AssetSearchInput
                  excludePolicyIds={[...getUsedPolicyIds(asset.uniqueId)]}
                  placeholder={itemPlaceholder}
                  source={assetSource}
                  value={asset}
                  variant={variant}
                  onChange={text => handleInputChange(asset.uniqueId, text)}
                  onClear={() => handleRemoveOrClear(asset.uniqueId)}
                  onSelect={policy => selectPolicyId(asset.uniqueId, policy)}
                />
                {(() => {
                  const rowIndex = whitelist.findIndex(item => item.uniqueId === asset.uniqueId);
                  const policyIdError = errors[`assetsWhitelist[${rowIndex}].policyId`];
                  return policyIdError ? <p className="text-red-600 text-sm mt-1">{policyIdError}</p> : null;
                })()}
                {(() => {
                  const rowIndex = whitelist.findIndex(item => item.uniqueId === asset.uniqueId);
                  const policyIdError = errors[`assetsWhitelist[${rowIndex}].policyId`];
                  if (policyIdError) return null;
                  const verifiedError = errors[`assetsWhitelist[${rowIndex}].isVerified`];
                  return verifiedError ? <p className="text-red-600 text-sm mt-1">{verifiedError}</p> : null;
                })()}
              </div>

              {showCountCaps && (
                <>
                  <div>
                    <span className="md:hidden uppercase font-bold text-sm text-dark-100">*Min cap</span>
                    <p className="md:hidden text-xs text-dark-100/70 mb-1">Minimum units needed</p>
                    {renderInput({
                      required: true,
                      type: 'text',
                      pattern: '[0-9]*',
                      style: isSteel ? undefined : { fontSize: '20px' },
                      value: asset.countCapMin,
                      onChange: e => {
                        const inputValue = e.target.value;
                        const numericValue = Number(inputValue.replace(/,/g, ''));
                        if (inputValue === '' || (!isNaN(numericValue) && numericValue <= maxCapValue)) {
                          updateAsset(asset.uniqueId, 'countCapMin', inputValue);
                        }
                      },
                      onBlur: e =>
                        updateAsset(
                          asset.uniqueId,
                          'countCapMin',
                          e.target.value === '' ? 1 : Number(e.target.value.replace(/,/g, ''))
                        ),
                      hint: `Maximum value: ${maxCapValue.toLocaleString()}`,
                    })}
                    {(() => {
                      const rowIndex = whitelist.findIndex(item => item.uniqueId === asset.uniqueId);
                      return (
                        <p className="text-red-600 text-sm mt-1">
                          {errors[`assetsWhitelist[${rowIndex}].countCapMin`]}
                        </p>
                      );
                    })()}
                  </div>

                  <div>
                    <span className="md:hidden uppercase font-bold text-sm text-dark-100">*Max cap</span>
                    <p className="md:hidden text-xs text-dark-100/70 mb-1">Maximum units accepted</p>
                    {renderInput({
                      required: true,
                      value: asset.countCapMax,
                      onChange: e => {
                        const inputValue = e.target.value;
                        const numericValue = Number(inputValue.replace(/,/g, ''));
                        if (inputValue === '' || (!isNaN(numericValue) && numericValue <= maxCapValue)) {
                          updateAsset(asset.uniqueId, 'countCapMax', inputValue);
                        }
                      },
                      onBlur: e => {
                        const rawValue = e.target.value === '' ? 1000 : Number(e.target.value.replace(/,/g, ''));
                        const limitedValue = Math.min(rawValue, maxCapValue);
                        updateAsset(asset.uniqueId, 'countCapMax', limitedValue);
                      },
                      hint: `Maximum value: ${maxCapValue.toLocaleString()}`,
                    })}
                    {(() => {
                      const rowIndex = whitelist.findIndex(item => item.uniqueId === asset.uniqueId);
                      return (
                        <p className="text-red-600 text-sm mt-1">
                          {errors[`assetsWhitelist[${rowIndex}].countCapMax`]}
                        </p>
                      );
                    })()}
                  </div>

                  <div>
                    <span className="md:hidden uppercase font-bold text-sm text-dark-100 block">*Valuation</span>
                    <p className="md:hidden text-xs text-dark-100/70 mb-2">How this asset is priced</p>
                    <LavaRadio
                      name={`valuationMethod_${asset.uniqueId}`}
                      options={
                        asset.isLpToken
                          ? [{ name: 'lp_token_dynamic', label: 'LP Token Price' }]
                          : [
                              { name: 'market', label: 'Market / Floor Price' },
                              ...(isRobinHood ? [] : [{ name: 'custom', label: 'Custom Price' }]),
                            ]
                      }
                      value={asset.isLpToken ? 'lp_token_dynamic' : asset.valuationMethod || 'market'}
                      onChange={value => {
                        if (!asset.isLpToken) {
                          updateAsset(asset.uniqueId, 'valuationMethod', value);
                        }
                      }}
                      disabled={asset.isLpToken}
                    />
                    {asset.isLpToken && (
                      <p className="text-xs text-gray-400 mt-1 ml-6">Price = Pool TVL ÷ Total LP Token Supply</p>
                    )}
                    {(() => {
                      const rowIndex = whitelist.findIndex(item => item.uniqueId === asset.uniqueId);
                      return (
                        <p className="text-red-600 text-sm mt-1">
                          {errors[`assetsWhitelist[${rowIndex}].valuationMethod`]}
                        </p>
                      );
                    })()}
                  </div>

                  {asset.valuationMethod === 'custom' && !asset.isLpToken && !isRobinHood && (
                    <div className="md:col-span-4 max-w-xs">
                      {renderInput({
                        required: true,
                        label: 'Custom Price (ADA)',
                        type: 'text',
                        placeholder: 'Enter price in ADA',
                        style: isSteel ? undefined : { fontSize: '20px' },
                        value: asset.customPriceAda || '',
                        onChange: e => {
                          const inputValue = e.target.value;
                          if (inputValue === '' || /^\d*\.?\d*$/.test(inputValue)) {
                            updateAsset(asset.uniqueId, 'customPriceAda', inputValue);
                          }
                        },
                        onBlur: e => {
                          const rawValue = e.target.value === '' ? 10 : Number(e.target.value.replace(/,/g, ''));
                          const limitedValue = Math.min(rawValue, maxCapValue);
                          updateAsset(asset.uniqueId, 'customPriceAda', limitedValue);
                        },
                        hint: 'The custom ADA price for this policy',
                      })}
                      {(() => {
                        const rowIndex = whitelist.findIndex(item => item.uniqueId === asset.uniqueId);
                        return (
                          <p className="text-red-600 text-sm mt-1">
                            {errors[`assetsWhitelist[${rowIndex}].customPriceAda`]}
                          </p>
                        );
                      })()}
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
      {!whitelist.length && (
        <div className="text-dark-100 text-base my-4">No items. Click the + button to add one.</div>
      )}
      {whitelist.length >= maxItems && (
        <div className="text-red-600 text-base my-4">Maximum number of items ({maxItems}) reached.</div>
      )}
    </div>
  );
};
