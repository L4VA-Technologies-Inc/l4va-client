import Faq from '@/pages/home/Faq';
import LandingBackground from '@/components/shared/LandingBackground';
import VaultsFilters from '@/pages/home/VaultsFilters';
import Stats from '@/pages/home/Stats';
import { TokensPage } from '@/pages/tokens/TokensPage';

export const Home = () => {
  return (
    <>
      <LandingBackground />
      <div className="space-y-20">
        {/* <div className="pt-12 relative">
          <Hero />
        </div>
        <HeroStats /> */}
        {/* <Features /> */}
        <VaultsFilters />
        <TokensPage />
        {/* <Acquire /> */}
        <Stats />
        <Faq />
      </div>
    </>
  );
};
