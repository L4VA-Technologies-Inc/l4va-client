export const Features = () => {
  const features = [
    {
      title: 'Decentralized',
      description:
        'You have the power to create custom asset vaults and new fractional tokens representing them.',
      icon: '/assets/icons/decentralized.png',
    },
    {
      title: 'Secure',
      description:
        'Non-custodial with all assets remaining securely on-chain, giving users peace of mind.',
      icon: '/assets/icons/secure.png',
    },
    {
      title: 'Fair',
      description:
        'Open source, transparent, and trustless to maximize fairness and effective governance.',
      icon: '/assets/icons/fair.png',
    },
    {
      title: 'Liquid',
      description:
        'Designed to provide unique tokenized liquidity solutions for RWAs, NFTs, and any on-chain asset.',
      icon: '/assets/icons/liquid.png',
    },
  ];

  const FeatureCard = ({ title, description, icon }) => (
    <div
      className="relative flex flex-col items-center sm:items-start text-center sm:text-left px-4 sm:px-0"
    >
      <div className="relative w-full max-w-[240px] sm:max-w-none">
        <img
          alt={`${title} icon`}
          className="
            w-[84px] h-[84px] mx-auto sm:mx-0
            transition-transform duration-300 hover:scale-110
          "
          src={icon}
          onError={(e) => {
            e.currentTarget.src = '/placeholder.svg';
            e.currentTarget.onerror = null;
          }}
        />
      </div>
      <div className="pt-6 sm:pt-12">
        <h3 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">
          {title}
        </h3>
        <p
          className="
            text-dark-100 text-lg sm:text-xl leading-relaxed
            max-w-sm mx-auto sm:mx-0
          "
        >
          {description}
        </p>
      </div>
    </div>
  );

  return (
    <section className="py-12 sm:py-16">
      <h2 className="sr-only" id="features-heading">
        Our Platform Features
      </h2>
      <div className="container mx-auto px-4 lg:px-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 sm:gap-20">
          {features.map((feature) => (
            <FeatureCard
              key={feature.title}
              description={feature.description}
              icon={feature.icon}
              title={feature.title}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
