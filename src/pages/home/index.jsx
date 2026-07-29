import Faq from '@/pages/home/Faq';
import VaultsFilters from '@/pages/home/VaultsFilters';
import Stats from '@/pages/home/Stats';
import { VaultTokensStatistics } from '@/components/vaults/VaultTokensStatistics.jsx';

export const Home = () => {
  return (
    <>
      <div className="home-bg-texture absolute left-1/2 -translate-x-1/2 -top-16 z-[-1] w-full min-h-[750px]" />
      <div className="space-y-20">
        {/* <div className="pt-12 relative">
          <Hero />
        </div>
        <HeroStats /> */}
        {/* <Features /> */}
        <VaultsFilters />
        <VaultTokensStatistics />
        {/* <Acquire /> */}
        <Stats />
        <Faq />
      </div>
    </>
  );
};
