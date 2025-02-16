import { PrimaryButton } from '@/components/shared/PrimaryButton';
import { SecondaryButton } from '@/components/shared/SecondaryButton';
import { Features } from '@/components/Features';
import { InvestmentsTable } from '@/components/investments/InvestmentsTable';
import { Stats } from '@/components/stats/Stats';
import { HeroHeader } from '@/components/HeroHeader';
import { HeroStats } from '@/components/HeroStats';
import { Faq } from '@/components/faq/Faq.jsx';
import { VaultsFilters } from '@/components/vaults/home/VaultsFilters';
import { SearchInput } from '@/components/shared/SearchInput';
import { MainFilters } from '@/components/vaults/home/MainFilters';
import { VaultsList } from '@/components/vaults/home/VaultsList';

export const Home = () => (
  <>
    <div className="pt-32 lg:pt-[120px] pb-[90px] px-4">
      <div className="container mx-auto">
        <div className="mb-[60px]">
          <HeroHeader/>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 mb-[60px]">
          <PrimaryButton>VIEW VAULTS</PrimaryButton>
          <SecondaryButton>CREATE VAULT</SecondaryButton>
        </div>
        <HeroStats/>
      </div>
    </div>
    <Features/>
    <section className="relative">
      <div aria-labelledby="features-heading" className="py-12 sm:py-16">
        <div className="container mx-auto p-6">
          <VaultsFilters/>
          <div className="flex gap-8 mb-8">
            <SearchInput/>
            <MainFilters/>
          </div>
          <VaultsList />
        </div>
      </div>
    </section>
    <InvestmentsTable/>
    <Stats/>
    <Faq/>
  </>
);
