import React, { useState } from 'react';

export const VaultsFilters = () => {
  const [activeFilter, setActiveFilter] = useState('OPEN');
  const filters = ['OPEN', 'UPCOMING', 'LOCKED'];

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-0 mb-4 md:mb-8">
      <p className="uppercase  font-russo text-2xl md:text-4xl">
        Vaults
      </p>
      <div className="flex flex-wrap md:flex-nowrap gap-2 md:gap-8">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`
            cursor-pointer font-satoshi w-full md:w-44 h-12 md:h-[60px] rounded-lg
            transition-all duration-200 text-base md:text-xl font-semibold
            ${activeFilter === filter
              ? 'bg-main-red  border-transparent'
              : `
                bg-transparent backdrop-blur-sm
                border-2 border-white/5
                text-dark-100
                hover:bg-white/10
                hover:border-white/30
              `}
            hover:opacity-90
          `}
          >
            {filter}
          </button>
        ))}
      </div>
    </div>
  );
};
