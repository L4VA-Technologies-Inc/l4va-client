import { useEffect, useRef, useState, useCallback } from 'react';
import { useWallet } from '@ada-anvil/weld/react';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import {
  useBuildStakeTx,
  useBuildUnstakeTx,
  useBuildHarvestTx,
  useBuildCompoundTx,
  useSubmitStakeTx,
} from '@/services/api/queries';

const assertBuildPayload = payload => {
  if (!payload?.success || !payload?.txCbor || !payload?.transactionId) {
    throw new Error(payload?.message || 'Failed to build transaction');
  }
  return {
    txCbor: payload.txCbor,
    transactionId: payload.transactionId,
  };
};

const assertSubmitPayload = payload => {
  if (!payload?.success || !payload?.txHash) {
    throw new Error(payload?.message || 'Submit failed');
  }
  return payload.txHash;
};

export const useStakeTransaction = () => {
  const [status, setStatus] = useState('idle');
  const [txHash, setTxHash] = useState(null);
  const [error, setError] = useState(null);

  const queryClient = useQueryClient();
  const wallet = useWallet();
  const delayedRefetchTimeoutRef = useRef(null);
  const buildStakeTx = useBuildStakeTx();
  const buildUnstakeTx = useBuildUnstakeTx();
  const buildHarvestTx = useBuildHarvestTx();
  const buildCompoundTx = useBuildCompoundTx();
  const submitStakeTx = useSubmitStakeTx();

  const signAndSubmit = useCallback(
    async ({ txCbor, transactionId }) => {
      setStatus('signing');
      const signature = await wallet.handler.signTx(txCbor, true);

      if (!signature) {
        throw new Error('Transaction signing was cancelled');
      }

      setStatus('submitting');

      const submitRes = await submitStakeTx.mutateAsync({
        transactionId,
        txCbor,
        signature,
      });

      const hash = assertSubmitPayload(submitRes.data);
      setTxHash(hash);
      // Ensure widget updates after on-chain state changes (Blockfrost can lag a bit).
      await queryClient.invalidateQueries({ queryKey: ['stake', 'balance'] });
      await queryClient.refetchQueries({ queryKey: ['stake', 'balance'] });

      if (delayedRefetchTimeoutRef.current) {
        clearTimeout(delayedRefetchTimeoutRef.current);
      }
      delayedRefetchTimeoutRef.current = setTimeout(() => {
        queryClient.refetchQueries({ queryKey: ['stake', 'balance'] }).catch(() => {});
      }, 4000);

      toast.success('Transaction completed successfully');
      setStatus('idle');
      return hash;
    },
    [wallet, submitStakeTx, queryClient]
  );

  useEffect(() => {
    return () => {
      if (delayedRefetchTimeoutRef.current) {
        clearTimeout(delayedRefetchTimeoutRef.current);
      }
    };
  }, []);

  const stake = useCallback(
    async ({ assetId, amount }) => {
      setStatus('building');
      try {
        setError(null);
        setTxHash(null);

        if (!wallet.isConnected || !wallet.handler) {
          throw new Error('Wallet not connected');
        }
        if (!localStorage.getItem('jwt')) {
          throw new Error('Please log in before staking');
        }

        const userAddress = await wallet.handler.getChangeAddressBech32();

        const buildRes = await buildStakeTx.mutateAsync({
          userAddress,
          assetId,
          amount: Number(amount),
        });
        const buildPayload = assertBuildPayload(buildRes.data);
        return await signAndSubmit(buildPayload);
      } catch (err) {
        const errorMessage = err.response?.data?.message || err.message || 'Transaction failed';
        setError(errorMessage);
        toast.error(errorMessage, { className: '!max-w-[700px] ', duration: 10000 });
        setStatus('idle');
        return null;
      }
    },
    [wallet, buildStakeTx, signAndSubmit]
  );

  const unstake = useCallback(
    async ({ assetId, utxos }) => {
      setStatus('building');
      try {
        setError(null);
        setTxHash(null);

        if (!wallet.isConnected || !wallet.handler) {
          throw new Error('Wallet not connected');
        }
        if (!localStorage.getItem('jwt')) {
          throw new Error('Please log in before unstaking');
        }

        const userAddress = await wallet.handler.getChangeAddressBech32();

        const buildRes = await buildUnstakeTx.mutateAsync({
          userAddress,
          assetId,
          utxos,
        });
        const buildPayload = assertBuildPayload(buildRes.data);
        return await signAndSubmit(buildPayload);
      } catch (err) {
        const errorMessage = err.response?.data?.message || err.message || 'Transaction failed';
        setError(errorMessage);
        toast.error(errorMessage, { className: '!max-w-[700px] ', duration: 10000 });
        setStatus('idle');
        return null;
      }
    },
    [wallet, buildUnstakeTx, signAndSubmit]
  );

  const harvest = useCallback(
    async ({ utxos }) => {
      setStatus('building');
      try {
        setError(null);
        setTxHash(null);

        if (!wallet.isConnected || !wallet.handler) {
          throw new Error('Wallet not connected');
        }
        if (!localStorage.getItem('jwt')) {
          throw new Error('Please log in before harvesting');
        }

        const userAddress = await wallet.handler.getChangeAddressBech32();

        const buildRes = await buildHarvestTx.mutateAsync({
          userAddress,
          utxos,
        });
        const buildPayload = assertBuildPayload(buildRes.data);
        return await signAndSubmit(buildPayload);
      } catch (err) {
        const errorMessage = err.response?.data?.message || err.message || 'Transaction failed';
        setError(errorMessage);
        toast.error(errorMessage, { className: '!max-w-[700px] ', duration: 10000 });
        setStatus('idle');
        return null;
      }
    },
    [wallet, buildHarvestTx, signAndSubmit]
  );

  const compound = useCallback(
    async ({ utxos }) => {
      setStatus('building');
      try {
        setError(null);
        setTxHash(null);

        if (!wallet.isConnected || !wallet.handler) {
          throw new Error('Wallet not connected');
        }
        if (!localStorage.getItem('jwt')) {
          throw new Error('Please log in before compounding');
        }

        const userAddress = await wallet.handler.getChangeAddressBech32();

        const buildRes = await buildCompoundTx.mutateAsync({
          userAddress,
          utxos,
        });
        const buildPayload = assertBuildPayload(buildRes.data);
        return await signAndSubmit(buildPayload);
      } catch (err) {
        const errorMessage = err.response?.data?.message || err.message || 'Transaction failed';
        setError(errorMessage);
        toast.error(errorMessage, { className: '!max-w-[700px] ', duration: 10000 });
        setStatus('idle');
        return null;
      }
    },
    [wallet, buildCompoundTx, signAndSubmit]
  );

  const reset = useCallback(() => {
    setStatus('idle');
    setTxHash(null);
    setError(null);
  }, []);

  return {
    status,
    txHash,
    error,
    stake,
    unstake,
    harvest,
    compound,
    reset,
    isProcessing: ['building', 'signing', 'submitting'].includes(status),
  };
};
