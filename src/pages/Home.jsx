import { PrimaryButton } from '../components/shared/PrimaryButton';
import { SecondaryButton } from '../components/shared/SecondaryButton';

export const Home = () => {
  const stats = [
    { label: 'Active Vaults', value: '132' },
    { label: 'TVL', value: '$38.60 M' },
    { label: 'Total Contributed', value: '$160.48 M' },
  ];

  return (
    <div className="relative min-h-screen">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: 'url(/assets/hero-bg.webp)' }}
      />

      <div className="relative pt-32 lg:pt-40 pb-20 px-4">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div>
              <h1 className="font-bold font-russo">
                <span className="text-sunflower block text-[32px] sm:text-[40px] lg:text-[50px] leading-tight">
                  L4VA ASSET
                </span>
                <span className="text-white block text-[32px] sm:text-[40px] lg:text-[50px] leading-tight">
                  GOVERNANCE ECOSYSTEM
                </span>
              </h1>
              <p className="text-dark-100 text-base sm:text-lg lg:text-[20px] mt-2.5 max-w-2xl">
                THE NEXT GENERATION FRACTIONALIZED NFT ECOSYSTEM
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <PrimaryButton>
                  VIEW VAULTS
                </PrimaryButton>
                <SecondaryButton>
                  CREATE VAULT
                </SecondaryButton>
              </div>
              <div className="mt-16">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 text-center">
                  {stats.map((stat) => (
                    <div key={stat.label} className="min-w-[210px]">
                      <div className="text-white mt-2 text-2xl">
                        {stat.label}
                      </div>
                      <div className="text-sunflower text-2xl sm:text-3xl lg:text-4xl font-bold">
                        {stat.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
