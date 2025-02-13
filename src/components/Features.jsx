export const Features = () => {
  const features = [
    {
      title: 'Decentralized',
      description:
        'Our platform puts power back in your hands, offering unmatched security, transparency, and true ownership',
      icon: '/assets/icons/decentralized.png',
    },
    {
      title: 'Secure',
      description:
        'Our platform ensures all assets and data remain protected, giving L4VA investors peace of mind and fostering trust',
      icon: '/assets/icons/secure.png',
    },
    {
      title: 'Fair',
      description:
        'Level playing field, ensuring transparency and equal opportunities for everyone in the L4VA ecosystem',
      icon: '/assets/icons/fair.png',
    },
    {
      title: 'Liquid',
      description:
        'Our Platform enables seamless liquidity, for fast, efficient, and accessible transactions for owners and creators',
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
            w-32 h-32 sm:w-44 sm:h-44 mx-auto sm:mx-0 sm:absolute sm:-left-12
            transition-transform duration-300 hover:scale-110
          "
          src={icon}
          onError={(e) => {
            e.currentTarget.src = '/placeholder.svg';
            e.currentTarget.onerror = null;
          }}
        />
      </div>
      <div className="pt-6 sm:pt-44">
        <h3 className="text-primary-text font-satoshi text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">
          {title}
        </h3>
        <p
          className="
            font-satoshi font-semibold text-dark-100 text-lg sm:text-xl leading-relaxed
            max-w-sm mx-auto sm:mx-0
          "
        >
          {description}
        </p>
      </div>
    </div>
  );

  return (
    <section aria-labelledby="features-heading" className="py-12 sm:py-16">
      <h2 className="sr-only" id="features-heading">Our Platform Features</h2>
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
