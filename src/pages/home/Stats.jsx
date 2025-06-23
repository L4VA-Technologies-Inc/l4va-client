import { formatNum } from '@/utils/core.utils.js';

const getBackgroundColor = index => {
  const colors = ['bg-red-900', 'bg-red-800', 'bg-red-700', 'bg-red-600', 'bg-red-500'];
  return colors[index] || colors[colors.length - 1];
};

const StatCard = ({ value, label }) => (
  <div className="text-center p-6">
    <p className="font-russo text-red-600 text-3xl lg:text-6xl xl:text-7xl font-bold mb-2">{value}</p>
    <p className="font-bold font-satoshi text-lg lg:text-2xl xl:text-3xl">{label}</p>
  </div>
);

const ProgressBar = ({ items, title, totalAmount }) => {
  const total = items.reduce((sum, item) => sum + item.percentage, 0);

  const itemsWithValues = items.map(item => ({
    ...item,
    actualValue: Math.round((item.percentage / total) * totalAmount),
  }));

  return (
    <div className="mb-16">
      <h2 className="text-2xl lg:text-5xl xl:text-6xl font-extrabold text-red-600 mb-8">{title}</h2>
      <div className="space-y-8">
        <div className="grid gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {itemsWithValues.map((item, index) => (
              <div key={`label-${item.label}`} className="flex items-start gap-3 bg-gray-900/50 p-3 rounded-lg">
                <div className={`w-3 h-3 rounded-sm mt-1 ${getBackgroundColor(index)}`} />
                <div>
                  <div className="text-dark-100 text-sm lg:text-base">{item.label}</div>
                  <div className="text-base lg:text-lg xl:text-xl font-semibold">{item.percentage.toFixed(2)}%</div>
                  <div className="text-dark-100 text-sm lg:text-base">{formatNum(item.actualValue)} ADA</div>
                </div>
              </div>
            ))}
          </div>
          <div className="relative h-[60px] w-full flex rounded-sm">
            {itemsWithValues.map((item, index) => (
              <div
                key={`bar-${item.label}`}
                className={`h-full ${getBackgroundColor(index)} relative group transition-all duration-200 hover:brightness-110`}
                style={{ width: `${(item.percentage / total) * 100}%` }}
              >
                <div
                  className="fixed top-0 left-0 opacity-0 group-hover:opacity-100 transition-all duration-200 z-[9999]"
                  style={{
                    transform: 'translateX(-50%) translateY(-100%)',
                    left: '50%',
                  }}
                >
                  <div className="bg-steel-950 text-sm py-1 px-2 rounded whitespace-nowrap shadow-lg">
                    {item.label}: {formatNum(item.actualValue)} ADA
                    <div className="absolute left-1/2 top-full -translate-x-1/2 -mt-[1px] border-4 border-transparent border-t-steel-850" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const Stats = () => {
  const totalAmount = 25000000; // 25 million ADA

  const stats = [
    { label: 'MyVaults', value: '158' },
    { label: 'Assets', value: '486' },
    { label: 'Acquired', value: '$9M+' },
    { label: 'TVL All MyVaults', value: '$18M+' },
  ];

  const statusData = [
    { label: 'Draft', percentage: 10.0 },
    { label: 'Contribution', percentage: 22.0 },
    { label: 'Acquire', percentage: 16.33 },
    { label: 'Locked', percentage: 18.0 },
    { label: 'Terminated', percentage: 33.67 },
  ];

  const typesData = [
    { label: 'Private', percentage: 30.33 },
    { label: 'Semi-Private', percentage: 26.0 },
    { label: 'Public', percentage: 43.67 },
  ];

  return (
    <div className="container mx-auto py-12 sm:py-16">
      <h1 className="font-russo font-bold text-3xl lg:text-6xl xl:text-7xl mb-8">QUICK STATS</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mb-8">
        {stats.map(stat => (
          <StatCard key={stat.label} label={stat.label} value={stat.value} />
        ))}
      </div>
      <div className="space-y-16">
        <ProgressBar items={statusData} title="Vault by Stage" totalAmount={totalAmount} />
        <ProgressBar items={typesData} title="Vault by Types" totalAmount={totalAmount} />
      </div>
    </div>
  );
};
