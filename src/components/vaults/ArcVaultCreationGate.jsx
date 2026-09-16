import { Clock } from 'lucide-react';

import { NoDataPlaceholder } from '@/components/shared/NoDataPlaceholder';
import { useNetwork } from '@/hooks/useNetwork';

/** Vault contracts aren't deployed on Arc yet — keep the creation flows (and their API calls) closed there. */
export const ArcVaultCreationGate = ({ children }) => {
  const { isArc } = useNetwork();

  if (!isArc) return children;

  return (
    <div className="flex flex-col items-center gap-6 py-12">
      <span className="font-russo text-4xl uppercase">Create Vault</span>
      <NoDataPlaceholder icon={Clock} className="max-w-xl" message="Vault creation on Arc is coming soon" />
    </div>
  );
};
