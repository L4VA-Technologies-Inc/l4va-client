import { Filter, GridIcon, ListIcon } from 'lucide-react';

import SecondaryButton from '@/components/shared/SecondaryButton';

const ViewToggle = ({ activeView, onViewChange }) => (
  <div className="flex items-center space-x-2">
    <button className="p-2 hover:bg-steel-800" onClick={() => onViewChange('grid')} aria-label="Grid view">
      <GridIcon
        className="w-4 h-4"
        color={activeView === 'grid' ? 'var(--color-dark-100)' : 'var(--color-steel-750)'}
      />
    </button>
    <button className="p-2 hover:bg-steel-800" onClick={() => onViewChange('table')} aria-label="Table view">
      <ListIcon
        className="w-4 h-4"
        color={activeView === 'table' ? 'var(--color-dark-100)' : 'var(--color-steel-750)'}
      />
    </button>
  </div>
);

const VaultFilter = ({ handleOpenFilters, viewType, setViewType }) => {
  return (
    <div className="flex items-center w-full sm:w-auto gap-2">
      <SecondaryButton onClick={handleOpenFilters} className="w-full sm:w-auto">
        <Filter className="w-4 h-4" />
        Filters
      </SecondaryButton>
      <ViewToggle activeView={viewType} onViewChange={setViewType} />
    </div>
  );
};

export default VaultFilter;
