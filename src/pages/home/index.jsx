import Hero from '@/pages/home/Hero';
import HeroStats from '@/components/HeroStats';
import Features from '@/components/Features';

export const Home = () => {
  return (
    <div className="container mx-auto px-4">
      <div className="space-y-20">
        <div className="pt-12">
          <Hero />
        </div>
        <HeroStats />
        <Features />
      </div>
    </div>
  );
};
