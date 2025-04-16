import { useCountAnimation } from '@/hooks/useCountAnimation';

const Counter = ({ value }) => {
  const animatedValue = useCountAnimation(value);
  return <span>{animatedValue}</span>;
};

export const HeroStats = () => {
  const stats = [
    { label: 'Active Vaults', value: '132' },
    { label: 'TVL', value: '$38.60' },
    { label: 'Total Contributed', value: '$160.48' },
  ];

  return (
    <div className="flex flex-col sm:flex-row gap-10 text-center">
      {stats.map((stat) => (
        <div key={stat.label} className="min-w-[210px]">
          <div className=" mt-2 text-2xl font-bold font-satoshi">
            {stat.label}
          </div>
          <div className="font-russo text-orange-500 text-2xl sm:text-3xl lg:text-4xl font-bold">
            <Counter value={stat.value}/>
          </div>
        </div>
      ))}
    </div>
  );
};
