import { PrimaryButton } from '@/components/shared/PrimaryButton';
import { SecondaryButton } from '@/components/shared/SecondaryButton';
import { Features } from '@/components/Features';
import { Vaults } from '@/components/vaults/Vaults';
import { InvestmentsTable } from '@/components/investments/InvestmentsTable';
import { Stats } from '@/components/stats/Stats';
import { HeroHeader } from '@/components/HeroHeader';
import { HeroStats } from '@/components/HeroStats';

export const Home = () => (
  <div className="relative">
    <div
      className="absolute inset-0 -z-10 bg-cover bg-center bg-no-repeat h-[768px]"
      style={{ backgroundImage: 'url(/assets/hero-bg.webp)' }}
    />
    <div className="pt-32 lg:pt-[214px] pb-[90px] px-4">
      <div className="container mx-auto">
        <div className="mb-[60px]">
          <HeroHeader/>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 mb-[60px]">
          <PrimaryButton>VIEW VAULTS</PrimaryButton>
          <SecondaryButton>CREATE VAULT</SecondaryButton>
        </div>
        <HeroStats />
      </div>
    </div>
    <Features/>
    <Vaults/>
    <InvestmentsTable/>
    <Stats/>
  </div>
);
