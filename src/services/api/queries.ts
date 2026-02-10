import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { ClaimsApiProvider } from './claims';
import { GovernanceApiProvider } from './governance';

import { VaultsApiProvider } from '@/services/api/vaults';
import { TransactionsApiProvider } from '@/services/api/transactions';
import { CoreApiProvider } from '@/services/api/core';
import { TapToolsApiProvider } from '@/services/api/taptools';
import { PresetsApiProvider } from '@/services/api/presets/index.js';
import { SettingsApiProvider } from '@/services/api/settings/index.js';

export const useVaults = (filters: any) => {
  return useQuery({
    queryKey: ['vaults', filters],
    queryFn: () => {
      return VaultsApiProvider.getVaults(filters);
    },
    staleTime: 0,
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

export const useVault = (id: string) => {
  return useQuery({
    queryKey: ['vault', id],
    queryFn: () => VaultsApiProvider.getVault(id),
    enabled: !!id,
  });
};

export const useVaultAssets = (
  id: string,
  search = '',
  page = 1,
  limit = 10,
  filter: { policyId?: string; type?: string; contributorWalletAddress?: string } = {}
) => {
  return useQuery({
    queryKey: ['vault-assets', id, search, page, limit, filter],
    queryFn: () => VaultsApiProvider.getVaultAssets(id, search, page, limit, filter),
    enabled: !!id,
  });
};

export const useVaultAcquiredAssets = (
  id: string,
  page = 1,
  limit = 10,
  search = '',
  minQuantity?: number,
  maxQuantity?: number
) => {
  return useQuery({
    queryKey: ['vault-acquired-assets', id, page, limit, search, minQuantity, maxQuantity],
    queryFn: () => VaultsApiProvider.getVaultAcquiredAssets(id, page, limit, search, minQuantity, maxQuantity),
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

export const useTransactions = (params: { page: number; limit: number; filter: string }) => {
  return useQuery({
    queryKey: ['transactions', JSON.stringify(params)],
    queryFn: () => TransactionsApiProvider.getUserTransactions(params),
  });
};

// Contribute Mutations
export const useCreateContributionTx = () => {
  return useMutation({
    mutationFn: ({ vaultId, assets }: { vaultId: string; assets: any[] }) =>
      CoreApiProvider.createContributionTx({ vaultId, assets }),
  });
};

export const useUpdateTransactionHash = () => {
  return useMutation({
    mutationFn: ({ txId, txHash }: { txId: string; txHash: string }) =>
      CoreApiProvider.updateTransactionHash({ txId, txHash }),
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

export const usePublicProfile = (userId: string) => {
  return useQuery({
    queryKey: ['profile', userId],
    queryFn: () => CoreApiProvider.getPublicProfile(userId),
    enabled: !!userId,
  });
};

// Core Mutations
export const useLogin = () => {
  return useMutation({
    mutationFn: (credentials: { signature: string; stakeAddress: string; walletAddress: string }) =>
      CoreApiProvider.login(credentials),
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: profileData => CoreApiProvider.updateProfile(profileData),
    onSuccess: response => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      if (response?.data) {
        queryClient.setQueryData(['profile'], response);
      }
    },
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
    mutationFn: ({ vaultId, assets }: { vaultId: string; assets: any[] }) =>
      CoreApiProvider.acquireAda({ vaultId, assets }),
  });
};

export const useWalletSummaryPaginated = ({
  address,
  page = 1,
  limit = 20,
  filter = 'all',
  whitelistedPolicies,
  search,
}: {
  address: string;
  page?: number;
  limit?: number;
  filter?: 'all' | 'nfts' | 'tokens';
  whitelistedPolicies?: string[];
  search?: string;
}) => {
  return useQuery({
    queryKey: ['wallet-summary', address, page, limit, filter, whitelistedPolicies, search],
    queryFn: () =>
      TapToolsApiProvider.getWalletSummaryPaginated({ address, page, limit, filter, whitelistedPolicies, search }),
    enabled: !!address,
  });
};

// Claims Queries
export const useClaims = (params: any) => {
  return useQuery({
    queryKey: ['vault-claims', JSON.stringify(params)],
    queryFn: () => ClaimsApiProvider.getClaims(params),
  });
};
// Termination Claims Queries
export const useTerminationStatus = (vaultId: string) => {
  return useQuery({
    queryKey: ['termination-status', vaultId],
    queryFn: () => ClaimsApiProvider.getTerminationStatus(vaultId),
    enabled: !!vaultId,
  });
};

// Termination Claims Mutations
export const useBuildTerminationClaim = () => {
  return useMutation({
    mutationFn: (claimId: string) => ClaimsApiProvider.buildTerminationClaim(claimId),
  });
};

export const useSubmitTerminationClaim = () => {
  return useMutation({
    mutationFn: params => ClaimsApiProvider.submitTerminationClaim(params),
  });
};

export const useGovernanceProposals = (vaultId: string) => {
  return useQuery({
    queryKey: ['governance-proposals', vaultId],
    queryFn: () => GovernanceApiProvider.getProposals(vaultId),
    enabled: !!vaultId,
  });
};

export const useGovernanceProposal = (proposalId: string) => {
  return useQuery({
    queryKey: ['governance-proposal', proposalId],
    queryFn: () => GovernanceApiProvider.getProposal(proposalId),
    enabled: !!proposalId,
  });
};

export const useVotingPower = (vaultId: string) => {
  return useQuery({
    queryKey: ['voting-power', vaultId],
    queryFn: () => GovernanceApiProvider.getVotingPower(vaultId),
    enabled: !!vaultId,
    retry: false,
  });
};

export const useVaultAssetsForProposalByType = (vaultId: string, type: any) => {
  return useQuery({
    queryKey: ['vault-assets', vaultId, type],
    queryFn: () => GovernanceApiProvider.getAssets(vaultId, type),
    enabled: !!vaultId && !!type,
  });
};

export const useMarketAssets = (vaultId: string, type: 'unlist' | 'update-listing') => {
  return useQuery({
    queryKey: ['market-assets', vaultId, type],
    queryFn: () => GovernanceApiProvider.getAssets(vaultId, type),
    enabled: !!vaultId && !!type,
  });
};

export const useSwappableAssets = (vaultId: string) => {
  return useQuery({
    queryKey: ['swappable-assets', vaultId],
    queryFn: () => GovernanceApiProvider.getSwappableAssets(vaultId),
    enabled: !!vaultId,
  });
};

export const useCreateProposal = () => {
  return useMutation({
    mutationFn: ({ vaultId, proposalData }: { vaultId: string; proposalData: any }) =>
      GovernanceApiProvider.createProposal(vaultId, proposalData),
  });
};

export const useVoteOnProposal = () => {
  return useMutation({
    mutationFn: ({ proposalId, voteData }: { proposalId: string; voteData: any }) =>
      GovernanceApiProvider.voteOnProposal(proposalId, voteData),
  });
};

export const useViewVault = () => {
  return useMutation({
    mutationFn: (vaultId: string) => VaultsApiProvider.viewVault(vaultId),
  });
};

export const useBuildBurnTransaction = ({ id }: { id: string }) => {
  return useMutation({
    mutationFn: () => VaultsApiProvider.buildBurnTransaction(id),
  });
};

export const usePublishBurnTransaction = ({ id, payload }: { id: string; payload: any }) => {
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

export const useMarketWithOHLCV = (vaultId: string, interval: string = '1h') => {
  return useQuery({
    queryKey: ['markets', 'ohlcv', vaultId, interval],
    queryFn: () => VaultsApiProvider.getMarketByIdWithOHLCV(vaultId, interval),
    enabled: !!vaultId,
  });
};

export const useMarketStatistics = (params = {}) => {
  return useQuery({
    queryKey: ['vaults', 'market-statistics', params],
    queryFn: () => VaultsApiProvider.getMarketStatistics(params),
    staleTime: 0,
  });
};

export const useVaultActivity = (
  vaultId: string,
  params: { page?: number; limit?: number; sortOrder?: string; filter?: string }
) => {
  return useQuery({
    queryKey: ['vault-activity', vaultId, params],
    queryFn: () => VaultsApiProvider.getVaultActivity(vaultId, params),
    enabled: !!vaultId,
  });
};

export const useVlrmFeeSettings = () => {
  return useQuery({
    queryKey: ['vlrm-fee-settings'],
    queryFn: () => SettingsApiProvider.getVlrmFeeSettings(),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
};
