import { useMutation, useQuery } from '@tanstack/react-query';

import { ClaimsApiProvider } from './claims';

import { VaultsApiProvider } from '@/services/api/vaults';
import { TransactionsApiProvider } from '@/services/api/transactions';
import { CoreApiProvider } from '@/services/api/core';
import { TapToolsApiProvider } from '@/services/api/taptools';

export const useVaults = tab => {
  return useQuery({
    queryKey: ['vaults', tab],
    queryFn: () => VaultsApiProvider.getVaults(tab),
  });
};

export const useMyDraftVaults = () => {
  return useQuery({
    queryKey: ['vaults', 'draft'],
    queryFn: () => VaultsApiProvider.getMyDraftVaults(),
  });
};

export const useMyOpenVaults = () => {
  return useQuery({
    queryKey: ['vaults', 'open'],
    queryFn: () => VaultsApiProvider.getMyOpenVaults(),
  });
};

export const useMyLockedVaults = () => {
  return useQuery({
    queryKey: ['vaults', 'locked'],
    queryFn: () => VaultsApiProvider.getMyLockedVaults(),
  });
};

export const useVault = id => {
  return useQuery({
    queryKey: ['vault', id],
    queryFn: () => VaultsApiProvider.getVault(id),
    enabled: !!id,
  });
};

export const useVaultAssets = id => {
  return useQuery({
    queryKey: ['vault-assets', id],
    queryFn: () => VaultsApiProvider.getVaultAssets(id),
    enabled: !!id,
  });
};

export const useVaultAcquiredAssets = id => {
  return useQuery({
    queryKey: ['vault-acquired-assets', id],
    queryFn: () => VaultsApiProvider.getVaultAcquiredAssets(id),
    enabled: !!id,
  });
};

// Vault Mutations
export const useCreateVault = () => {
  return useMutation({
    mutationFn: vaultData => VaultsApiProvider.createVault(vaultData),
  });
};

export const useSaveDraft = () => {
  return useMutation({
    mutationFn: vaultData => VaultsApiProvider.saveDraft(vaultData),
  });
};

export const useLaunchVault = () => {
  return useMutation({
    mutationFn: vaultData => VaultsApiProvider.launchVault(vaultData),
  });
};

// Transaction Mutations
export const useBuildTransaction = () => {
  return useMutation({
    mutationFn: params => TransactionsApiProvider.buildTransaction(params),
  });
};

export const useSubmitTransaction = () => {
  return useMutation({
    mutationFn: params => TransactionsApiProvider.submitTransaction(params),
  });
};

// Contribute Mutations
export const useCreateContributionTx = () => {
  return useMutation({
    mutationFn: ({ vaultId, assets }) => CoreApiProvider.createContributionTx({ vaultId, assets }),
  });
};

export const useUpdateTransactionHash = () => {
  return useMutation({
    mutationFn: ({ txId, txHash }) => CoreApiProvider.updateTransactionHash({ txId, txHash }),
  });
};

// Core Queries
export const useProfile = () => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: () => CoreApiProvider.getProfile(),
  });
};

// Core Mutations
export const useLogin = () => {
  return useMutation({
    mutationFn: credentials => CoreApiProvider.login(credentials),
  });
};

export const useUpdateProfile = () => {
  return useMutation({
    mutationFn: profileData => CoreApiProvider.updateProfile(profileData),
  });
};

export const useUploadImage = () => {
  return useMutation({
    mutationFn: file => CoreApiProvider.uploadImage(file),
  });
};

export const useHandleCsv = () => {
  return useMutation({
    mutationFn: file => CoreApiProvider.handleCsv(file),
  });
};

export const useCreateAcquireTx = () => {
  return useMutation({
    mutationFn: ({ vaultId, assets }) => CoreApiProvider.acquireAda({ vaultId, assets }),
  });
};

export const useWalletSummary = address => {
  return useQuery({
    queryKey: ['wallet-summary', address],
    queryFn: () => TapToolsApiProvider.getWalletSummary(address),
    enabled: !!address,
  });
};

// Claims Queries
export const useClaims = () => {
  return useQuery({
    queryKey: ['vault-claims'],
    queryFn: () => ClaimsApiProvider.getClaims(),
  });
};
