import { GovernanceConfigProvider } from '@/services/api/governance/config';
import { axiosInstance } from '@/services/api';

export class GovernanceApiProvider {
  static async getProposals(vaultId) {
    const response = await axiosInstance.get(GovernanceConfigProvider.getProposals(vaultId));
    return response;
  }

  static async createProposal(vaultId, proposalData) {
    const response = await axiosInstance.post(GovernanceConfigProvider.createProposal(vaultId), proposalData);
    return response;
  }

  static async getProposal(proposalId) {
    const response = await axiosInstance.get(GovernanceConfigProvider.getProposal(proposalId));
    return response;
  }

  static async voteOnProposal(proposalId, voteData) {
    const response = await axiosInstance.post(GovernanceConfigProvider.voteOnProposal(proposalId), voteData);
    return response;
  }

  static async getVotingPower(vaultId) {
    const response = await axiosInstance.get(GovernanceConfigProvider.getVotingPower(vaultId));
    return response;
  }

  static async getAssetsToTerminate(vaultId) {
    const response = await axiosInstance.get(GovernanceConfigProvider.getAssetsToTerminate(vaultId));
    return response;
  }

  static async getAssetsToStake(vaultId) {
    const response = await axiosInstance.get(GovernanceConfigProvider.getAssetsToStake(vaultId));
    return response;
  }

  static async getAssetsToDistribute(vaultId) {
    const response = await axiosInstance.get(GovernanceConfigProvider.getAssetsToDistribute(vaultId));
    return response;
  }

  static async getAssetsToBurn(vaultId) {
    const response = await axiosInstance.get(GovernanceConfigProvider.getAssetsToBurn(vaultId));
    return response;
  }
}
