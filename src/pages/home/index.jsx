import Hero from '@/pages/home/Hero';
import HeroStats from '@/components/HeroStats';
import Features from '@/components/Features';

export const Home = () => {
  return (
    <>
      <div
        className="absolute left-1/2 -translate-x-1/2 -top-16 z-[-1] w-full max-w-[1920px] min-h-[300px] bg-cover bg-bottom bg-no-repeat"
        style={{
          backgroundImage: 'url(/assets/vaults/create-vault-bg.webp)',
        }}
      />
      <div className="space-y-20">
        <div className="pt-12 relative">
          <Hero />
        </div>
        <HeroStats />
        <Features />
      </div>
    </>
  );
};
