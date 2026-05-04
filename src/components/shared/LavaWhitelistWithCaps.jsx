import { X, Plus, ChevronDown, ChevronUp, Loader2, ShieldCheck, ShieldAlert } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useWallet } from '@ada-anvil/weld/react';
import toast from 'react-hot-toast';

import { Button } from '@/components/ui/button';
import { LavaInput } from '@/components/shared/LavaInput';
import { LavaRadio } from '@/components/shared/LavaRadio';
import { getVerificationPlatformLabel, useAssets } from '@/hooks/useAssets';

export const LavaWhitelistWithCaps = ({
  required = false,
  label = 'Asset whitelist',
  itemPlaceholder = '*Enter Policy ID',
  whitelist = [],
  setWhitelist,
  maxItems = 10,
  errors = {},
  maxCapValue = 1000000000000, // 1 Trillion
}) => {
  const [showDropdown, setShowDropdown] = useState({});
  const [searchResults, setSearchResults] = useState({});
  const [isSearching, setIsSearching] = useState({});
  const dropdownRefs = useRef({});
  const searchTimers = useRef({});
  const wallet = useWallet('handler', 'isConnected', 'balanceAda', 'changeAddressBech32');

  const { data, hasMore, isLoadingMore, loadMore, searchPolicies, lookupPolicies, allPolicies, isBalanceLoaded } =
    useAssets();

  const walletPolicyIds = data?.data || [];

  useEffect(() => {
    const handleClickOutside = event => {
      Object.keys(showDropdown).forEach(uniqueId => {
        if (showDropdown[uniqueId] && dropdownRefs.current[uniqueId]) {
          if (!dropdownRefs.current[uniqueId].contains(event.target)) {
            setShowDropdown(prev => ({ ...prev, [uniqueId]: false }));
          }
        }
      });
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  // Cleanup search timers on unmount
  useEffect(() => {
    return () => {
      Object.values(searchTimers.current).forEach(timer => clearTimeout(timer));
    };
  }, []);

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

  // When the wallet balance first loads, remove any whitelist items whose policy ID
  // is no longer held by the user (e.g. they spent those NFTs since saving the draft).
  // We only run this once per mount (tracked by hasFilteredStaleRef) and only after
  // there are actual whitelist items to check (wallet may load before draft data).
  const hasFilteredStaleRef = useRef(false);
  useEffect(() => {
    if (!isBalanceLoaded) return;
    if (whitelist.length === 0) return;
    if (hasFilteredStaleRef.current) return;
    hasFilteredStaleRef.current = true;

    const walletPolicyIdSet = new Set(allPolicies.map(p => p.policyId));

    const filtered = whitelist.filter(
      item => !item?.policyId || !/^[0-9a-fA-F]{56}$/.test(item.policyId) || walletPolicyIdSet.has(item.policyId)
    );

    if (filtered.length < whitelist.length) {
      const removedCount = whitelist.length - filtered.length;
      setWhitelist(filtered);
      toast(
        `${removedCount} asset${removedCount > 1 ? 's were' : ' was'} removed from the whitelist because ${removedCount > 1 ? "they're" : "it's"} no longer in your wallet.`,
        { icon: '⚠️', duration: 5000 }
      );
    }
  }, [isBalanceLoaded, allPolicies, whitelist, setWhitelist]);

  const handleScroll = useCallback(
    (e, uniqueId) => {
      const asset = whitelist.find(item => item.uniqueId === uniqueId);
      const isSearchMode = asset && asset.policyId;

      if (!isSearchMode) {
        const { scrollTop, scrollHeight, clientHeight } = e.target;
        if (scrollHeight - scrollTop - clientHeight < 60 && hasMore && !isLoadingMore) {
          loadMore();
        }
      }
    },
    [hasMore, isLoadingMore, loadMore, whitelist]
  );

  const getFilteredBrowseList = currentUniqueId => {
    const usedPolicyIds = new Set(
      whitelist.filter(item => item.uniqueId !== currentUniqueId && item.policyId).map(item => item.policyId)
    );
    return walletPolicyIds.filter(policy => !usedPolicyIds.has(policy.policyId));
  };

  const getFilteredSearchResults = currentUniqueId => {
    const usedPolicyIds = new Set(
      whitelist.filter(item => item.uniqueId !== currentUniqueId && item.policyId).map(item => item.policyId)
    );
    const results = searchResults[currentUniqueId] || [];
    return results.filter(policy => !usedPolicyIds.has(policy.policyId));
  };

  const triggerSearch = useCallback(
    (uniqueId, query) => {
      if (searchTimers.current[uniqueId]) {
        clearTimeout(searchTimers.current[uniqueId]);
      }

      if (!query) {
        setSearchResults(prev => ({ ...prev, [uniqueId]: [] }));
        setIsSearching(prev => ({ ...prev, [uniqueId]: false }));
        return;
      }

      setIsSearching(prev => ({ ...prev, [uniqueId]: true }));

      // Debounce 300ms
      searchTimers.current[uniqueId] = setTimeout(async () => {
        try {
          const results = await searchPolicies(query);
          setSearchResults(prev => ({ ...prev, [uniqueId]: results }));
        } catch (error) {
          console.error('Search error:', error);
          setSearchResults(prev => ({ ...prev, [uniqueId]: [] }));
        } finally {
          setIsSearching(prev => ({ ...prev, [uniqueId]: false }));
        }
      }, 300);
    },
    [searchPolicies]
  );

  const handleInputChange = (uniqueId, value) => {
    updateAsset(uniqueId, 'policyId', value, {
      name: '',
      assetName: '',
      count: 1,
      collectionName: null,
      isVerified: null,
      verificationPlatform: null,
    });
    triggerSearch(uniqueId, value);

    if (value) {
      setShowDropdown(prev => ({ ...prev, [uniqueId]: true }));
    }
  };

  const selectPolicyId = (uniqueId, policy) => {
    updateAsset(uniqueId, 'policyId', policy.policyId, {
      name: policy.name || '',
      assetName: policy.assetName || '',
      count: policy.count || 1,
      collectionName: policy.collectionName ?? null,
      isVerified: policy.isVerified ?? false,
      verificationPlatform: policy.verificationPlatform ?? null,
    });
    setShowDropdown(prev => ({ ...prev, [uniqueId]: false }));
    setSearchResults(prev => ({ ...prev, [uniqueId]: [] }));
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

  const toggleDropdown = uniqueId => {
    const willOpen = !showDropdown[uniqueId];
    setShowDropdown(prev => ({ ...prev, [uniqueId]: willOpen }));

    if (willOpen) {
      const asset = whitelist.find(item => item.uniqueId === uniqueId);
      if (asset && asset.policyId) {
        triggerSearch(uniqueId, asset.policyId);
      }
    }
  };

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
      });
      setSearchResults(prev => ({ ...prev, [uniqueId]: [] }));
    } else {
      const filteredAssets = whitelist.filter(asset => asset.uniqueId !== uniqueId);
      setWhitelist(filteredAssets);
    }
  };

  const addNewAsset = () => {
    if (whitelist.length >= maxItems) return;
    const newAssets = [
      ...whitelist,
      {
        policyId: '',
        assetName: '',
        name: '',
        count: 1,
        countCapMin: 1,
        policyName: 'N/A',
        collectionName: null,
        isVerified: null,
        verificationPlatform: null,
        countCapMax: Math.min(1000, maxCapValue),
        valuationMethod: 'market',
        customPriceAda: null,
        uniqueId: Date.now(),
      },
    ];
    setWhitelist(newAssets);
  };

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
          }
        : asset
    );
    setWhitelist(updatedAssets);
  };

  const renderAssetItem = (asset, policy) => {
    const searchText = asset.policyId.toLowerCase();
    const highlightText = (text, search) => {
      if (!search || !text) return text;
      try {
        const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
        return parts.map((part, i) =>
          part.toLowerCase() === search.toLowerCase() ? (
            <span key={i} className="bg-yellow-500 text-black">
              {part}
            </span>
          ) : (
            part
          )
        );
      } catch {
        return text;
      }
    };

    const displayName = policy.collectionName || policy.name;
    const isVerified = policy.isVerified;
    const verificationBadgeLabel = getVerificationPlatformLabel(policy.verificationPlatform);

    return (
      <button
        key={`${policy.policyId}-${policy.name}`}
        type="button"
        disabled={!isVerified}
        className={`w-full px-4 py-2 text-left flex items-center gap-3 border-b border-steel-700 last:border-b-0 ${
          isVerified ? 'hover:bg-steel-700 cursor-pointer' : 'opacity-50 cursor-not-allowed'
        }`}
        onClick={isVerified ? () => selectPolicyId(asset.uniqueId, policy) : undefined}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="font-medium text-white truncate">{highlightText(displayName, searchText)}</div>
            {isVerified ? (
              <span className="inline-flex items-center gap-1 text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full border border-green-500/30 shrink-0">
                <ShieldCheck className="h-3 w-3" />
                {verificationBadgeLabel ? `Verified · ${verificationBadgeLabel}` : 'Verified'}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full border border-orange-500/30 shrink-0">
                <ShieldAlert className="h-3 w-3" />
                Unverified
              </span>
            )}
          </div>
          <div className="text-sm text-gray-400 truncate font-mono">{highlightText(policy.policyId, searchText)}</div>
        </div>
      </button>
    );
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="uppercase font-bold mb-2">
          {required ? '*' : ''}
          {label}
        </div>
        <button
          className={`border-2 border-white/20 rounded-lg p-2 ${whitelist.length >= maxItems ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={whitelist.length >= maxItems}
          type="button"
          onClick={addNewAsset}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      <div className="space-y-4">
        {whitelist.map(asset => {
          const isSearchMode = !!asset.policyId;
          const policiesToShow = isSearchMode
            ? getFilteredSearchResults(asset.uniqueId)
            : getFilteredBrowseList(asset.uniqueId);
          const currentIsSearching = isSearching[asset.uniqueId];
          const selectedVerificationLabel = getVerificationPlatformLabel(asset.verificationPlatform);

          return (
            <div key={asset.id || asset.uniqueId} className="space-y-6">
              <div className="relative" ref={el => (dropdownRefs.current[asset.uniqueId] = el)}>
                <LavaInput
                  placeholder={itemPlaceholder}
                  style={{ fontSize: '20px' }}
                  value={asset.policyId}
                  className="pr-20"
                  onChange={e => handleInputChange(asset.uniqueId, e.target.value)}
                  onFocus={() => {
                    if (walletPolicyIds.length > 0 || asset.policyId) {
                      setShowDropdown(prev => ({ ...prev, [asset.uniqueId]: true }));
                      if (asset.policyId) {
                        triggerSearch(asset.uniqueId, asset.policyId);
                      }
                    }
                  }}
                />
                {wallet.isConnected && walletPolicyIds.length > 0 && (
                  <Button
                    type="button"
                    className="h-8 w-8 rounded-full absolute right-12 top-1/2 transform -translate-y-1/2 bg-steel-700 hover:bg-steel-600"
                    size="icon"
                    variant="ghost"
                    onClick={() => toggleDropdown(asset.uniqueId)}
                  >
                    {showDropdown[asset.uniqueId] ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                )}
                <Button
                  className="h-8 w-8 rounded-full absolute right-4 top-1/2 transform -translate-y-1/2"
                  size="icon"
                  variant="ghost"
                  onClick={() => handleRemoveOrClear(asset.uniqueId)}
                >
                  <X className="h-4 w-4" />
                </Button>
                {showDropdown[asset.uniqueId] && (
                  <div
                    className="absolute top-full left-0 right-0 z-50 mt-1 bg-steel-800 border border-steel-600 rounded-lg shadow-lg max-h-64 overflow-y-auto"
                    onScroll={e => handleScroll(e, asset.uniqueId)}
                  >
                    {currentIsSearching ? (
                      <div className="flex items-center justify-center py-6">
                        <Loader2 className="h-5 w-5 animate-spin text-dark-100" />
                      </div>
                    ) : policiesToShow.length > 0 ? (
                      <>
                        <div className="space-y-0">
                          {policiesToShow.map(policy => (
                            <div key={policy.policyId}>{renderAssetItem(asset, policy)}</div>
                          ))}
                        </div>
                        {!isSearchMode && isLoadingMore && (
                          <div className="flex items-center justify-center py-3">
                            <Loader2 className="h-5 w-5 animate-spin text-dark-100" />
                          </div>
                        )}
                        {!isSearchMode && hasMore && !isLoadingMore && (
                          <div className="text-center text-dark-100 text-xs py-2">Scroll for more</div>
                        )}
                      </>
                    ) : (
                      <div className="flex items-center justify-center py-6 text-dark-100">
                        {isSearchMode ? 'No matching policies found' : 'No policies available'}
                      </div>
                    )}
                  </div>
                )}
              </div>
              {(() => {
                const index = whitelist.findIndex(item => item.uniqueId === asset.uniqueId);
                const policyIdError = errors[`assetsWhitelist[${index}].policyId`];
                return <p className="text-red-600 text-sm mt-1">{policyIdError}</p>;
              })()}
              {(() => {
                const index = whitelist.findIndex(item => item.uniqueId === asset.uniqueId);
                const policyIdError = errors[`assetsWhitelist[${index}].policyId`];
                if (policyIdError) return null;
                return <p className="text-red-600 text-sm mt-1">{errors[`assetsWhitelist[${index}].isVerified`]}</p>;
              })()}
              {asset.policyId && asset.isVerified === true && (
                <div className="flex items-center gap-1.5 text-sm text-green-400 -mt-4">
                  <ShieldCheck className="h-4 w-4" />
                  <span>
                    {selectedVerificationLabel
                      ? `Verified collection · ${selectedVerificationLabel}`
                      : 'Verified collection'}
                  </span>
                </div>
              )}
              {asset.policyId && asset.isVerified === false && (
                <div className="flex items-center gap-1.5 text-sm text-orange-400 -mt-4">
                  <ShieldAlert className="h-4 w-4" />
                  <span>Unverified collection — cannot be added to a vault</span>
                </div>
              )}
              <div className="flex gap-4">
                <div className="flex-1">
                  <LavaInput
                    required={true}
                    label="Min asset cap"
                    type="text"
                    pattern="[0-9]*"
                    style={{ fontSize: '20px' }}
                    value={asset.countCapMin}
                    onChange={e => {
                      const inputValue = e.target.value;
                      const numericValue = Number(inputValue.replace(/,/g, ''));
                      if (inputValue === '' || (!isNaN(numericValue) && numericValue <= maxCapValue)) {
                        updateAsset(asset.uniqueId, 'countCapMin', inputValue);
                      }
                    }}
                    onBlur={e =>
                      updateAsset(
                        asset.uniqueId,
                        'countCapMin',
                        e.target.value === '' ? 1 : Number(e.target.value.replace(/,/g, ''))
                      )
                    }
                    hint={`Maximum value: ${maxCapValue.toLocaleString()}`}
                  />
                  {(() => {
                    const index = whitelist.findIndex(item => item.uniqueId === asset.uniqueId);
                    return (
                      <p className="text-red-600 text-sm mt-1">{errors[`assetsWhitelist[${index}].countCapMin`]}</p>
                    );
                  })()}
                </div>

                <div className="flex-1">
                  <LavaInput
                    required={true}
                    label="Max asset cap"
                    value={asset.countCapMax}
                    onChange={e => {
                      const inputValue = e.target.value;
                      const numericValue = Number(inputValue.replace(/,/g, ''));
                      if (inputValue === '' || (!isNaN(numericValue) && numericValue <= maxCapValue)) {
                        updateAsset(asset.uniqueId, 'countCapMax', inputValue);
                      }
                    }}
                    onBlur={e => {
                      const rawValue = e.target.value === '' ? 1000 : Number(e.target.value.replace(/,/g, ''));
                      const limitedValue = Math.min(rawValue, maxCapValue);
                      updateAsset(asset.uniqueId, 'countCapMax', limitedValue);
                    }}
                    hint={`Maximum value: ${maxCapValue.toLocaleString()}`}
                  />
                  {(() => {
                    const index = whitelist.findIndex(item => item.uniqueId === asset.uniqueId);
                    return (
                      <p className="text-red-600 text-sm mt-1">{errors[`assetsWhitelist[${index}].countCapMax`]}</p>
                    );
                  })()}
                </div>
              </div>

              <div className="space-y-4 mt-4">
                <div>
                  <LavaRadio
                    label="*Asset Valuation Method"
                    name={`valuationMethod_${asset.uniqueId}`}
                    options={
                      asset.isLpToken
                        ? [{ name: 'lp_token_dynamic', label: 'LP Token Price' }]
                        : [
                            { name: 'market', label: 'Market / Floor Price' },
                            { name: 'custom', label: 'Custom Price' },
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
                    const index = whitelist.findIndex(item => item.uniqueId === asset.uniqueId);
                    return (
                      <p className="text-red-600 text-sm mt-1">{errors[`assetsWhitelist[${index}].valuationMethod`]}</p>
                    );
                  })()}
                </div>

                {asset.valuationMethod === 'custom' && !asset.isLpToken && (
                  <div>
                    <LavaInput
                      required={true}
                      label="Custom Price (ADA)"
                      type="text"
                      placeholder="Enter price in ADA"
                      style={{ fontSize: '20px' }}
                      value={asset.customPriceAda || ''}
                      onChange={e => {
                        const inputValue = e.target.value;
                        // Allow decimal numbers
                        if (inputValue === '' || /^\d*\.?\d*$/.test(inputValue)) {
                          updateAsset(asset.uniqueId, 'customPriceAda', inputValue);
                        }
                      }}
                      onBlur={e => {
                        const rawValue = e.target.value === '' ? 10 : Number(e.target.value.replace(/,/g, ''));
                        const limitedValue = Math.min(rawValue, maxCapValue);
                        updateAsset(asset.uniqueId, 'customPriceAda', limitedValue);
                      }}
                      hint="The custom ADA price for this policy"
                    />
                    {(() => {
                      const index = whitelist.findIndex(item => item.uniqueId === asset.uniqueId);
                      return (
                        <p className="text-red-600 text-sm mt-1">
                          {errors[`assetsWhitelist[${index}].customPriceAda`]}
                        </p>
                      );
                    })()}
                  </div>
                )}
              </div>
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
