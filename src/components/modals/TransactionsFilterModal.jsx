import { useState } from 'react';

import { ModalWrapper } from '@/components/shared/ModalWrapper';
import { useModalControls } from '@/lib/modals/modal.context';
import SecondaryButton from '@/components/shared/SecondaryButton.js';
import { Chip } from '@/components/shared/Chip.jsx';
import PrimaryButton from '@/components/shared/PrimaryButton.js';
import { LavaDatePicker } from '@/components/shared/LavaDatePicker.jsx';

const OPTIONS = {
  status: ['created', 'pending', 'submitted', 'confirmed', 'failed', 'stuck'],
  order: [
    { value: 'DESC', label: 'Newest first' },
    { value: 'ASC', label: 'Oldest first' },
  ],
};

export const TransactionFilterModal = ({ initialFilters, onApplyFilters }) => {
  const { closeModal } = useModalControls();

  const [filters, setFilters] = useState({
    status: initialFilters.status || [],
    order: initialFilters.order || 'DESC',
    period: {
      from: initialFilters.period?.from ? new Date(initialFilters.period.from).toISOString() : '',
      to: initialFilters.period?.to ? new Date(initialFilters.period.to).toISOString() : '',
    },
  });

  const renderOptions = (options, activeValue, onClick, isMultiple = false) => (
    <div className="flex flex-wrap gap-2">
      {options.map(option => {
        let isSelected;
        if (isMultiple) {
          isSelected = filters[activeValue].includes(option);
        } else if (activeValue === 'order') {
          isSelected = filters[activeValue] === option.value;
        }

        return (
          <Chip
            key={option.value}
            label={option.label}
            value={option.value}
            selected={isSelected}
            onSelect={() =>
              isMultiple ? toggleArrayFilter(activeValue, option.value) : setSingleFilter(activeValue, option.value)
            }
          />
        );
      })}
    </div>
  );

  const toggleArrayFilter = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key].includes(value) ? prev[key].filter(v => v !== value) : [...prev[key], value],
    }));
  };

  const setSingleFilter = (key, value) => {
    if (key.includes('.')) {
      const [parentKey, childKey] = key.split('.');
      const processedValue = parentKey === 'period' && value ? new Date(value).toISOString() : value;

      setFilters(prev => ({
        ...prev,
        [parentKey]: {
          ...prev[parentKey],
          [childKey]: processedValue,
        },
      }));
    } else {
      let processedValue = value;
      if (key === 'order') {
        processedValue = value;
      }
      setFilters(prev => {
        const newValue = prev[key] === processedValue ? null : processedValue;
        return { ...prev, [key]: newValue };
      });
    }
  };

  const clearFilters = () => {
    const cleared = {
      status: [],
      order: 'DESC',
    };

    setFilters(cleared);
    onApplyFilters(cleared);
    closeModal();
  };

  const applyFilters = () => {
    onApplyFilters(filters);
    closeModal();
  };

  return (
    <ModalWrapper
      isOpen
      title="Filters"
      onClose={closeModal}
      footer={
        <div className="flex justify-between items-center border-t border-steel-850">
          <button onClick={clearFilters} className="text-gray-400 hover:text-white">
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
        <div>
          <h3 className="text-lg font-medium mb-3">Transaction Statuses</h3>
          <div className="flex flex-wrap gap-2">
            {OPTIONS.status.map(status => (
              <Chip
                key={status}
                label={status}
                value={status}
                selected={filters.status.includes(status)}
                onSelect={() => toggleArrayFilter('status', status)}
              />
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-3">Order</h3>
          {renderOptions(OPTIONS.order, 'order', setSingleFilter)}
        </div>

        <div>
          <h3 className="text-lg font-medium mb-3">Period</h3>
          <div className="flex flex-col gap-2">
            <LavaDatePicker
              variant="steel"
              label="From:"
              value={filters.period.from}
              minDate={new Date(0)}
              onChange={date => setSingleFilter('period.from', date)}
            />
            <LavaDatePicker
              variant="steel"
              label="To:"
              value={filters.period.to}
              minDate={new Date(0)}
              onChange={date => setSingleFilter('period.to', date)}
            />
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
};
