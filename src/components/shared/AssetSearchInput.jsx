import { ChevronDown, ChevronUp, Loader2, ShieldAlert, ShieldCheck, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { Button } from '@/components/ui/button';
import { LavaInput, LavaSteelInput } from '@/components/shared/LavaInput';
import { TokenImage } from '@/components/shared/TokenImage';
import { useAssetSource } from '@/hooks/useAssetSource';
import { getVerificationPlatformLabel } from '@/hooks/useAssets';

const variants = {
  default: {
    dropdown: 'fixed z-[200] bg-steel-800 border border-steel-600 rounded-lg shadow-lg overflow-y-auto',
    inputClassName: 'pr-20',
    inputStyle: { fontSize: '20px' },
  },
  steel: {
    dropdown: 'fixed z-[200] bg-steel-850 border border-steel-750 rounded-lg shadow-lg overflow-y-auto',
    inputClassName: 'pr-20',
    inputStyle: undefined,
  },
};

/** "Collection (TICKER)" on EVM, plain collection name on Cardano. */
const formatTokenDisplayName = (policy, isRobinHood) => {
  const baseName = policy?.collectionName || policy?.name || '';
  if (!isRobinHood) return baseName;

  const ticker = policy?.name || policy?.assetName || '';
  if (!baseName) return ticker;
  if (!ticker || baseName.toLowerCase() === ticker.toLowerCase()) return baseName;
  return `${baseName} (${ticker})`;
};

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

/**
 * One asset search field: type to search, pick from the wallet's holdings, or
 * paste a Policy ID / contract address. Shared by the vault-creation asset
 * whitelist and the index basket editor so both fetch, search and verify
 * tokens the same way.
 *
 * The field is controlled: `value` is the asset row it edits (only `policyId`
 * and the display metadata are read), `onChange` receives raw typing and
 * `onSelect` the picked policy. Nothing is fetched on the caller's behalf —
 * pass `source` when several fields share one screen, otherwise the field
 * resolves its own.
 */
export const AssetSearchInput = ({
  value = {},
  onChange,
  onSelect,
  onClear,
  excludePolicyIds = [],
  placeholder = 'Search collection or paste Policy ID',
  variant = 'default',
  showSelectedCard = true,
  allowUnverified = false,
  showVerificationHint = true,
  extraOption = null,
  source,
  autoFocus = false,
}) => {
  const styles = variants[variant] || variants.default;
  const isSteel = variant === 'steel';

  const ownSource = useAssetSource();
  const { isRobinHood, isWalletConnected, policies, hasMore, isLoadingMore, loadMore, searchPolicies } =
    source || ownSource;

  const [showDropdown, setShowDropdown] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [dropdownRect, setDropdownRect] = useState(null);

  const anchorRef = useRef(null);
  const menuRef = useRef(null);
  const searchTimer = useRef(null);
  const searchPoliciesRef = useRef(searchPolicies);

  useEffect(() => {
    searchPoliciesRef.current = searchPolicies;
  }, [searchPolicies]);

  // On EVM the identifier is a token contract address, not a Cardano policy id.
  // Only override the default label so explicit caller placeholders still win.
  const effectivePlaceholder = isRobinHood
    ? placeholder.includes('Policy ID')
      ? 'Search token or paste contract address'
      : placeholder
    : placeholder;

  const excluded = useMemo(
    () => new Set(excludePolicyIds.map(id => id?.toLowerCase()).filter(Boolean)),
    [excludePolicyIds]
  );

  const updateDropdownRect = useCallback(() => {
    const anchor = anchorRef.current;
    if (!anchor) return;

    const rect = anchor.getBoundingClientRect();
    const gap = 4;
    const spaceBelow = window.innerHeight - rect.bottom - gap;
    const spaceAbove = rect.top - gap;
    const openUp = spaceBelow < 220 && spaceAbove > spaceBelow;
    const maxHeight = Math.min(280, Math.max(140, openUp ? spaceAbove : spaceBelow));

    setDropdownRect({
      left: rect.left,
      width: Math.max(rect.width, 300),
      maxHeight,
      ...(openUp
        ? { bottom: window.innerHeight - rect.top + gap, top: 'auto' }
        : { top: rect.bottom + gap, bottom: 'auto' }),
    });
  }, []);

  const openDropdown = useCallback(() => {
    setShowDropdown(true);
    // Measure after the open flag flips so the anchor is laid out.
    requestAnimationFrame(updateDropdownRect);
  }, [updateDropdownRect]);

  useEffect(() => {
    if (!showDropdown) return undefined;

    const handleClickOutside = event => {
      const clickedInside =
        (anchorRef.current && anchorRef.current.contains(event.target)) ||
        (menuRef.current && menuRef.current.contains(event.target));
      if (!clickedInside) setShowDropdown(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown]);

  // Keep the portal menu aligned while the modal scrolls or the window resizes.
  useEffect(() => {
    if (!showDropdown) return undefined;

    updateDropdownRect();
    window.addEventListener('resize', updateDropdownRect);
    // Capture scroll from the modal body and anywhere else.
    window.addEventListener('scroll', updateDropdownRect, true);
    return () => {
      window.removeEventListener('resize', updateDropdownRect);
      window.removeEventListener('scroll', updateDropdownRect, true);
    };
  }, [showDropdown, updateDropdownRect]);

  useEffect(() => () => clearTimeout(searchTimer.current), []);

  const triggerSearch = useCallback(query => {
    clearTimeout(searchTimer.current);

    if (!query) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    // Debounce 300ms
    searchTimer.current = setTimeout(async () => {
      try {
        setSearchResults(await searchPoliciesRef.current(query));
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);
  }, []);

  const handleInputChange = text => {
    onChange?.(text);
    triggerSearch(text);
    if (text) openDropdown();
  };

  const toggleDropdown = () => {
    if (showDropdown) {
      setShowDropdown(false);
      return;
    }
    openDropdown();
    if (value.policyId) triggerSearch(value.policyId);
  };

  const handleSelect = policy => {
    onSelect?.(policy);
    setShowDropdown(false);
    setSearchResults([]);
    setIsEditing(false);
  };

  const isSearchMode = !!value.policyId;
  const visiblePolicies = (isSearchMode ? searchResults : policies).filter(
    policy => !excluded.has(policy.policyId?.toLowerCase())
  );

  const resolvedName = formatTokenDisplayName(value, isRobinHood);
  const hasSelectedAsset = showSelectedCard && Boolean(value.policyId && resolvedName && !isEditing);
  const displayValue = (isEditing || !resolvedName ? value.policyId : resolvedName) || '';
  const selectedVerificationLabel = getVerificationPlatformLabel(value.verificationPlatform);

  const renderInput = () => {
    const shared = {
      placeholder: effectivePlaceholder,
      value: displayValue,
      className: styles.inputClassName,
      autoFocus,
      onFocus: () => {
        setIsEditing(true);
        if (policies.length > 0 || value.policyId) {
          openDropdown();
          if (value.policyId) triggerSearch(value.policyId);
        } else if (isWalletConnected) {
          openDropdown();
        }
      },
      onBlur: () => setIsEditing(false),
    };

    return isSteel ? (
      <LavaSteelInput {...shared} onChange={text => handleInputChange(text)} />
    ) : (
      <LavaInput {...shared} style={styles.inputStyle} onChange={e => handleInputChange(e.target.value)} />
    );
  };

  const renderAssetItem = policy => {
    const searchText = (value.policyId || '').toLowerCase();
    const displayName = formatTokenDisplayName(policy, isRobinHood);
    const isVerified = policy.isVerified;
    const selectable = isVerified || allowUnverified;
    const verificationBadgeLabel = getVerificationPlatformLabel(policy.verificationPlatform);

    return (
      <button
        key={`${policy.policyId}-${policy.name || 'asset'}`}
        type="button"
        disabled={!selectable}
        className={`w-full px-4 py-2 text-left flex items-center gap-3 border-b border-steel-700 last:border-b-0 ${
          selectable ? 'hover:bg-steel-700 cursor-pointer' : 'opacity-50 cursor-not-allowed'
        }`}
        onClick={selectable ? () => handleSelect(policy) : undefined}
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

  const handleScroll = event => {
    if (isSearchMode) return;
    const { scrollTop, scrollHeight, clientHeight } = event.target;
    if (scrollHeight - scrollTop - clientHeight < 60 && hasMore && !isLoadingMore) {
      loadMore();
    }
  };

  return (
    <div className="relative" ref={anchorRef}>
      {hasSelectedAsset ? (
        <div className="flex items-center gap-3 rounded-lg border border-steel-700 bg-steel-850/80 px-3 py-2.5">
          <TokenImage
            asset={value}
            alt={resolvedName || value.policyId}
            chainType={isRobinHood ? 'robinhood' : 'cardano'}
            className="h-10 w-10 rounded-full shrink-0"
            width={40}
            height={40}
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-white truncate">{resolvedName}</span>
              {value.isVerified === true && (
                <span className="inline-flex items-center gap-1 text-[11px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full border border-green-500/30 shrink-0">
                  <ShieldCheck className="h-3 w-3" />
                  Verified
                  {selectedVerificationLabel ? ` · ${selectedVerificationLabel}` : ''}
                </span>
              )}
              {value.isVerified === false && (
                <span className="inline-flex items-center gap-1 text-[11px] bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full border border-orange-500/30 shrink-0">
                  <ShieldAlert className="h-3 w-3" />
                  Unverified
                </span>
              )}
            </div>
            <p className="text-xs text-dark-100 font-mono truncate mt-0.5">{value.policyId}</p>
          </div>
          <Button className="h-8 w-8 rounded-full shrink-0" size="icon" variant="ghost" type="button" onClick={onClear}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <>
          {renderInput()}
          {isWalletConnected && (
            <Button
              type="button"
              className="h-8 w-8 rounded-full absolute right-12 top-1/2 transform -translate-y-1/2 bg-steel-700 hover:bg-steel-600"
              size="icon"
              variant="ghost"
              onClick={toggleDropdown}
            >
              {showDropdown ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          )}
          {onClear && (
            <Button
              className="h-8 w-8 rounded-full absolute right-4 top-1/2 transform -translate-y-1/2"
              size="icon"
              variant="ghost"
              type="button"
              onClick={onClear}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </>
      )}

      {showVerificationHint && !hasSelectedAsset && value.policyId && value.isVerified === true && (
        <div className="mt-2 flex items-center gap-2 text-sm text-green-400">
          <TokenImage
            asset={value}
            alt={resolvedName || value.policyId}
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
      {showVerificationHint && !hasSelectedAsset && value.policyId && value.isVerified === false && (
        <div className="mt-2 flex items-center gap-1.5 text-sm text-orange-400">
          <ShieldAlert className="h-4 w-4" />
          <span>
            {isRobinHood
              ? 'Unverified token — flagged by Blockscout, add with caution'
              : 'Unverified collection — cannot be added to a vault'}
          </span>
        </div>
      )}

      {showDropdown &&
        !hasSelectedAsset &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={menuRef}
            className={styles.dropdown}
            style={dropdownRect || { visibility: 'hidden' }}
            onScroll={handleScroll}
          >
            {extraOption && (
              <button
                type="button"
                disabled={extraOption.disabled}
                className="w-full px-4 py-3 text-left flex items-center gap-3 border-b border-steel-700 hover:bg-steel-700 disabled:opacity-50"
                onClick={extraOption.onSelect}
                onMouseDown={event => event.preventDefault()}
              >
                <div className="min-w-0">
                  <div className="text-sm text-white">{extraOption.title}</div>
                  {extraOption.subtitle && <div className="text-xs text-dark-100">{extraOption.subtitle}</div>}
                </div>
              </button>
            )}
            {!isWalletConnected && !isSearchMode ? (
              <div className="px-4 py-5 text-sm text-dark-100 space-y-1">
                <p className="text-white font-medium">Connect your wallet to browse holdings</p>
                <p>Or paste a {isRobinHood ? 'contract address' : 'Policy ID'} above to look one up.</p>
              </div>
            ) : isSearching ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-dark-100" />
              </div>
            ) : visiblePolicies.length > 0 ? (
              <>
                <div className="px-3 py-2 text-[11px] uppercase tracking-wide text-dark-100 border-b border-steel-700">
                  {isSearchMode ? 'Search results' : 'Your wallet collections'}
                  {!allowUnverified && (
                    <span className="ml-2 normal-case tracking-normal text-dark-100/70">
                      — only verified can be selected
                    </span>
                  )}
                </div>
                <div className="space-y-0">{visiblePolicies.map(renderAssetItem)}</div>
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
                    <span>Type a name or {isRobinHood ? 'contract address' : 'Policy ID'} to search</span>
                  </>
                )}
              </div>
            )}
          </div>,
          document.body
        )}
    </div>
  );
};
