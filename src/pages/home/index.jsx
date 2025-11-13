import Hero from '@/pages/home/Hero';
import HeroStats from '@/components/HeroStats';
import Features from '@/components/Features';
import Faq from '@/pages/home/Faq';
import VaultsFilters from '@/pages/home/VaultsFilters';
import Stats from '@/pages/home/Stats';

export const Home = () => {
  return (
    <>
      <div className="absolute left-1/2 -translate-x-1/2 -top-16 z-[-1] w-full min-h-[750px]">
        <img src="/assets/banner-bg.webp" alt="Banner" className="w-full h-full" fetchPriority="high" loading="lazy" />
      </div>
      <div className="space-y-20">
        <div className="pt-12 relative">
          <Hero />
        </div>
        <HeroStats />
        <Features />
        <VaultsFilters />
        {/* <Acquire /> */}
        <Stats />
        <Faq />
      </div>
    </>
  );
};
