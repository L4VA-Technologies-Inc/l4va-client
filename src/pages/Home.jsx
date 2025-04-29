import { useNavigate } from '@tanstack/react-router';

import { Features } from '@/components/Features';
import { HeroHeader } from '@/components/HeroHeader';
import { HeroStats } from '@/components/HeroStats';
import { Faq } from '@/components/home/Faq';
import { InvestmentsTable } from '@/components/home/InvestmentsTable';
import { MainFilters } from '@/components/home/MainFilters';
import { Stats } from '@/components/home/Stats';
import { VaultsFilters } from '@/components/home/VaultsFilters';
import { PrimaryButton } from '@/components/shared/PrimaryButton';
import { SearchInput } from '@/components/shared/SearchInput';
import { SecondaryButton } from '@/components/shared/SecondaryButton';
import { useAuth } from '@/lib/auth/auth';
import { useModalControls } from '@/lib/modals/modal.context';

export const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { openModal } = useModalControls();

  const handleCreateVault = (e) => {
    if (!isAuthenticated) {
      e.preventDefault();
      openModal('LoginModal');
    } else {
      navigate({ to: '/create' });
    }
  };

  const handleViewVaults = () => navigate({ to: '/vaults' });

  return (
    <>
      <div className="pt-32 lg:pt-[120px] pb-[90px] px-4">
        <div className="container mx-auto">
          <div className="mb-[60px]">
            <HeroHeader />
          </div>
          <div className="flex flex-col sm:flex-row gap-4 mb-[60px]">
            <PrimaryButton onClick={handleViewVaults}>VIEW VAULTS</PrimaryButton>
            <SecondaryButton onClick={handleCreateVault}>CREATE VAULT</SecondaryButton>
          </div>
          <HeroStats />
        </div>
      </div>
      <Features />
      <section className="relative">
        <div aria-labelledby="features-heading" className="py-12 sm:py-16">
          <div className="container mx-auto">
            <VaultsFilters />
            <div className="flex gap-8 mb-8">
              <SearchInput />
              <MainFilters />
            </div>
          </div>
        </div>
      </section>
      <InvestmentsTable />
      <Stats />
      <Faq />
    </>
  );
};
