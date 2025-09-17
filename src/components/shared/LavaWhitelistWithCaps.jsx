import { X, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useWallet } from '@ada-anvil/weld/react';

import { Button } from '@/components/ui/button';
import { LavaInput } from '@/components/shared/LavaInput';
import { fetchWalletAssetsForWhitelist, extractPolicyIds } from '@/utils/walletAssets';

export const LavaWhitelistWithCaps = ({
  required = false,
  label = 'Asset whitelist',
  itemPlaceholder = '*Enter Policy ID',
  whitelist = [],
  setWhitelist,
  maxItems = 10,
  errors = {},
}) => {
  const [walletPolicyIds, setWalletPolicyIds] = useState([]);
  const [showDropdown, setShowDropdown] = useState({});
  const wallet = useWallet('handler', 'isConnected', 'balanceAda');
  const dropdownRefs = useRef({});

  useEffect(() => {
    const loadWalletPolicyIds = async () => {
      if (wallet.isConnected && wallet.handler) {
        try {
          const assets = await fetchWalletAssetsForWhitelist(wallet, new Set());
          const policyIds = extractPolicyIds(assets);
          setWalletPolicyIds(policyIds);
        } catch (error) {
          console.error('Error loading wallet policy IDs:', error);
        }
      }
    };
    loadWalletPolicyIds();
  }, [wallet.isConnected, wallet.handler]);

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

  const getFilteredPolicyIds = (searchText, currentUniqueId) => {
    const usedPolicyIds = new Set(
      whitelist.filter(item => item.uniqueId !== currentUniqueId && item.policyId).map(item => item.policyId)
    );

    const availablePolicies = walletPolicyIds.filter(policy => !usedPolicyIds.has(policy.policyId));
    if (!searchText) return availablePolicies;

    const search = searchText.toLowerCase();
    return availablePolicies.filter(
      policy => policy.name.toLowerCase().includes(search) || policy.policyId.toLowerCase().includes(search)
    );
  };

  const handleInputChange = (uniqueId, value) => {
    updateAsset(uniqueId, 'policyId', value);
    if (value && getFilteredPolicyIds(value, uniqueId).length > 0) {
      setShowDropdown(prev => ({ ...prev, [uniqueId]: true }));
    }
  };

  const selectPolicyId = (uniqueId, policyId) => {
    updateAsset(uniqueId, 'policyId', policyId);
    setShowDropdown(prev => ({ ...prev, [uniqueId]: false }));
  };

  const toggleDropdown = uniqueId => {
    setShowDropdown(prev => ({ ...prev, [uniqueId]: !prev[uniqueId] }));
  };

  const handleRemoveOrClear = uniqueId => {
    const asset = whitelist.find(item => item.uniqueId === uniqueId);

    if (asset && asset.policyId) {
      updateAsset(uniqueId, 'policyId', '');
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
        countCapMax: 1000,
        uniqueId: Date.now(),
      },
    ];
    setWhitelist(newAssets);
  };

  const updateAsset = (uniqueId, field, val) => {
    const updatedAssets = whitelist.map(asset => (asset.uniqueId === uniqueId ? { ...asset, [field]: val } : asset));
    setWhitelist(updatedAssets);
  };

  const removeAsset = uniqueId => {
    const filteredAssets = whitelist.filter(asset => asset.uniqueId !== uniqueId);
    setWhitelist(filteredAssets);
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
        {whitelist.map(asset => (
          <div key={asset.id || asset.uniqueId} className="space-y-2">
            <div className="relative" ref={el => (dropdownRefs.current[asset.uniqueId] = el)}>
              <LavaInput
                placeholder={itemPlaceholder}
                style={{ fontSize: '20px' }}
                value={asset.policyId}
                className="pr-20"
                onChange={e => handleInputChange(asset.uniqueId, e.target.value)}
                onFocus={() => {
                  if (walletPolicyIds.length > 0) {
                    setShowDropdown(prev => ({ ...prev, [asset.uniqueId]: true }));
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
              {showDropdown[asset.uniqueId] &&
                walletPolicyIds.length > 0 &&
                (() => {
                  const filteredPolicies = getFilteredPolicyIds(asset.policyId, asset.uniqueId);
                  return (
                    filteredPolicies.length > 0 && (
                      <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-steel-800 border border-steel-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {filteredPolicies.map((policy, index) => {
                          const searchText = asset.policyId.toLowerCase();
                          const highlightText = (text, search) => {
                            if (!search) return text;
                            const parts = text.split(new RegExp(`(${search})`, 'gi'));
                            return parts.map((part, i) =>
                              part.toLowerCase() === search.toLowerCase() ? (
                                <span key={i} className="bg-yellow-500 text-black">
                                  {part}
                                </span>
                              ) : (
                                part
                              )
                            );
                          };

                          return (
                            <button
                              key={index}
                              type="button"
                              className="w-full px-4 py-2 text-left hover:bg-steel-700 flex items-center gap-3 border-b border-steel-700 last:border-b-0"
                              onClick={() => selectPolicyId(asset.uniqueId, policy.policyId)}
                            >
                              {policy.image && (
                                <img
                                  src={policy.image}
                                  alt={policy.name}
                                  className="w-6 h-6 rounded-full object-cover"
                                  onError={e => {
                                    e.target.style.display = 'none';
                                  }}
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-white truncate">
                                  {highlightText(policy.name, searchText)}
                                </div>
                                <div className="text-sm text-gray-400 truncate font-mono">
                                  {highlightText(policy.policyId, searchText)}
                                </div>
                              </div>
                              <div className="text-xs text-gray-500 uppercase">{policy.type}</div>
                            </button>
                          );
                        })}
                      </div>
                    )
                  );
                })()}
            </div>
            {(() => {
              const index = whitelist.findIndex(item => item.uniqueId === asset.uniqueId);
              return <p className="text-red-600 text-sm mt-1">{errors[`assetsWhitelist[${index}].policyId`]}</p>;
            })()}
            <div className="flex gap-4">
              <div className="flex-1">
                <LavaInput
                  placeholder="*Min asset cap"
                  style={{ fontSize: '20px' }}
                  value={asset.countCapMin}
                  onChange={e =>
                    updateAsset(
                      asset.uniqueId,
                      'countCapMin',
                      e.target.value === '' ? 1 : Math.max(1, parseInt(e.target.value) || 1)
                    )
                  }
                />
                {(() => {
                  const index = whitelist.findIndex(item => item.uniqueId === asset.uniqueId);
                  return <p className="text-red-600 text-sm mt-1">{errors[`assetsWhitelist[${index}].countCapMin`]}</p>;
                })()}
              </div>

              <div className="flex-1">
                <LavaInput
                  placeholder="*Max asset cap"
                  style={{ fontSize: '20px' }}
                  value={asset.countCapMax}
                  onChange={e =>
                    updateAsset(
                      asset.uniqueId,
                      'countCapMax',
                      e.target.value === '' ? 1000 : Math.max(1, parseInt(e.target.value) || 1000)
                    )
                  }
                />
                {(() => {
                  const index = whitelist.findIndex(item => item.uniqueId === asset.uniqueId);
                  return <p className="text-red-600 text-sm mt-1">{errors[`assetsWhitelist[${index}].countCapMax`]}</p>;
                })()}
              </div>
            </div>
          </div>
        ))}
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
