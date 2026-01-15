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

  const [errors, setErrors] = useState({
    minPrice: '',
    maxPrice: '',
    minMcap: '',
    maxMcap: '',
    minTvl: '',
    maxTvl: '',
  });

  const validateRange = (minKey, maxKey, minValue, maxValue) => {
    const min = parseFloat(minValue);
    const max = parseFloat(maxValue);

    if (minValue && maxValue && !isNaN(min) && !isNaN(max)) {
      if (min > max) {
        return {
          [minKey]: 'Min value cannot be greater than max value',
          [maxKey]: 'Max value cannot be less than min value',
        };
      }
    }

    return { [minKey]: '', [maxKey]: '' };
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => {
      const newFilters = {
        ...prev,
        [key]: value,
      };

      setErrors(prevErrors => {
        let newErrors = { ...prevErrors };

        if (key === 'minPrice' || key === 'maxPrice') {
          const rangeErrors = validateRange('minPrice', 'maxPrice', newFilters.minPrice, newFilters.maxPrice);
          newErrors = { ...newErrors, ...rangeErrors };
        } else if (key === 'minMcap' || key === 'maxMcap') {
          const rangeErrors = validateRange('minMcap', 'maxMcap', newFilters.minMcap, newFilters.maxMcap);
          newErrors = { ...newErrors, ...rangeErrors };
        } else if (key === 'minTvl' || key === 'maxTvl') {
          const rangeErrors = validateRange('minTvl', 'maxTvl', newFilters.minTvl, newFilters.maxTvl);
          newErrors = { ...newErrors, ...rangeErrors };
        }

        return newErrors;
      });

      return newFilters;
    });
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
    setErrors({
      minPrice: '',
      maxPrice: '',
      minMcap: '',
      maxMcap: '',
      minTvl: '',
      maxTvl: '',
    });
    onApplyFilters(cleared);
    closeModal();
  };

  const applyFilters = () => {
    const hasErrors = Object.values(errors).some(error => error !== '');
    if (hasErrors) {
      return;
    }
    onApplyFilters(filters);
    closeModal();
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');
  const hasErrors = Object.values(errors).some(error => error !== '');

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
            <PrimaryButton onClick={applyFilters} size="sm" disabled={hasErrors}>
              Apply
            </PrimaryButton>
          </div>
        </div>
      }
    >
      <div className="flex-1 space-y-6 text-sm">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <LavaSteelInput
              label="Min Price"
              type="number"
              placeholder="Min price..."
              value={filters.minPrice}
              onChange={value => handleFilterChange('minPrice', value)}
              error={!!errors.minPrice}
            />
            {errors.minPrice && <p className="text-red-600 text-xs mt-1">{errors.minPrice}</p>}
          </div>
          <div>
            <LavaSteelInput
              label="Max Price"
              type="number"
              placeholder="Max price..."
              value={filters.maxPrice}
              onChange={value => handleFilterChange('maxPrice', value)}
              error={!!errors.maxPrice}
            />
            {errors.maxPrice && <p className="text-red-600 text-xs mt-1">{errors.maxPrice}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <LavaSteelInput
              label="Min Market Cap"
              type="number"
              placeholder="Min mcap..."
              value={filters.minMcap}
              onChange={value => handleFilterChange('minMcap', value)}
              error={!!errors.minMcap}
            />
            {errors.minMcap && <p className="text-red-600 text-xs mt-1">{errors.minMcap}</p>}
          </div>
          <div>
            <LavaSteelInput
              label="Max Market Cap"
              type="number"
              placeholder="Max mcap..."
              value={filters.maxMcap}
              onChange={value => handleFilterChange('maxMcap', value)}
              error={!!errors.maxMcap}
            />
            {errors.maxMcap && <p className="text-red-600 text-xs mt-1">{errors.maxMcap}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <LavaSteelInput
              label="Min TVL"
              type="number"
              placeholder="Min TVL..."
              value={filters.minTvl}
              onChange={value => handleFilterChange('minTvl', value)}
              error={!!errors.minTvl}
            />
            {errors.minTvl && <p className="text-red-600 text-xs mt-1">{errors.minTvl}</p>}
          </div>
          <div>
            <LavaSteelInput
              label="Max TVL"
              type="number"
              placeholder="Max TVL..."
              value={filters.maxTvl}
              onChange={value => handleFilterChange('maxTvl', value)}
              error={!!errors.maxTvl}
            />
            {errors.maxTvl && <p className="text-red-600 text-xs mt-1">{errors.maxTvl}</p>}
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
};
