import { createFileRoute, useParams, Navigate, useRouter } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';

import { ProposalInfo } from '@/components/vault-profile/ProposalInfo';
import { Spinner } from '@/components/Spinner';
import { useGovernanceProposal } from '@/services/api/queries';

function ProposalComponent() {
  const router = useRouter();
  const id = useParams({
    from: '/proposals/$id',
    select: params => params.id,
  });

  const { data, isLoading, error } = useGovernanceProposal(id);
  const proposal = data?.data?.proposal;

  const handleBack = () => {
    router.history.back();
  };

  if (!id) {
    return <Navigate replace to="/" />;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  if (error || !proposal) {
    return <Navigate replace to="/" />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={handleBack}
        className="flex items-center gap-1 text-orange-500 hover:text-orange-400 transition-colors mb-6 text-lg"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Activities
      </button>
      <ProposalInfo proposal={proposal} />
    </div>
  );
}

export const Route = createFileRoute('/proposals/$id')({
  component: ProposalComponent,
});
