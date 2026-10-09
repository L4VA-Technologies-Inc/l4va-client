import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Droplets } from 'lucide-react';
import toast from 'react-hot-toast';

import PrimaryButton from '@/components/shared/PrimaryButton';
import { FaucetApiProvider } from '@/services/api/faucet';
import { formatDateTime } from '@/utils/core.utils';

const FAUCET_STATUS_KEY = ['faucet', 'status'];

/** Testnet only: mints our Robinhood test tokens (tTSLA, tAAPL, ...) to the connected wallet. */
export const TestnetFaucetCard = () => {
  const queryClient = useQueryClient();
  const { data: status } = useQuery({
    queryKey: FAUCET_STATUS_KEY,
    queryFn: async () => (await FaucetApiProvider.getStatus()).data,
    enabled: !!localStorage.getItem('jwt'),
  });

  const claim = useMutation({
    mutationFn: async () => (await FaucetApiProvider.claim()).data,
    onSuccess: data => {
      toast.success(`Sent ${data.transactions.length} test tokens to your wallet`);
      queryClient.invalidateQueries({ queryKey: FAUCET_STATUS_KEY });
    },
    onError: error => {
      toast.error(error?.response?.data?.message || 'Faucet request failed. Please try again later.');
      queryClient.invalidateQueries({ queryKey: FAUCET_STATUS_KEY });
    },
  });

  if (!status?.enabled) return null;

  const nextClaimAt = status.nextClaimAt ? new Date(status.nextClaimAt) : null;
  const canClaim = !nextClaimAt && !claim.isPending;
  const amount = status.tokens[0]?.amount;

  return (
    <div className="w-full rounded-2xl border border-steel-750 bg-steel-950 p-5 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.7)]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[12px] uppercase tracking-[0.12em] text-dark-100">
            <Droplets className="h-4 w-4" />
            Testnet faucet
          </div>
          <div className="mt-2 text-[18px] font-semibold leading-tight text-white">Get test tokens</div>
          <div className="mt-2 text-[13px] text-dark-100">
            {amount ? `${amount.toLocaleString()} of each: ` : ''}
            {status.tokens.map(token => token.symbol).join(', ')}. Once every {status.cooldownHours} hours.
          </div>
          {nextClaimAt && (
            <div className="mt-2 text-[12px] text-dark-100">
              Next claim: <span className="text-white">{formatDateTime(nextClaimAt, { variant: 'compact' })}</span>
            </div>
          )}
        </div>
        <PrimaryButton disabled={!canClaim} onClick={() => claim.mutate()} size="md" className="shrink-0">
          {claim.isPending ? 'Sending…' : 'Get test tokens'}
        </PrimaryButton>
      </div>
    </div>
  );
};
