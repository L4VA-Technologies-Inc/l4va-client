import { Hero } from '@/components/profile/Hero';
import { Stats } from '@/components/profile/Stats';
import { Vaults } from '@/components/profile/Vaults';

export const Profile = () => (
  <div className="min-h-screen">
    <Hero />
    <div className="container mx-auto">
      <div className="flex flex-col gap-20">
        <Stats />
        <Vaults />
      </div>
    </div>
  </div>
);
