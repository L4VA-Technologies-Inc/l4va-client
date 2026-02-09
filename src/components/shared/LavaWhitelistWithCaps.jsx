import { X, Plus, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useWallet } from '@ada-anvil/weld/react';

import { Button } from '@/components/ui/button';
import { LavaInput } from '@/components/shared/LavaInput';
import { useAssets } from '@/hooks/useAssets';

export const LavaWhitelistWithCaps = ({
  required = false,
  label = 'Asset whitelist',
  itemPlaceholder = '*Enter Policy ID',
  whitelist = [],
  setWhitelist,
  maxItems = 10,
  errors = {},
  maxCapValue = 1000000000,
}) => {
  const [showDropdown, setShowDropdown] = useState({});
  const [searchResults, setSearchResults] = useState({});
  const [isSearching, setIsSearching] = useState({});
  const dropdownRefs = useRef({});
  const searchTimers = useRef({});
  const wallet = useWallet('handler', 'isConnected', 'balanceAda', 'changeAddressBech32');

  const { data, hasMore, isLoadingMore, loadMore, searchPolicies } = useAssets();

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
    updateAsset(uniqueId, 'policyId', value, 'N/A', null);
    triggerSearch(uniqueId, value);

    if (value) {
      setShowDropdown(prev => ({ ...prev, [uniqueId]: true }));
    }
  };

  const selectPolicyId = (uniqueId, policyId, policyName, collectionName) => {
    updateAsset(uniqueId, 'policyId', policyId, policyName, collectionName);
    setShowDropdown(prev => ({ ...prev, [uniqueId]: false }));
    setSearchResults(prev => ({ ...prev, [uniqueId]: [] }));
  };

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
      updateAsset(uniqueId, 'policyId', '', 'N/A', null);
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
        countCapMin: 1,
        policyName: 'N/A',
        collectionName: null,
        countCapMax: Math.min(1000, maxCapValue),
        uniqueId: Date.now(),
      },
    ];
    setWhitelist(newAssets);
  };

  const updateAsset = (uniqueId, field, val, policyName, collectionName) => {
    const updatedAssets = whitelist.map(asset =>
      asset.uniqueId === uniqueId
        ? {
            ...asset,
            [field]: val,
            ...(policyName && { policyName }),
            ...(collectionName && { collectionName }),
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

    return (
      <button
        key={`${policy.policyId}-${policy.name}`}
        type="button"
        className="w-full px-4 py-2 text-left hover:bg-steel-700 flex items-center gap-3 border-b border-steel-700 last:border-b-0"
        onClick={() => selectPolicyId(asset.uniqueId, policy.policyId, policy.name, policy.collectionName)}
      >
        <div className="flex-1 min-w-0">
          <div className="font-medium text-white truncate">{highlightText(displayName, searchText)}</div>
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
                return <p className="text-red-600 text-sm mt-1">{errors[`assetsWhitelist[${index}].policyId`]}</p>;
              })()}
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
                    style={{ fontSize: '20px' }}
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
