import { useNavigate } from '@tanstack/react-router';

import PrimaryButton from '@/components/shared/PrimaryButton';
import SecondaryButton from '@/components/shared/SecondaryButton';
import { useAuth } from '@/lib/auth/auth';
import { useModalControls } from '@/lib/modals/modal.context';
import { useStatistics } from '@/services/api/queries';

const Hero = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { openModal } = useModalControls();


  const handleCreateVault = e => {
    if (!isAuthenticated) {
      e.preventDefault();
      openModal('LoginModal');
    } else {
      navigate({ to: '/create' });
    }
  };

  const handleViewVaults = () => navigate({ to: '/vaults' });

  return (
    <div>
      <div className="mb-12">
        <div className="font-russo">
          <h1
            className="
              uppercase leading-tight text-3xl lg:text-6xl xl:text-7xl tracking-wide lg:tracking-wider
              bg-gradient-to-r from-[var(--color-orange-500)] to-[#FFD012] bg-clip-text text-transparent
            "
          >
            Dream big
          </h1>
          <p className="uppercase leading-tight block text-2xl lg:text-5xl xl:text-6xl tracking-wide lg:tracking-wider">
            Tokenize Bigger
          </p>
        </div>
        <p className="lg:text-2xl uppercase text-dark-100 font-bold tracking-wide lg:tracking-wider">
          Creator Driven Asset Tokenization Protocol
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-6 mb-12">
        <PrimaryButton size="lg" onClick={handleViewVaults}>
          VIEW VAULTS
        </PrimaryButton>
        <SecondaryButton size="lg" onClick={handleCreateVault}>
          CREATE VAULT
        </SecondaryButton>
      </div>
    </div>
  );
};

export default Hero;
