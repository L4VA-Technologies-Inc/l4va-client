import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/auth';
import { useModal } from '@/context/modals';
import { MODAL_TYPES } from '@/constants/core.constants';

import { PrimaryButton } from '@/components/shared/PrimaryButton';
import { SecondaryButton } from '@/components/shared/SecondaryButton';
import { Features } from '@/components/Features';
import { InvestmentsTable } from '@/components/home/InvestmentsTable';
import { Stats } from '@/components/home/Stats';
import { HeroHeader } from '@/components/HeroHeader';
import { HeroStats } from '@/components/HeroStats';
import { Faq } from '@/components/home/Faq';
import { VaultsFilters } from '@/components/home/VaultsFilters';
import { SearchInput } from '@/components/shared/SearchInput';
import { MainFilters } from '@/components/home/MainFilters';

export const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { openModal } = useModal();

  const handleCreateVault = (e) => {
    if (!isAuthenticated) {
      e.preventDefault();
      openModal(MODAL_TYPES.LOGIN, {
        onSuccess: () => navigate('/create'),
      });
    } else {
      navigate('/create');
    }
  };

  const handleViewVaults = () => navigate('/vaults');

  return (
    <>
      <div className="pt-32 lg:pt-[120px] pb-[90px] px-4">
        <div className="container mx-auto">
          <div className="mb-[60px]">
            <HeroHeader />
          </div>
          <div className="flex flex-col sm:flex-row gap-4 mb-[60px]">
            <PrimaryButton onClick={handleViewVaults}>
              VIEW VAULTS
            </PrimaryButton>
            <SecondaryButton onClick={handleCreateVault}>
              CREATE VAULT
            </SecondaryButton>
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
