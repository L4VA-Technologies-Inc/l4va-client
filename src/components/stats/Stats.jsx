import React from 'react';

const ProgressBar = ({ items }) => (
  <div className="relative mb-2">
    {/* Labels above the bars - visible only on mobile */}
    <div className="md:hidden space-y-4 mb-8">
      {items.map((item, index) => (
        <div key={`label-${index}`} className="flex justify-between items-center">
          <p className="text-gray-300 text-sm">{item.label}</p>
          <p className="text-white text-lg font-bold">{item.value}</p>
        </div>
      ))}
    </div>

    {/* Progress bars */}
    <div className="h-12 mt-24">
      <div className="flex h-full">
        {items.map((item, index) => (
          <div
            key={`bar-${index}`}
            className={`relative group h-full transition-all duration-500 ${item.color}`}
            style={{ width: item.percentage }}
          >
            {/* Desktop labels - hidden on mobile */}
            <div className="hidden md:block absolute left-0 -top-16">
              <p className="text-gray-300 text-sm whitespace-nowrap">{item.label}</p>
              <p className="text-white text-xl font-bold">{item.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const StatCard = ({ value, label }) => (
  <div className="bg-slate-800 p-6 rounded-lg transform transition-all duration-300 hover:scale-105 hover:bg-slate-700">
    <p className="text-red-500 text-3xl md:text-5xl font-bold mb-2 animate-fadeIn">{value}</p>
    <p className="text-white text-lg md:text-xl">{label}</p>
  </div>
);

export const Stats = () => {
  const vaultStatus = [
    { label: 'Draft', value: '10.00%', percentage: '10%', color: 'bg-red-900' },
    { label: 'Contribution', value: '22.00%', percentage: '22%', color: 'bg-red-800' },
    { label: 'Investment', value: '16.33%', percentage: '16.33%', color: 'bg-red-700' },
    { label: 'Locked', value: '18.00%', percentage: '18%', color: 'bg-red-600' },
    { label: 'Terminated', value: '33.67%', percentage: '33.67%', color: 'bg-red-500' }
  ];

  const vaultTypes = [
    { label: 'Private', value: '30.33%', percentage: '30.33%', color: 'bg-red-800' },
    { label: 'Semi-Private', value: '26.00%', percentage: '26%', color: 'bg-red-600' },
    { label: 'Public', value: '43.67%', percentage: '43.67%', color: 'bg-red-500' }
  ];

  return (
    <div className="container mx-auto bg-slate-900 p-4 md:p-8 rounded-lg">
      <h1 className="text-white text-2xl md:text-4xl font-bold mb-8 md:mb-12 animate-fadeIn">
        QUICK STATS
      </h1>


      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mb-8">
        <StatCard value="158" label="Vaults" />
        <StatCard value="486" label="Assets" />
        <StatCard value="$9M+" label="Invested" />
        <StatCard value="$18M+" label="TVL All Vaults" />
      </div>

      <div className="space-y-12 md:space-y-16">
        {/* Vault Status Section */}
        <div>
          <h2 className="text-red-500 text-2xl md:text-3xl font-bold mb-8">
            Vault Status
          </h2>
          <ProgressBar items={vaultStatus} />
        </div>

        {/* Vault Types Section */}
        <div>
          <h2 className="text-red-500 text-2xl md:text-3xl font-bold mb-8">
            Vault Types
          </h2>
          <ProgressBar items={vaultTypes} />
        </div>
      </div>
    </div>
  );
};
