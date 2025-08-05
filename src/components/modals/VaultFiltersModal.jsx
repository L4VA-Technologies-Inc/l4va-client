import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

import { VAULT_TAGS_OPTIONS } from '@/components/vaults/constants/vaults.constants.js';
import PrimaryButton from '@/components/shared/PrimaryButton';
import SecondaryButton from '@/components/shared/SecondaryButton';
import { Chip } from '@/components/shared/Chip';
import { ModalWrapper } from '@/components/shared/ModalWrapper';

export const VaultFiltersModal = ({ isOpen, onClose, onApplyFilters, initialFilters = {} }) => {
  const [filters, setFilters] = useState({
    tags: initialFilters.tags || [],
    reserveMet: initialFilters.reserveMet || '',
    vaultStage: initialFilters.vaultStage || '',
    initialVaultPercentage: initialFilters.initialVaultPercentage || { min: '', max: '' },
    tvl: initialFilters.tvl || { min: '', max: '', currency: 'ADA' },
    marketCap: initialFilters.marketCap || { min: '', max: '', currency: 'ADA' },
    governance: initialFilters.governance || '',
    verified: initialFilters.verified || [],
  });

  const OPTIONS = {
    vaultStages: ['Created', 'Contribution', 'Acquire', 'Locked', 'Terminated'],
    reserve: ['Yes', 'No'],
    governance: ['Active Proposals', 'No Active Proposals'],
    verified: ['All Assets Verified', 'Some Assets Verified', 'No Assets Verified'],
  };

  const toggleArrayFilter = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key].includes(value) ? prev[key].filter(v => v !== value) : [...prev[key], value],
    }));
  };

  const setSingleFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleRangeChange = (field, type, value) => {
    setFilters(prev => ({ ...prev, [field]: { ...prev[field], [type]: value } }));
  };

  const handleCurrencyChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: { ...prev[field], currency: value } }));
  };

  const clearFilters = () => {
    setFilters({
      tags: [],
      reserveMet: '',
      vaultStage: '',
      initialVaultPercentage: { min: '', max: '' },
      tvl: { min: '', max: '', currency: 'ADA' },
      marketCap: { min: '', max: '', currency: 'ADA' },
      governance: '',
      verified: [],
    });
  };

  const applyFilters = () => {
    onApplyFilters(filters);
    onClose();
  };

  const renderOptions = (options, activeValue, onClick, isMultiple = false) => (
    <div className="flex flex-wrap gap-2">
      {options.map(option => (
        <Chip
          key={option}
          label={option}
          value={option}
          selected={isMultiple ? filters[activeValue].includes(option) : filters[activeValue] === option}
          onSelect={() => (isMultiple ? toggleArrayFilter(activeValue, option) : setSingleFilter(activeValue, option))}
          size="lg"
        />
      ))}
    </div>
  );

  const renderRangeField = (label, field) => (
    <div>
      <h3 className="text-lg font-medium mb-3">{label}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <input
          type="number"
          placeholder="Min"
          className="col-span-1 px-3 py-2 bg-steel-850 border border-steel-750 rounded-lg text-white placeholder-gray-500"
          value={filters[field].min}
          onChange={e => handleRangeChange(field, 'min', e.target.value)}
        />
        <div className="hidden sm:flex items-center justify-center">to</div>
        <input
          type="number"
          placeholder="Max"
          className="col-span-1 px-3 py-2 bg-steel-850 border border-steel-750 rounded-lg text-white placeholder-gray-500"
          value={filters[field].max}
          onChange={e => handleRangeChange(field, 'max', e.target.value)}
        />
        <div className="relative">
          <select
            value={filters[field].currency}
            onChange={e => handleCurrencyChange(field, e.target.value)}
            className="w-full px-3 py-2 bg-steel-850 border border-steel-750 rounded-lg text-white appearance-none cursor-pointer"
          >
            <option value="ADA">ADA</option>
            <option value="USD">USD</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>
      </div>
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
      <div className="flex-1 overflow-y-auto space-y-6 text-sm">
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
            <input
              type="number"
              placeholder="Min %"
              value={filters.initialVaultPercentage.min}
              onChange={e => handleRangeChange('initialVaultPercentage', 'min', e.target.value)}
              className="w-full px-3 py-2 bg-steel-850 border border-steel-750 rounded-lg text-white placeholder-gray-500"
            />
            <input
              type="number"
              placeholder="Max %"
              value={filters.initialVaultPercentage.max}
              onChange={e => handleRangeChange('initialVaultPercentage', 'max', e.target.value)}
              className="w-full px-3 py-2 bg-steel-850 border border-steel-750 rounded-lg text-white placeholder-gray-500"
            />
          </div>
        </div>
        {renderRangeField('TVL', 'tvl')}
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
