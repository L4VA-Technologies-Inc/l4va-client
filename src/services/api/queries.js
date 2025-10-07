import { useMutation, useQuery } from '@tanstack/react-query';

import { ClaimsApiProvider } from './claims';
import { GovernanceApiProvider } from './governance';

import { VaultsApiProvider } from '@/services/api/vaults';
import { TransactionsApiProvider } from '@/services/api/transactions';
import { CoreApiProvider } from '@/services/api/core';
import { TapToolsApiProvider } from '@/services/api/taptools';

export const useVaults = filters => {
  return useQuery({
    queryKey: ['vaults', filters],
    queryFn: () => {
      return VaultsApiProvider.getVaults(filters);
    },
    staleTime: 0,
    cacheTime: 0,
  });
};

export const useAcquire = () => {
  return useQuery({
    queryKey: ['acquire'],
    queryFn: () => VaultsApiProvider.getAcquire(),
  });
};

export const useStatistics = () => {
  return useQuery({
    queryKey: ['statistics'],
    queryFn: () => VaultsApiProvider.getStatistics(),
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

export const useVaultAssets = (id, search = '', page = 1, limit = 10) => {
  return useQuery({
    queryKey: ['vault-assets', id, search, page, limit],
    queryFn: () => VaultsApiProvider.getVaultAssets(id, search, page, limit),
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
    enabled: !!localStorage.getItem('jwt'),
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

export const useGovernanceProposals = vaultId => {
  return useQuery({
    queryKey: ['governance-proposals', vaultId],
    queryFn: () => GovernanceApiProvider.getProposals(vaultId),
    enabled: !!vaultId,
  });
};

export const useGovernanceProposal = proposalId => {
  return useQuery({
    queryKey: ['governance-proposal', proposalId],
    queryFn: () => GovernanceApiProvider.getProposal(proposalId),
    enabled: !!proposalId,
  });
};

export const useVotingPower = vaultId => {
  return useQuery({
    queryKey: ['voting-power', vaultId],
    queryFn: () => GovernanceApiProvider.getVotingPower(vaultId),
    enabled: !!vaultId,
    retry: false,
  });
};

export const useVaultAssetsForProposalByType = (vaultId, type) => {
  return useQuery({
    queryKey: ['vault-assets', vaultId, type],
    queryFn: () => GovernanceApiProvider.getAssets(vaultId, type),
    enabled: !!vaultId && !!type,
  });
};

export const useCreateProposal = () => {
  return useMutation({
    mutationFn: ({ vaultId, proposalData }) => GovernanceApiProvider.createProposal(vaultId, proposalData),
  });
};

export const useVoteOnProposal = () => {
  return useMutation({
    mutationFn: ({ proposalId, voteData }) => GovernanceApiProvider.voteOnProposal(proposalId, voteData),
  });
};

export const useViewVault = () => {
  return useMutation({
    mutationFn: vaultId => VaultsApiProvider.viewVault(vaultId),
  });
};
