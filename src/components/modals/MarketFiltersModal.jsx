import { useState } from 'react';
import clsx from 'clsx';

import { ModalWrapper } from '@/components/shared/ModalWrapper';
import { useModalControls } from '@/lib/modals/modal.context';
import SecondaryButton from '@/components/shared/SecondaryButton.js';
import PrimaryButton from '@/components/shared/PrimaryButton.js';
import { LavaSteelInput } from '@/components/shared/LavaInput.jsx';

export const MarketFiltersModal = ({ initialFilters, onApplyFilters }) => {
  const { closeModal } = useModalControls();

  const [filters, setFilters] = useState({
    minPrice: initialFilters.minPrice || '',
    maxPrice: initialFilters.maxPrice || '',
    minMcap: initialFilters.minMcap || '',
    maxMcap: initialFilters.maxMcap || '',
    minTvl: initialFilters.minTvl || '',
    maxTvl: initialFilters.maxTvl || '',
  });

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const clearFilters = () => {
    const cleared = {
      minPrice: '',
      maxPrice: '',
      minMcap: '',
      maxMcap: '',
      minTvl: '',
      maxTvl: '',
    };

    setFilters(cleared);
    onApplyFilters(cleared);
    closeModal();
  };

  const applyFilters = () => {
    onApplyFilters(filters);
    closeModal();
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  return (
    <ModalWrapper
      isOpen
      title="Filters"
      onClose={closeModal}
      footer={
        <div className="flex justify-between items-center border-t border-steel-850">
          <button
            onClick={clearFilters}
            className={clsx(
              'text-sm',
              hasActiveFilters ? 'text-gray-400 hover:text-white' : 'text-gray-600 cursor-not-allowed'
            )}
            disabled={!hasActiveFilters}
          >
            Clear All
          </button>
          <div className="flex gap-2">
            <SecondaryButton onClick={closeModal} size="sm">
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
        <div className="grid grid-cols-2 gap-4">
          <LavaSteelInput
            label="Min Price"
            type="number"
            placeholder="Min price..."
            value={filters.minPrice}
            onChange={value => handleFilterChange('minPrice', value)}
          />
          <LavaSteelInput
            label="Max Price"
            type="number"
            placeholder="Max price..."
            value={filters.maxPrice}
            onChange={value => handleFilterChange('maxPrice', value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <LavaSteelInput
            label="Min Market Cap"
            type="number"
            placeholder="Min mcap..."
            value={filters.minMcap}
            onChange={value => handleFilterChange('minMcap', value)}
          />
          <LavaSteelInput
            label="Max Market Cap"
            type="number"
            placeholder="Max mcap..."
            value={filters.maxMcap}
            onChange={value => handleFilterChange('maxMcap', value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <LavaSteelInput
            label="Min TVL"
            type="number"
            placeholder="Min TVL..."
            value={filters.minTvl}
            onChange={value => handleFilterChange('minTvl', value)}
          />
          <LavaSteelInput
            label="Max TVL"
            type="number"
            placeholder="Max TVL..."
            value={filters.maxTvl}
            onChange={value => handleFilterChange('maxTvl', value)}
          />
        </div>
      </div>
    </ModalWrapper>
  );
};
