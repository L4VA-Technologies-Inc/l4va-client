import { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

import { VAULT_TAGS_OPTIONS } from '@/components/vaults/constants/vaults.constants.js';
import PrimaryButton from '@/components/shared/PrimaryButton';
import SecondaryButton from '@/components/shared/SecondaryButton';
import { Chip } from '@/components/shared/Chip';
import { ModalWrapper } from '@/components/shared/ModalWrapper';
import { LavaSteelSelect } from '@/components/shared/LavaSelect.jsx';
import { LavaDatePicker } from '@/components/shared/LavaDatePicker.jsx';

export const VaultFiltersModal = ({
  isOpen,
  onClose,
  onApplyFilters,
  initialFilters = {},
  onApplyStage,
  activeStage,
}) => {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 12,
    tags: initialFilters.tags || [],
    reserveMet: initialFilters.reserveMet ?? null,
    minInitialVaultOffered: initialFilters.minInitialVaultOffered || 0,
    maxInitialVaultOffered: initialFilters.maxInitialVaultOffered || 0,
    minTvl: initialFilters.minTvl || 0,
    maxTvl: initialFilters.maxTvl || 0,
    tvlCurrency: initialFilters.tvlCurrency || 'ADA',
    vaultStage: activeStage || '',
    governance: initialFilters.governance || '',
    verified: initialFilters.verified || [],
    assetWhitelist: initialFilters.assetWhitelist || '',
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

  const OPTIONS = {
    vaultStages: ['Upcoming', 'Contribute', 'Acquire', 'Locked', 'Terminated'],
    reserve: ['Yes', 'No'],
    governance: ['Active Proposals', 'No Active Proposals'],
    verified: ['All Assets Verified', 'Some Assets Verified', 'No Assets Verified'],
    assetWhitelist: [
      { name: 'None', policyId: null },
      { name: 'Snake', policyId: 'f61a534fd4484b4b58d5ff18cb77cfc9e74ad084a18c0409321c811a' },
      { name: 'Chaddy', policyId: 'ed8145e0a4b8b54967e8f7700a5ee660196533ded8a55db620cc6a37' },
      { name: 'Pxlz', policyId: '755457ffd6fffe7b20b384d002be85b54a0b3820181f19c5f9032c2e' },
      { name: 'Berry', policyId: 'fd948c7248ecef7654f77a0264a188dccc76bae5b73415fc51824cf3' },
      { name: 'O', policyId: 'add6529cc60380af5d51566e32925287b5b04328332652ccac8de0a9' },
      { name: 'Goats', policyId: '4e529151fe66164ebcf52f81033eb0ec55cc012cb6c436104b30fa36' },
      { name: 'Diamond', policyId: '0b89a746fd2d859e0b898544487c17d9ac94b187ea4c74fd0bfbab16' },
      { name: 'GOLD', policyId: '436ca2e51fa2887fa306e8f6aa0c8bda313dd5882202e21ae2972ac8' },
      { name: 'SLVR', policyId: '0d27d4483fc9e684193466d11bc6d90a0ff1ab10a12725462197188a' },
      { name: 'Insurance Asset', policyId: '53173a3d7ae0a0015163cc55f9f1c300c7eab74da26ed9af8c052646' },
      { name: 'Real Estate Equity', policyId: '91918871f0baf335d32be00af3f0604a324b2e0728d8623c0d6e2601' },
    ],
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
      minInitialVaultOffered: 0,
      maxInitialVaultOffered: 0,
      minTvl: 0,
      maxTvl: 0,
      tvlCurrency: 'ADA',
      vaultStage: '',
      governance: '',
      verified: [],
      assetWhitelist: '',
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
      minInitialVaultOffered: value => Number(value) > 0,
      maxInitialVaultOffered: value => Number(value) > 0,
      minTvl: value => Number(value) > 0,
      maxTvl: value => Number(value) > 0,
      assetWhitelist: value => value !== '',
    };

    const activeFilters = {};

    Object.entries(filterRules).forEach(([key, isValid]) => {
      if (key === 'reserveMet') {
        if (typeof filters[key] === 'boolean') {
          activeFilters[key] = filters[key];
        }
      } else if (filters[key] && isValid(filters[key])) {
        activeFilters[key] = filters[key];
      }
    });

    const hasTvlFilters = Number(filters.minTvl) > 0 || Number(filters.maxTvl) > 0;
    const currencyChanged = filters.tvlCurrency !== 'ADA';

    if (hasTvlFilters) {
      activeFilters.tvlCurrency = filters.tvlCurrency;
    } else if (currencyChanged) {
      activeFilters.tvlCurrency = filters.tvlCurrency;
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
            <LavaSteelSelect
              options={OPTIONS.assetWhitelist.map(w => ({
                label: w.name,
                value: w.policyId,
              }))}
              value={filters.assetWhitelist}
              onChange={val => setSingleFilter('assetWhitelist', val)}
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
        <div>
          <h3 className="text-lg font-medium mb-3">TVL</h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Min"
                value={filters.minTvl}
                onChange={e => setSingleFilter('minTvl', e.target.value)}
                className="w-full pr-8 px-3 py-2 bg-steel-850 border border-steel-750 rounded-lg text-white placeholder-gray-500"
              />
              <div className="absolute inset-y-0 right-1 flex flex-col justify-center">
                <button
                  type="button"
                  onClick={() => {
                    const currentValue = Number(filters.minTvl) || 0;
                    setSingleFilter('minTvl', (currentValue + 1).toString());
                  }}
                  className="p-0.5 hover:bg-steel-700 rounded transition-colors"
                >
                  <ChevronUp size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const currentValue = Number(filters.minTvl) || 0;
                    if (currentValue > 0) {
                      setSingleFilter('minTvl', (currentValue - 1).toString());
                    }
                  }}
                  className="p-0.5 hover:bg-steel-700 rounded transition-colors"
                >
                  <ChevronDown size={16} />
                </button>
              </div>
            </div>
            <div className="hidden sm:flex items-center justify-center">to</div>
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Max"
                value={filters.maxTvl}
                onChange={e => setSingleFilter('maxTvl', e.target.value)}
                className="w-full pr-8 px-3 py-2 bg-steel-850 border border-steel-750 rounded-lg text-white placeholder-gray-500"
              />
              <div className="absolute inset-y-0 right-1 flex flex-col justify-center">
                <button
                  type="button"
                  onClick={() => {
                    const currentValue = Number(filters.maxTvl) || 0;
                    setSingleFilter('maxTvl', (currentValue + 1).toString());
                  }}
                  className="p-0.5 hover:bg-steel-700 rounded transition-colors"
                >
                  <ChevronUp size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const currentValue = Number(filters.maxTvl) || 0;
                    if (currentValue > 0) {
                      setSingleFilter('maxTvl', (currentValue - 1).toString());
                    }
                  }}
                  className="p-0.5 hover:bg-steel-700 rounded transition-colors"
                >
                  <ChevronDown size={16} />
                </button>
              </div>
            </div>
            <div className="relative">
              <select
                value={filters.tvlCurrency}
                onChange={e => setSingleFilter('tvlCurrency', e.target.value)}
                className="w-full px-3 py-2 bg-steel-850 border border-steel-750 rounded-lg text-white appearance-none cursor-pointer"
              >
                <option value="ADA">ADA</option>
                <option value="USD">USD</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
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
