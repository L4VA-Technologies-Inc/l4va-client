import DecentralizedIcon from '@/icons/features/decentralized.svg?react';
import SecureIcon from '@/icons/features/secure.svg?react';
import FairIcon from '@/icons/features/fair.svg?react';
import LiquidIcon from '@/icons/features/liquid.svg?react';

const Features = () => {
  const features = [
    {
      title: 'Decentralized',
      description: 'You have the power to create custom asset vaults and new vault tokens representing them.',
      icon: DecentralizedIcon,
    },
    {
      title: 'Secure',
      description: 'Non-custodial with all assets remaining securely on-chain, giving users peace of mind.',
      icon: SecureIcon,
    },
    {
      title: 'Fair',
      description: 'Open source, transparent, and trustless to maximize fairness and effective governance.',
      icon: FairIcon,
    },
    {
      title: 'Liquid',
      description: 'Designed to provide unique tokenized liquidity solutions for RWAs, NFTs, and any on-chain asset.',
      icon: LiquidIcon,
    },
  ];

  const FeatureCard = ({ title, description, icon: Icon }) => (
    <div className="relative flex flex-col items-center text-center sm:text-left sm:items-start">
      <div className="mb-4 sm:mb-6">
        <Icon
          className="
            flex-shrink-0 w-16 h-16 sm:w-[84px] sm:h-[84px] mx-auto sm:mx-0
            transition-transform duration-300 hover:scale-110
          "
        />
      </div>
      <div className="space-y-2 sm:space-y-3">
        <h3 className="text-xl sm:text-2xl font-bold text-white">{title}</h3>
        <p className="text-sm sm:text-base text-dark-100 leading-relaxed">{description}</p>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
      {features.map(feature => (
        <FeatureCard key={feature.title} description={feature.description} icon={feature.icon} title={feature.title} />
      ))}
    </div>
  );
};

export default Features;
