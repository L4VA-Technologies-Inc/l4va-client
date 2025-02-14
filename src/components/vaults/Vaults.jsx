import { VaultCard } from './VaultCard.jsx';
import { VaultsFilters } from '@/components/vaults/VaultsFilters.jsx';
import { SearchInput } from '@/components/shared/SearchInput.jsx';
import { MainFilters } from '@/components/vaults/MainFilters.jsx';

export const Vaults = () => {
  const vaults = [
    {
      id: 1,
      title: 'Spaceman',
      description: 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem',
      progress: 95,
      raised: 450000,
      goal: 500000,
      tvl: '278K',
      access: 'Public',
      baseAllo: '$0',
      image: '/assets/vaults/space-man.webp'
    },
    {
      id: 2,
      title: 'CyberVault',
      description: 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem',
      progress: 75,
      raised: 375000,
      goal: 500000,
      tvl: '156K',
      access: 'Public',
      baseAllo: '$0',
      image: '/assets/vaults/space-man-1.webp'
    },
    {
      id: 3,
      title: 'MetaSpace',
      description: 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem',
      progress: 88,
      raised: 440000,
      goal: 500000,
      tvl: '192K',
      access: 'Public',
      baseAllo: '$0',
      image: '/assets/vaults/space-man-2.webp'
    },
    {
      id: 4,
      title: 'QuantumLeap',
      description: 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem',
      progress: 65,
      raised: 325000,
      goal: 500000,
      tvl: '145K',
      access: 'Public',
      baseAllo: '$0',
      image: '/assets/vaults/space-man.webp'
    },
    {
      id: 5,
      title: 'StarGazer',
      description: 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem',
      progress: 82,
      raised: 410000,
      goal: 500000,
      tvl: '230K',
      access: 'Public',
      baseAllo: '$0',
      image: '/assets/vaults/space-man-1.webp'
    },
    {
      id: 6,
      title: 'NebulaNine',
      description: 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem',
      progress: 92,
      raised: 460000,
      goal: 500000,
      tvl: '310K',
      access: 'Public',
      baseAllo: '$0',
      image: '/assets/vaults/space-man-2.webp'
    },
  ];

  return (
    <section aria-labelledby="features-heading" className="py-12 sm:py-16">
      <div className="container mx-auto p-6">
        <VaultsFilters />
        <div className="flex gap-8 mb-8">
          <SearchInput />
          <MainFilters />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vaults.map(vault => (
            <VaultCard
              key={vault.id}
              {...vault}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
