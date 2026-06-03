import { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

import { VAULT_TAGS_OPTIONS } from '@/components/vaults/constants/vaults.constants.js';
import PrimaryButton from '@/components/shared/PrimaryButton';
import SecondaryButton from '@/components/shared/SecondaryButton';
import { Chip } from '@/components/shared/Chip';
import { ModalWrapper } from '@/components/shared/ModalWrapper';
import { LavaMultiSelect, LavaSteelSelect } from '@/components/shared/LavaSelect.jsx';
import { LavaDatePicker } from '@/components/shared/LavaDatePicker.jsx';
import { LavaSteelInput } from '@/components/shared/LavaInput.jsx';
import { LavaCheckbox } from '@/components/shared/LavaCheckbox';
import { GoldenVerifiedBadge } from '@/components/shared/GoldenVerifiedBadge';
import { useVaultAssetsWhitelist } from '@/services/api/queries';

export const VaultFiltersModal = ({
  isOpen,
  onClose,
  onApplyFilters,
  initialFilters = {},
  onApplyStage,
  activeStage,
  myVaults = false,
}) => {
  const [assetWhitelistSearch, setAssetWhitelistSearch] = useState('');
  const [filters, setFilters] = useState({
    page: 1,
    limit: 12,
    tags: initialFilters.tags || [],
    reserveMet: initialFilters.reserveMet ?? null,
    isOfficialPartner: Boolean(initialFilters.isOfficialPartner),
    minInitialVaultOffered: initialFilters.minInitialVaultOffered || 0,
    maxInitialVaultOffered: initialFilters.maxInitialVaultOffered || 0,
    minTvl: initialFilters.minTvl || 0,
    maxTvl: initialFilters.maxTvl || 0,
    minFdv: initialFilters.minFdv || 0,
    maxFdv: initialFilters.maxFdv || 0,
    maxFdvTvl: initialFilters.maxFdvTvl || 0,
    minFdvTvl: initialFilters.minFdvTvl || 0,
    tvlCurrency: initialFilters.tvlCurrency || 'ADA',
    fdvCurrency: initialFilters.fdvCurrency || 'ADA',
    vaultStage: activeStage || '',
    governance: initialFilters.governance || '',
    verified: initialFilters.verified || [],
    assetWhitelist: Array.isArray(initialFilters.assetWhitelist)
      ? initialFilters.assetWhitelist
      : initialFilters.assetWhitelist
        ? [initialFilters.assetWhitelist]
        : [],
    contributionWindow: {
      from: initialFilters.contributionWindow?.from
        ? new Date(initialFilters.contributionWindow.from).toISOString()
        : '',
      to: initialFilters.contributionWindow?.to ? new Date(initialFilters.contributionWindow.to).toISOString() : '',
    },
    acquireWindow: {
      from: initialFilters.acquireWindow?.from ? new Date(initialFilters.acquireWindow.from).toISOString() : '',
      to: initialFilters.acquireWindow?.to ? new Date(initialFilters.acquireWindow.to).toISOString() : '',
    },
  });

  const {
    data: assetsWhitelistData,
    fetchNextPage,
    hasNextPage,
    isLoading: isInitialLoading,
    isFetching,
    isFetchingNextPage,
  } = useVaultAssetsWhitelist({ myVaults, limit: 10, search: assetWhitelistSearch });

  const OPTIONS = {
    vaultStages: ['Upcoming', 'Contribute', 'Acquire', 'Locked', 'Terminated'],
    reserve: ['Yes', 'No'],
    governance: ['Active Proposals', 'No Active Proposals'],
    verified: ['All Assets Verified', 'Some Assets Verified', 'No Assets Verified'],
    assetWhitelist: assetsWhitelistData?.pages?.flatMap(page => (Array.isArray(page?.items) ? page.items : [])) || [],
  };

  const toggleArrayFilter = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key].includes(value) ? prev[key].filter(v => v !== value) : [...prev[key], value],
    }));
  };

  const setSingleFilter = (key, value) => {
    if (key.includes('.')) {
      const [parentKey, childKey] = key.split('.');
      const processedValue =
        (parentKey === 'contributionWindow' || parentKey === 'acquireWindow') && value
          ? new Date(value).toISOString()
          : value;

      setFilters(prev => ({
        ...prev,
        [parentKey]: {
          ...prev[parentKey],
          [childKey]: processedValue,
        },
      }));
    } else {
      let processedValue = value;
      if (key === 'reserveMet') {
        processedValue = value === 'Yes' ? true : value === 'No' ? false : value;
      } else if (key === 'vaultStage') {
        processedValue = value;
      }

      setFilters(prev => {
        const newValue = prev[key] === processedValue ? null : processedValue;
        return { ...prev, [key]: newValue };
      });
    }
  };

  const clearFilters = () => {
    const clearedFilters = {
      page: filters.page || 1,
      limit: filters.limit || 12,
      _clearTimestamp: Date.now(),
    };
    setFilters({
      page: clearedFilters.page,
      limit: clearedFilters.limit,
      tags: [],
      reserveMet: null,
      isOfficialPartner: false,
      minInitialVaultOffered: 0,
      maxInitialVaultOffered: 0,
      minTvl: 0,
      maxTvl: 0,
      minFdv: 0,
      maxFdv: 0,
      minFdvTvl: 0,
      maxFdvTvl: 0,
      tvlCurrency: 'ADA',
      fdvCurrency: 'ADA',
      vaultStage: '',
      governance: '',
      verified: [],
      assetWhitelist: [],
      contributionWindow: {
        from: '',
        to: '',
      },
      acquireWindow: {
        from: '',
        to: '',
      },
    });
    onApplyStage('All');
    onApplyFilters(clearedFilters);
    onClose();
  };

  const getActiveFilters = filters => {
    const filterRules = {
      tags: value => Array.isArray(value) && value.length > 0,
      reserveMet: value => typeof value === 'boolean',
      isOfficialPartner: value => value === true,
      minInitialVaultOffered: value => Number(value) > 0,
      maxInitialVaultOffered: value => Number(value) > 0,
      minTvl: value => Number(value) > 0,
      maxTvl: value => Number(value) > 0,
      minFdv: value => Number(value) > 0,
      maxFdv: value => Number(value) > 0,
      minFdvTvl: value => Number(value) > 0,
      maxFdvTvl: value => Number(value) > 0,
      assetWhitelist: value => Array.isArray(value) && value.length > 0,
    };

    const activeFilters = {};

    Object.entries(filterRules).forEach(([key, isValid]) => {
      if (key === 'reserveMet' || key === 'isOfficialPartner') {
        if (isValid(filters[key])) {
          activeFilters[key] = filters[key];
        }
      } else if (filters[key] && isValid(filters[key])) {
        activeFilters[key] = filters[key];
      }
    });

    const hasTvlFilters = Number(filters.minTvl) > 0 || Number(filters.maxTvl) > 0;
    const hasFdvFilters = Number(filters.minFdv) > 0 || Number(filters.maxFdv) > 0;
    const tvlCurrencyChanged = filters.tvlCurrency !== 'ADA';
    const fdvCurrencyChanged = filters.fdvCurrency !== 'ADA';

    if (hasTvlFilters || tvlCurrencyChanged) {
      activeFilters.tvlCurrency = filters.tvlCurrency;
    }

    if (hasFdvFilters || fdvCurrencyChanged) {
      activeFilters.fdvCurrency = filters.fdvCurrency;
    }

    ['contributionWindow', 'acquireWindow'].forEach(windowKey => {
      const window = filters[windowKey];
      if (window?.from || window?.to) {
        activeFilters[windowKey] = {};
        if (window.from) activeFilters[windowKey].from = window.from;
        if (window.to) activeFilters[windowKey].to = window.to;
      }
    });

    return activeFilters;
  };

  const applyFilters = () => {
    const activeFilters = getActiveFilters(filters);
    onApplyStage(filters.vaultStage);
    onApplyFilters(activeFilters);
    onClose();
  };

  const TVL_CURRENCY_OPTIONS = [
    { label: 'ADA', value: 'ADA' },
    { label: 'USD', value: 'USD' },
  ];

  const setRangeFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const renderRangeSection = ({ title, minKey, maxKey, showCurrency = true, currencyKey = 'tvlCurrency' }) => (
    <div>
      <h3 className="text-lg font-medium mb-3">{title}</h3>
      <div
        className={`grid grid-cols-1 gap-4 items-end ${showCurrency ? 'sm:grid-cols-4' : 'sm:grid-cols-[1fr_auto_1fr]'}`}
      >
        <LavaSteelInput
          type="number"
          min={0}
          placeholder="Min"
          value={filters[minKey]}
          onChange={value => setRangeFilter(minKey, value)}
        />
        <div className="hidden sm:flex items-center justify-center pb-2">to</div>
        <LavaSteelInput
          type="number"
          min={0}
          placeholder="Max"
          value={filters[maxKey]}
          onChange={value => setRangeFilter(maxKey, value)}
        />
        {showCurrency && (
          <LavaSteelSelect
            options={TVL_CURRENCY_OPTIONS}
            value={filters[currencyKey]}
            onChange={value => setRangeFilter(currencyKey, value)}
          />
        )}
      </div>
    </div>
  );

  const renderOptions = (options, activeValue, onClick, isMultiple = false) => (
    <div className="flex flex-wrap gap-2">
      {options.map(option => {
        let isSelected;
        if (isMultiple) {
          isSelected = filters[activeValue].includes(option);
        } else if (activeValue === 'reserveMet') {
          isSelected =
            (option === 'Yes' && filters[activeValue] === true) || (option === 'No' && filters[activeValue] === false);
        } else if (activeValue === 'vaultStage') {
          isSelected = filters[activeValue] === option;
        } else {
          isSelected = filters[activeValue] === option;
        }

        return (
          <Chip
            key={option}
            label={option}
            value={option}
            selected={isSelected}
            onSelect={() =>
              isMultiple ? toggleArrayFilter(activeValue, option) : setSingleFilter(activeValue, option)
            }
            size="lg"
          />
        );
      })}
    </div>
  );

  return (
    <ModalWrapper
      isOpen={isOpen}
      title="Vault Filters"
      modalName="VaultFiltersModal"
      onClose={onClose}
      footer={
        <div className="flex justify-between items-center border-t border-steel-850">
          <button onClick={clearFilters} className="text-gray-400 hover:text-white">
            Clear All
          </button>
          <div className="flex gap-2">
            <SecondaryButton onClick={onClose} size="sm">
              Cancel
            </SecondaryButton>
            <PrimaryButton onClick={applyFilters} size="sm">
              Apply
            </PrimaryButton>
          </div>
        </div>
      }
    >
      <div className="flex-1 space-y-6 text-sm">
        <div>
          <h3 className="text-lg font-medium mb-3">Vault Tags</h3>
          <div className="flex flex-wrap gap-2">
            {VAULT_TAGS_OPTIONS.map(tag => (
              <Chip
                key={tag.value}
                label={tag.label}
                value={tag.value}
                selected={filters.tags.includes(tag.value)}
                onSelect={() => toggleArrayFilter('tags', tag.value)}
              />
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-3">Reserve Met</h3>
          {renderOptions(OPTIONS.reserve, 'reserveMet', setSingleFilter)}
        </div>

        <div>
          <h3 className="text-lg font-medium mb-3">Official partner</h3>
          <div className="flex items-center gap-3">
            <LavaCheckbox
              name="isOfficialPartner"
              checked={filters.isOfficialPartner}
              label="Official L4VA partner vaults only"
              onChange={e => setFilters(prev => ({ ...prev, isOfficialPartner: e.target.checked }))}
            />
            <GoldenVerifiedBadge label="Official L4VA partner" />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-3">Vault Stage</h3>
          {renderOptions(OPTIONS.vaultStages, 'vaultStage', setSingleFilter)}
        </div>

        <div>
          <h3 className="text-lg font-medium mb-3">Initial % Vault Offered</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Min %"
                value={filters.minInitialVaultOffered}
                onChange={e => setSingleFilter('minInitialVaultOffered', e.target.value)}
                className="w-full pr-8 px-3 py-2 bg-steel-850 border border-steel-750 rounded-lg text-white placeholder-gray-500"
              />
              <div className="absolute inset-y-0 right-1 flex flex-col justify-center">
                <button
                  type="button"
                  onClick={() => {
                    const currentValue = Number(filters.minInitialVaultOffered) || 0;
                    setSingleFilter('minInitialVaultOffered', (currentValue + 1).toString());
                  }}
                  className="p-0.5 hover:bg-steel-700 rounded transition-colors"
                >
                  <ChevronUp size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const currentValue = Number(filters.minInitialVaultOffered) || 0;
                    if (currentValue > 0) {
                      setSingleFilter('minInitialVaultOffered', (currentValue - 1).toString());
                    }
                  }}
                  className="p-0.5 hover:bg-steel-700 rounded transition-colors"
                >
                  <ChevronDown size={16} />
                </button>
              </div>
            </div>
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Max %"
                value={filters.maxInitialVaultOffered}
                onChange={e => setSingleFilter('maxInitialVaultOffered', e.target.value)}
                className="w-full pr-8 px-3 py-2 bg-steel-850 border border-steel-750 rounded-lg text-white placeholder-gray-500"
              />
              <div className="absolute inset-y-0 right-1 flex flex-col justify-center">
                <button
                  type="button"
                  onClick={() => {
                    const currentValue = Number(filters.maxInitialVaultOffered) || 0;
                    setSingleFilter('maxInitialVaultOffered', (currentValue + 1).toString());
                  }}
                  className="p-0.5 hover:bg-steel-700 rounded transition-colors"
                >
                  <ChevronUp size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const currentValue = Number(filters.maxInitialVaultOffered) || 0;
                    if (currentValue > 0) {
                      setSingleFilter('maxInitialVaultOffered', (currentValue - 1).toString());
                    }
                  }}
                  className="p-0.5 hover:bg-steel-700 rounded transition-colors"
                >
                  <ChevronDown size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-3">Asset Whitelist</h3>
          <div>
            <LavaMultiSelect
              options={OPTIONS.assetWhitelist
                .filter(w => Boolean(w?.policyId))
                .map(w => ({
                  label: w.name,
                  value: w.policyId,
                }))}
              value={filters.assetWhitelist}
              onChange={val => setFilters(prev => ({ ...prev, assetWhitelist: val }))}
              placeholder="Select asset collections"
              showSelectAll
              selectAllLabel="Select all assets"
              className="font-bold"
              hasMore={Boolean(hasNextPage)}
              isInitialLoading={isInitialLoading}
              isFetching={isFetching}
              isFetchingMore={isFetchingNextPage}
              onSearchChange={setAssetWhitelistSearch}
              onReachListEnd={() => {
                if (hasNextPage && !isFetchingNextPage) {
                  fetchNextPage();
                }
              }}
            />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-3">Contribution Window</h3>
          <div className="flex flex-col gap-2">
            <LavaDatePicker
              variant="steel"
              label="Opening in:"
              value={filters.contributionWindow.from}
              onChange={date => setSingleFilter('contributionWindow.from', date)}
            />
            <LavaDatePicker
              variant="steel"
              label="Closing in:"
              value={filters.contributionWindow.to}
              onChange={date => setSingleFilter('contributionWindow.to', date)}
            />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-3">Acquire Window</h3>
          <div className="flex flex-col gap-2">
            <LavaDatePicker
              variant="steel"
              label="Opening in:"
              value={filters.acquireWindow.from}
              onChange={date => setSingleFilter('acquireWindow.from', date)}
            />
            <LavaDatePicker
              variant="steel"
              label="Closing in:"
              value={filters.acquireWindow.to}
              onChange={date => setSingleFilter('acquireWindow.to', date)}
            />
          </div>
        </div>

        {/*<div>*/}
        {/*  <h3 className="text-lg font-medium mb-3">Whitelisted</h3>*/}
        {/*  <div></div>*/}

        {/*</div>*/}
        {renderRangeSection({ title: 'TVL', minKey: 'minTvl', maxKey: 'maxTvl' })}
        {renderRangeSection({ title: 'FDV', minKey: 'minFdv', maxKey: 'maxFdv', currencyKey: 'fdvCurrency' })}
        {renderRangeSection({ title: 'FDV / TVL', minKey: 'minFdvTvl', maxKey: 'maxFdvTvl', showCurrency: false })}
        {/* {renderRangeField('Market Cap', 'marketCap')} */}
        {/* <div>
          <h3 className="text-lg font-medium mb-3">Governance</h3>
          {renderOptions(OPTIONS.governance, 'governance', setSingleFilter)}
        </div>
        <div>
          <h3 className="text-lg font-medium mb-3">Verified</h3>
          {renderOptions(OPTIONS.verified, 'verified', toggleArrayFilter, true)}
          
        </div> */}
      </div>
    </ModalWrapper>
  );
};
