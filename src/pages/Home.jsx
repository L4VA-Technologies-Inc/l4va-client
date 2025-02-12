import { PrimaryButton } from '../components/shared/PrimaryButton';
import { SecondaryButton } from '../components/shared/SecondaryButton';
import { Features } from '../components/Features';
import { Vaults } from '@/components/vaults/Vaults';
import { InvestmentsTable } from '@/components/investments/InvestmentsTable';
import { Stats } from '@/components/stats/Stats';
import { HeroHeader } from '@/components/HeroHeader';

export const Home = () => {
  const stats = [
    { label: 'Active Vaults', value: '132' },
    { label: 'TVL', value: '$38.60 M' },
    { label: 'Total Contributed', value: '$160.48 M' },
  ];

  return (
    <div className="relative">
      <div
        className="absolute inset-0 bg-no-repeat -z-10"
        style={{ backgroundImage: 'url(/assets/hero-bg.webp)' }}
      />
      <div className="pt-32 lg:pt-40 px-4">
        <div className="container mx-auto">
          <HeroHeader />
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <PrimaryButton>VIEW VAULTS</PrimaryButton>
            <SecondaryButton>CREATE VAULT</SecondaryButton>
          </div>
          <div className="mt-16">
            <div className="flex gap-10 text-center">
              {stats.map((stat) => (
                <div key={stat.label} className="min-w-[210px]">
                  <div className="text-primary-text mt-2 text-2xl font-bold font-satoshi">
                    {stat.label}
                  </div>
                  <div className="font-russo text-main-orange text-2xl sm:text-3xl lg:text-4xl font-bold">
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="py-20">
        <Features />
      </div>
      <div className="py-20">
        <Vaults />
      </div>
      <div className="py-20">
        <InvestmentsTable />
      </div>
      <div className="py-20">
        <Stats />
      </div>
    </div>
  );
};
