const features = [
  {
    title: 'Decentralized',
    description:
      'Our platform puts power back in your hands, offering unmatched security, transparency, and true ownership',
    icon: '/assets/decentralized-icon.webp',
  },
  {
    title: 'Secure',
    description:
      'Our platform ensures all assets and data remain protected, giving L4VA investors peace of mind and fostering trust',
    icon: '/assets/secure-icon.webp',
  },
  {
    title: 'Fair',
    description:
      'Level playing field, ensuring transparency and equal opportunities for everyone in the L4VA ecosystem',
    icon: '/assets/fair-icon.webp',
  },
  {
    title: 'Liquid',
    description:
      'Our Platform enables seamless liquidity, for fast, efficient, and accessible transactions for owners and creators',
    icon: '/assets/liquid-icon.webp',
  },
];

export const Features = () => (
  <section className="w-full bg-background">
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        {features.map((feature) => (
          <div key={feature.title} className="flex flex-col items-start text-left">
            <img alt={`${feature.title} icon`} className="w-16 h-16 mb-6" src={feature.icon || '/placeholder.svg'} />
            <h3 className="text-white text-2xl font-bold mb-4">{feature.title}</h3>
            <p className="text-dark-100 text-base leading-relaxed">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);
