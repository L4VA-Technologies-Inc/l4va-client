import { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown, Check } from 'lucide-react';

import { useEpochs } from '@/hooks/useRewardsEpochs';

export const EpochSelector = ({ selectedEpochIds = [], onChange, mode = 'single' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { data: epochsData, isLoading } = useEpochs();

  useEffect(() => {
    const handleClickOutside = event => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const sortedEpochs = (epochsData?.epochs || []).sort((a, b) => b.epochNumber - a.epochNumber);

  const handleSelect = epochId => {
    if (mode === 'single') {
      // Toggle: if already selected, deselect (show all); otherwise select it
      const newSelection = selectedEpochIds.includes(epochId) ? [] : [epochId];
      onChange(newSelection);
      setIsOpen(false);
    } else {
      // Multi-select toggle
      const newSelection = selectedEpochIds.includes(epochId)
        ? selectedEpochIds.filter(id => id !== epochId)
        : [...selectedEpochIds, epochId];
      onChange(newSelection);
    }
  };

  const handleSelectAll = () => {
    onChange([]);
    setIsOpen(false);
  };

  const getLabel = () => {
    if (selectedEpochIds.length === 0) return 'All Epochs';
    if (selectedEpochIds.length === 1) {
      const epoch = sortedEpochs.find(e => e.id === selectedEpochIds[0]);
      return epoch ? `Epoch ${epoch.epochNumber}` : 'Selected Epoch';
    }
    const selectedNumbers = selectedEpochIds
      .map(id => sortedEpochs.find(e => e.id === id)?.epochNumber)
      .filter(Boolean)
      .sort((a, b) => a - b);
    return `Epochs ${selectedNumbers.join(', ')}`;
  };

  if (isLoading) {
    return <div className="h-10 w-40 bg-gray-800/50 rounded-lg animate-pulse" />;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white hover:border-gray-600 transition-colors"
      >
        <Calendar className="w-4 h-4 text-gray-400" />
        <span>{getLabel()}</span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-56 bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden">
          {/* All Epochs option */}
          <button
            onClick={handleSelectAll}
            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left hover:bg-gray-700/50 transition-colors ${
              selectedEpochIds.length === 0 ? 'text-orange-400 bg-orange-500/10' : 'text-gray-300'
            }`}
          >
            <div className="w-4 h-4 flex items-center justify-center">
              {selectedEpochIds.length === 0 && <Check className="w-4 h-4" />}
            </div>
            <span className="font-medium">All Epochs</span>
          </button>

          <div className="border-t border-gray-700" />

          {/* Epoch list */}
          <div className="max-h-64 overflow-y-auto">
            {sortedEpochs.map(epoch => {
              const isSelected = selectedEpochIds.includes(epoch.id);
              return (
                <button
                  key={epoch.id}
                  onClick={() => handleSelect(epoch.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left hover:bg-gray-700/50 transition-colors ${
                    isSelected ? 'text-orange-400 bg-orange-500/10' : 'text-gray-300'
                  }`}
                >
                  <div className="w-4 h-4 flex items-center justify-center">
                    {isSelected && <Check className="w-4 h-4" />}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">Epoch {epoch.epochNumber}</div>
                    <div className="text-xs text-gray-500">
                      {epoch.status === 'active' && '● Active'}
                      {epoch.status === 'finalized' && 'Finalized'}
                      {epoch.status === 'processing' && '⏳ Processing'}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
