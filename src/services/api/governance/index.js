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
    try {
      const response = await axiosInstance.get(GovernanceConfigProvider.getVotingPower(vaultId));
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Unknown error occurred';
      throw new Error(errorMessage);
    }
  }

  static async getAssets(vaultId, type) {
    const response = await axiosInstance.get(GovernanceConfigProvider.getAssets(vaultId, type));
    return response;
  }

  static async getAssetsToUnlist(vaultId) {
    const response = await axiosInstance.get(GovernanceConfigProvider.getAssetsToUnlist(vaultId));
    return response;
  }

  static async getAssetsToUpdateListing(vaultId) {
    const response = await axiosInstance.get(GovernanceConfigProvider.getAssetsToUpdateListing(vaultId));
    return response;
  }
}
