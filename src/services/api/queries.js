import { useMutation, useQuery } from '@tanstack/react-query';

import { ClaimsApiProvider } from './claims';
import { GovernanceApiProvider } from './governance';

import { VaultsApiProvider } from '@/services/api/vaults';
import { TransactionsApiProvider } from '@/services/api/transactions';
import { CoreApiProvider } from '@/services/api/core';
import { TapToolsApiProvider } from '@/services/api/taptools';
import { PresetsApiProvider } from '@/services/api/presets/index.js';

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

export const useVaultAcquiredAssets = (id, page = 1, limit = 10) => {
  return useQuery({
    queryKey: ['vault-acquired-assets', id, page, limit],
    queryFn: () => VaultsApiProvider.getVaultAcquiredAssets(id, page, limit),
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

export const useTransactions = params => {
  return useQuery({
    queryKey: ['transactions', JSON.stringify(params)],
    queryFn: () => TransactionsApiProvider.getUserTransactions(params),
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

export const usePublicProfile = userId => {
  return useQuery({
    queryKey: ['profile', userId],
    queryFn: () => CoreApiProvider.getPublicProfile(userId),
    enabled: !!userId,
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

export const useWalletSummaryPaginated = ({ address, page = 1, limit = 20, filter = 'all', whitelistedPolicies }) => {
  return useQuery({
    queryKey: ['wallet-summary', address, page, limit, filter, whitelistedPolicies],
    queryFn: () => TapToolsApiProvider.getWalletSummaryPaginated({ address, page, limit, filter, whitelistedPolicies }),
    enabled: !!address,
  });
};

export const useWalletPolicyIds = (address, excludeFts = false) => {
  return useQuery({
    queryKey: ['wallet-policy-ids', address, excludeFts],
    queryFn: () => TapToolsApiProvider.getWalletPolicyIds(address, excludeFts),
    enabled: !!address,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    cacheTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });
};

export const useWalletAssetAmount = (assetId, address) => {
  return useQuery({
    queryKey: ['wallet-asset-amount', assetId, address],
    queryFn: () => TapToolsApiProvider.getWalletAssetAmount(assetId, address),
    enabled: !!assetId && !!address,
  });
};

// Claims Queries
export const useClaims = params => {
  return useQuery({
    queryKey: ['vault-claims', JSON.stringify(params)],
    queryFn: () => ClaimsApiProvider.getClaims(params),
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

export const useAssetsToUnlist = vaultId => {
  return useQuery({
    queryKey: ['assets-to-unlist', vaultId],
    queryFn: () => GovernanceApiProvider.getAssetsToUnlist(vaultId),
    enabled: !!vaultId,
  });
};

export const useAssetsToUpdateListing = vaultId => {
  return useQuery({
    queryKey: ['assets-to-update-listing', vaultId],
    queryFn: () => GovernanceApiProvider.getAssetsToUpdateListing(vaultId),
    enabled: !!vaultId,
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

export const useBuildBurnTransaction = ({ id }) => {
  return useMutation({
    mutationFn: () => VaultsApiProvider.buildBurnTransaction(id),
  });
};

export const usePublishBurnTransaction = ({ id, payload }) => {
  return useMutation({
    mutationFn: () => VaultsApiProvider.publishBurnTransaction(id, payload),
  });
};

export const usePresets = () => {
  return useQuery({
    queryKey: ['presets'],
    queryFn: () => PresetsApiProvider.getAllPresets(),
  });
};

export const useCreatePreset = () => {
  return useMutation({
    mutationFn: payload => PresetsApiProvider.createPreset(payload),
  });
};

export const useDeletePreset = () => {
  return useMutation({
    mutationFn: presetId => PresetsApiProvider.deletePreset(presetId),
  });
};
