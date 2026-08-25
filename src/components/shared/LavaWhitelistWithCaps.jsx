import { X, Plus, ChevronDown, ChevronUp, Loader2, ShieldCheck, ShieldAlert } from 'lucide-react';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useWallet } from '@ada-anvil/weld/react';
import { useAccount } from 'wagmi';

import { Button } from '@/components/ui/button';
import { LavaInput, LavaSteelInput } from '@/components/shared/LavaInput';
import { LavaRadio } from '@/components/shared/LavaRadio';
import { LavaCheckbox } from '@/components/shared/LavaCheckbox';
import { getVerificationPlatformLabel, useAssets } from '@/hooks/useAssets';
import { useEvmAssets } from '@/hooks/useEvmAssets';
import { useNetwork } from '@/hooks/useNetwork';
import { cn } from '@/lib/utils';
import { TokenImage } from '@/components/shared/TokenImage';

const variants = {
  default: {
    dropdown:
      'fixed z-[200] bg-steel-800 border border-steel-600 rounded-lg shadow-lg overflow-y-auto',
    policyInputClassName: 'pr-20',
    policyInputStyle: { fontSize: '20px' },
    addButton: 'border-2 border-white/20 rounded-lg p-2',
    itemSpacing: 'space-y-6',
  },
  steel: {
    dropdown:
      'fixed z-[200] bg-steel-850 border border-steel-750 rounded-lg shadow-lg overflow-y-auto',
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
  const [showDropdown, setShowDropdown] = useState({});
  const [searchResults, setSearchResults] = useState({});
  const [isSearching, setIsSearching] = useState({});
  const [focusedUniqueId, setFocusedUniqueId] = useState(null);
  const [dropdownRects, setDropdownRects] = useState({});
  const dropdownRefs = useRef({});
  const portalDropdownRefs = useRef({});
  const rowRefs = useRef({});
  const pendingFocusIdRef = useRef(null);
  const searchTimers = useRef({});

  const { isRobinHood } = useNetwork();
  const wallet = useWallet('handler', 'isConnected', 'balanceAda', 'changeAddressBech32');
  const { isConnected: isEvmConnected } = useAccount();

  // Source assets from the wallet matching the selected network. Both hooks are
  // called unconditionally (rules of hooks) and the inactive one returns an empty
  // stub, so only the active chain's wallet is queried.
  const cardanoAssets = useAssets();
  const evmAssets = useEvmAssets();
  const { data, hasMore, isLoadingMore, loadMore, searchPolicies, lookupPolicies } = isRobinHood
    ? evmAssets
    : cardanoAssets;

  const isWalletConnected = isRobinHood ? isEvmConnected : wallet.isConnected;

  // On EVM the identifier is a token contract address, not a Cardano policy id.
  // Only override the default label so explicit caller placeholders still win.
  const effectivePlaceholder = isRobinHood
    ? itemPlaceholder.includes('Policy ID')
      ? 'Search token or paste contract address'
      : itemPlaceholder
    : itemPlaceholder;

  const walletPolicyIds = data?.data || [];

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

  const updateDropdownRect = useCallback(uniqueId => {
    const anchor = dropdownRefs.current[uniqueId];
    if (!anchor) return;

    const rect = anchor.getBoundingClientRect();
    const gap = 4;
    const spaceBelow = window.innerHeight - rect.bottom - gap;
    const spaceAbove = rect.top - gap;
    const openUp = spaceBelow < 220 && spaceAbove > spaceBelow;
    const maxHeight = Math.min(280, Math.max(140, openUp ? spaceAbove : spaceBelow));

    setDropdownRects(prev => ({
      ...prev,
      [uniqueId]: {
        left: rect.left,
        width: Math.max(rect.width, 300),
        maxHeight,
        ...(openUp
          ? { bottom: window.innerHeight - rect.top + gap, top: 'auto' }
          : { top: rect.bottom + gap, bottom: 'auto' }),
      },
    }));
  }, []);

  useEffect(() => {
    const handleClickOutside = event => {
      Object.keys(showDropdown).forEach(uniqueId => {
        if (!showDropdown[uniqueId]) return;
        const anchor = dropdownRefs.current[uniqueId];
        const menu = portalDropdownRefs.current[uniqueId];
        const clickedInside =
          (anchor && anchor.contains(event.target)) || (menu && menu.contains(event.target));
        if (!clickedInside) {
          setShowDropdown(prev => ({ ...prev, [uniqueId]: false }));
        }
      });
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  // Keep portal menus aligned while the modal scrolls or the window resizes.
  useEffect(() => {
    const openIds = Object.keys(showDropdown).filter(id => showDropdown[id]);
    if (!openIds.length) return undefined;

    const sync = () => openIds.forEach(updateDropdownRect);
    sync();
    window.addEventListener('resize', sync);
    // Capture scroll from the modal body and anywhere else.
    window.addEventListener('scroll', sync, true);
    return () => {
      window.removeEventListener('resize', sync);
      window.removeEventListener('scroll', sync, true);
    };
  }, [showDropdown, updateDropdownRect]);

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
    const usedPolicyIds = getUsedPolicyIds(currentUniqueId);
    return walletPolicyIds.filter(policy => !usedPolicyIds.has(policy.policyId.toLowerCase()));
  };

  const getFilteredSearchResults = currentUniqueId => {
    const usedPolicyIds = getUsedPolicyIds(currentUniqueId);
    const results = searchResults[currentUniqueId] || [];
    return results.filter(policy => !usedPolicyIds.has(policy.policyId.toLowerCase()));
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
      imageUrl: null,
      image: null,
    });
    triggerSearch(uniqueId, value);

    if (value) {
      openDropdown(uniqueId);
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
      imageUrl: policy.imageUrl ?? policy.image ?? null,
      image: policy.image ?? policy.imageUrl ?? null,
    });
    setShowDropdown(prev => ({ ...prev, [uniqueId]: false }));
    setSearchResults(prev => ({ ...prev, [uniqueId]: [] }));
    setFocusedUniqueId(prev => (prev === uniqueId ? null : prev));
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

  const openDropdown = useCallback(
    uniqueId => {
      setShowDropdown(prev => ({ ...prev, [uniqueId]: true }));
      // Measure after the open flag flips so the anchor is laid out.
      requestAnimationFrame(() => updateDropdownRect(uniqueId));
    },
    [updateDropdownRect]
  );

  const toggleDropdown = uniqueId => {
    const willOpen = !showDropdown[uniqueId];
    if (willOpen) {
      openDropdown(uniqueId);
      const asset = whitelist.find(item => item.uniqueId === uniqueId);
      if (asset && asset.policyId) {
        triggerSearch(uniqueId, asset.policyId);
      }
    } else {
      setShowDropdown(prev => ({ ...prev, [uniqueId]: false }));
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
        imageUrl: null,
        image: null,
      });
      setSearchResults(prev => ({ ...prev, [uniqueId]: [] }));
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

  const formatTokenDisplayName = policy => {
    const baseName = policy.collectionName || policy.name || '';
    if (!isRobinHood) return baseName;

    const ticker = policy.name || policy.assetName || '';
    if (!baseName) return ticker;
    if (!ticker || baseName.toLowerCase() === ticker.toLowerCase()) return baseName;
    return `${baseName} (${ticker})`;
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

    const displayName = formatTokenDisplayName(policy);
    const isVerified = policy.isVerified;
    const verificationBadgeLabel = getVerificationPlatformLabel(policy.verificationPlatform);

    return (
      <button
        type="button"
        disabled={!isVerified}
        className={`w-full px-4 py-2 text-left flex items-center gap-3 border-b border-steel-700 last:border-b-0 ${
          isVerified ? 'hover:bg-steel-700 cursor-pointer' : 'opacity-50 cursor-not-allowed'
        }`}
        onClick={isVerified ? () => selectPolicyId(asset.uniqueId, policy) : undefined}
        onMouseDown={event => event.preventDefault()}
      >
        <TokenImage
          asset={policy}
          alt={displayName || policy.policyId}
          chainType={isRobinHood ? 'robinhood' : 'cardano'}
          className="h-8 w-8 rounded-full shrink-0"
          width={32}
          height={32}
        />
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
          const isSearchMode = !!asset.policyId;
          const policiesToShow = isSearchMode
            ? getFilteredSearchResults(asset.uniqueId)
            : getFilteredBrowseList(asset.uniqueId);
          const currentIsSearching = isSearching[asset.uniqueId];
          const selectedVerificationLabel = getVerificationPlatformLabel(asset.verificationPlatform);

          const resolvedName = formatTokenDisplayName(asset);
          const isEditing = focusedUniqueId === asset.uniqueId;
          const hasSelectedAsset = Boolean(asset.policyId && resolvedName && !isEditing);
          const displayValue = isEditing || !resolvedName ? asset.policyId : resolvedName;

          const beginEditing = () => {
            setFocusedUniqueId(asset.uniqueId);
            openDropdown(asset.uniqueId);
            if (asset.policyId) {
              triggerSearch(asset.uniqueId, asset.policyId);
            }
          };

          return (
            <div
              key={asset.id || asset.uniqueId || `asset-${index}`}
              ref={el => {
                rowRefs.current[asset.uniqueId] = el;
              }}
              className={cn('p-4 grid gap-4 items-start', showCountCaps ? tableGridCols : 'grid-cols-1')}
            >
              <div className={styles.itemSpacing}>
                <div className="relative" ref={el => (dropdownRefs.current[asset.uniqueId] = el)}>
                  {hasSelectedAsset ? (
                    <div className="flex items-center gap-3 rounded-lg border border-steel-700 bg-steel-850/80 px-3 py-2.5">
                      <TokenImage
                        asset={asset}
                        alt={resolvedName || asset.policyId}
                        chainType={isRobinHood ? 'robinhood' : 'cardano'}
                        className="h-10 w-10 rounded-full shrink-0"
                        width={40}
                        height={40}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-white truncate">{resolvedName}</span>
                          {asset.isVerified === true && (
                            <span className="inline-flex items-center gap-1 text-[11px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full border border-green-500/30 shrink-0">
                              <ShieldCheck className="h-3 w-3" />
                              Verified
                              {selectedVerificationLabel ? ` · ${selectedVerificationLabel}` : ''}
                            </span>
                          )}
                          {asset.isVerified === false && (
                            <span className="inline-flex items-center gap-1 text-[11px] bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full border border-orange-500/30 shrink-0">
                              <ShieldAlert className="h-3 w-3" />
                              Unverified
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-dark-100 font-mono truncate mt-0.5">{asset.policyId}</p>
                      </div>
                      <button
                        type="button"
                        className="shrink-0 text-xs uppercase tracking-wide text-orange-400 hover:text-orange-300 px-2 py-1"
                        onClick={beginEditing}
                      >
                        Change
                      </button>
                      <Button
                        className="h-8 w-8 rounded-full shrink-0"
                        size="icon"
                        variant="ghost"
                        type="button"
                        onClick={() => handleRemoveOrClear(asset.uniqueId)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      {renderInput({
                        placeholder: effectivePlaceholder,
                        style: styles.policyInputStyle,
                        value: displayValue,
                        className: styles.policyInputClassName,
                        onChange: e => handleInputChange(asset.uniqueId, e.target.value),
                        onFocus: () => {
                          setFocusedUniqueId(asset.uniqueId);
                          if (walletPolicyIds.length > 0 || asset.policyId) {
                            openDropdown(asset.uniqueId);
                            if (asset.policyId) {
                              triggerSearch(asset.uniqueId, asset.policyId);
                            }
                          } else if (isWalletConnected) {
                            openDropdown(asset.uniqueId);
                          }
                        },
                        onBlur: () => setFocusedUniqueId(prev => (prev === asset.uniqueId ? null : prev)),
                      })}
                      {isWalletConnected && (
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
                        type="button"
                        onClick={() => handleRemoveOrClear(asset.uniqueId)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  {showDropdown[asset.uniqueId] &&
                    !hasSelectedAsset &&
                    typeof document !== 'undefined' &&
                    createPortal(
                      <div
                        ref={el => {
                          portalDropdownRefs.current[asset.uniqueId] = el;
                        }}
                        className={styles.dropdown}
                        style={dropdownRects[asset.uniqueId] || { visibility: 'hidden' }}
                        onScroll={e => handleScroll(e, asset.uniqueId)}
                      >
                      {!isWalletConnected && !isSearchMode ? (
                        <div className="px-4 py-5 text-sm text-dark-100 space-y-1">
                          <p className="text-white font-medium">Connect your wallet to browse holdings</p>
                          <p>Or paste a Policy ID above to look one up.</p>
                        </div>
                      ) : currentIsSearching ? (
                        <div className="flex items-center justify-center py-6">
                          <Loader2 className="h-5 w-5 animate-spin text-dark-100" />
                        </div>
                      ) : policiesToShow.length > 0 ? (
                        <>
                          <div className="px-3 py-2 text-[11px] uppercase tracking-wide text-dark-100 border-b border-steel-700">
                            {isSearchMode ? 'Search results' : 'Your wallet collections'}
                            <span className="ml-2 normal-case tracking-normal text-dark-100/70">
                              — only verified can be selected
                            </span>
                          </div>
                          <div className="space-y-0">
                            {policiesToShow.map((policy, policyIndex) => (
                              <div key={`${policy.policyId}-${policy.name || 'asset'}-${policyIndex}`}>
                                {renderAssetItem(asset, policy)}
                              </div>
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
                        <div className="flex flex-col items-center justify-center gap-1 py-6 px-4 text-center text-dark-100 text-sm">
                          {isSearchMode ? (
                            isRobinHood ? (
                              <span>No matching tokens found</span>
                            ) : (
                              <span>No matching collections in your wallet</span>
                            )
                          ) : (
                            <>
                              <span className="text-white">No collections to show yet</span>
                              <span>Type a name or Policy ID to search</span>
                            </>
                          )}
                        </div>
                      )}
                      </div>,
                      document.body
                    )}
                </div>
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
                {!hasSelectedAsset && asset.policyId && asset.isVerified === true && (
                  <div className="flex items-center gap-2 text-sm text-green-400">
                    <TokenImage
                      asset={asset}
                      alt={resolvedName || asset.policyId}
                      chainType={isRobinHood ? 'robinhood' : 'cardano'}
                      className="h-6 w-6 rounded-full shrink-0"
                      width={24}
                      height={24}
                    />
                    <div className="flex items-center gap-1.5 min-w-0">
                      <ShieldCheck className="h-4 w-4 shrink-0" />
                      <span className="truncate">
                        {isRobinHood
                          ? 'Verified token · Blockscout'
                          : selectedVerificationLabel
                            ? `Verified collection · ${selectedVerificationLabel}`
                            : 'Verified collection'}
                      </span>
                    </div>
                  </div>
                )}
                {!hasSelectedAsset && asset.policyId && asset.isVerified === false && (
                  <div className="flex items-center gap-1.5 text-sm text-orange-400">
                    <ShieldAlert className="h-4 w-4" />
                    <span>
                      {isRobinHood
                        ? 'Unverified token — flagged by Blockscout, add with caution'
                        : 'Unverified collection — cannot be added to a vault'}
                    </span>
                  </div>
                )}
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
