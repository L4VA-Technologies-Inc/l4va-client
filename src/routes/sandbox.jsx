import { createFileRoute } from '@tanstack/react-router';
import Swap from '@dexhunterio/swaps';
import '@dexhunterio/swaps/lib/assets/style.css';

const SandboxComponent = () => {
  const customizations = {
    theme: {
      primary: '#007AFF',
      secondary: '#F5F5F5',
    },
    language: 'en',
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Swap partnerCode="YOUR_PARTNER_CODE" partnerName="L4VA" {...customizations} />
    </div>
  );
};

export const Route = createFileRoute('/sandbox')({
  component: SandboxComponent,
});
