import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useWallet } from '@ada-anvil/weld/react';
import { useAccount } from 'wagmi';

import { useCreateEvmVault } from '@/hooks/useCreateEvmVault';
import { useNetwork } from '@/hooks/useNetwork';
import { useVlrmBalance } from '@/hooks/useVlrmBalance';
import { useVlrmFeeSettings } from '@/services/api/queries';
import { VaultsApiProvider } from '@/services/api/vaults';
import { formatVaultData } from '@/components/vaults/utils/vaults.utils';
import { vaultSchema } from '@/components/vaults/constants/vaults.constants';
import { AI_VAULT_STORAGE_META_KEY } from '@/components/vaults/ai/aiVault.utils';

const BALANCE_STALENESS_MS = 5 * 60 * 1000;

export const useLaunchVault = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isRobinHood } = useNetwork();
  const wallet = useWallet('handler', 'isConnected');
  const { isConnected: isEvmConnected } = useAccount();
  const { createEvmVault } = useCreateEvmVault();
  const { vlrmBalance, lastUpdated, fetchVlrmBalance } = useVlrmBalance();
  const { data: vlrmFeeData } = useVlrmFeeSettings();

  const launchVault = useCallback(
    async vaultData => {
      await vaultSchema.validate(vaultData, { abortEarly: false });

      if (isRobinHood) {
        if (!isEvmConnected) throw new Error('Connect your wallet to launch the vault.');

        const formattedData = formatVaultData(vaultData, true);
        const { dbVaultId } = await createEvmVault(formattedData);

        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['vault', dbVaultId] }),
          queryClient.invalidateQueries({ queryKey: ['vaults'] }),
        ]);
        localStorage.removeItem('storageVault');
        localStorage.removeItem(AI_VAULT_STORAGE_META_KEY);
        navigate({ to: `/vaults/${dbVaultId}` });
        return dbVaultId;
      }

      if (!wallet.isConnected || !wallet.handler) {
        throw new Error('Connect your wallet to launch the vault.');
      }

      const isBalanceOutdated = !lastUpdated || Date.now() - lastUpdated.getTime() > BALANCE_STALENESS_MS;
      let currentBalance = vlrmBalance;
      if (isBalanceOutdated) {
        const refreshedBalance = await fetchVlrmBalance(false);
        if (refreshedBalance !== undefined) currentBalance = refreshedBalance;
      }

      const vlrmFeeSettings = vlrmFeeData?.data || {
        vlrm_creator_fee: 100,
        vlrm_creator_fee_enabled: true,
      };
      if (currentBalance < vlrmFeeSettings.vlrm_creator_fee && vlrmFeeSettings.vlrm_creator_fee_enabled) {
        const error = new Error(`You need at least ${vlrmFeeSettings.vlrm_creator_fee} VLRM to launch a vault.`);
        error.code = 'INSUFFICIENT_VLRM';
        throw error;
      }

      const formattedData = formatVaultData(vaultData, false);
      const { data } = await VaultsApiProvider.createVault(formattedData);
      const signature = await wallet.handler.signTx(data.presignedTx, true);
      const response = await VaultsApiProvider.launchVault({
        vaultId: data.vaultId,
        transaction: data.presignedTx,
        txId: data.txId,
        signatures: [signature],
      });

      if (response.data.id) {
        localStorage.removeItem('storageVault');
        localStorage.removeItem(AI_VAULT_STORAGE_META_KEY);
        navigate({ to: `/vaults/${data.vaultId}` });
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['vault', data.vaultId] }),
        queryClient.invalidateQueries({ queryKey: ['vaults'] }),
      ]);
      return data.vaultId;
    },
    [
      createEvmVault,
      fetchVlrmBalance,
      isEvmConnected,
      isRobinHood,
      lastUpdated,
      navigate,
      queryClient,
      vlrmBalance,
      vlrmFeeData,
      wallet,
    ]
  );

  return { launchVault };
};
