import { createFileRoute } from '@tanstack/react-router';
import SecondaryButton from '@/components/shared/SecondaryButton.js';
import { useAuth } from '@/lib/auth/auth.js';
import { CoreApiProvider } from '@/services/api/core/index.js';

function SandboxComponent() {
  const { user } = useAuth();

  const handleSendNotification = async () => {
    try {
      const res = await CoreApiProvider.sendNotification({
        address: user.address,
        title: 'New alert!',
        description: 'You received a new notification',
      });
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div>
      <SecondaryButton size="lg" onClick={handleSendNotification}>
        Send notification
      </SecondaryButton>
    </div>
  );
}

export const Route = createFileRoute('/sandbox')({
  component: SandboxComponent,
});
