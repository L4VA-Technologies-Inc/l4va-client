import { useCountAnimation } from '@/hooks/useCountAnimation';

const Counter = ({ value }) => {
  const animatedValue = useCountAnimation(value);
  return <span>{animatedValue}</span>;
};

const HeroStats = () => {
  const stats = [
    { label: 'Active Vaults', value: '132' },
    { label: 'TVL', value: '$38.60' },
    { label: 'Total Contributed', value: '$160.48' },
  ];

  return (
    <div className="flex flex-col sm:flex-row gap-8">
      {stats.map(stat => (
        <div key={stat.label} className="flex flex-col items-center text-2xl font-bold min-w-[240px]">
          <p>{stat.label}</p>
          <p className="text-orange-500 text-2xl sm:text-4xl">
            <Counter value={stat.value} />
          </p>
        </div>
      ))}
    </div>
  );
};

export default HeroStats;
