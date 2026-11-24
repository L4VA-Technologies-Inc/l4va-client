import Faq from '@/pages/home/Faq';
import VaultsFilters from '@/pages/home/VaultsFilters';
import Stats from '@/pages/home/Stats';
import { TokensPage } from '@/pages/tokens/TokensPage';

export const Home = () => {
  return (
    <>
      <div className="space-y-20">
        {/* <div className="pt-12 relative">
          <Hero />
        </div>
        <HeroStats /> */}
        {/* <Features /> */}
        <TokensPage />
        <VaultsFilters />
        {/* <Acquire /> */}
        <Stats />
        <Faq />
      </div>
    </>
  );
};
