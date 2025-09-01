export class GovernanceConfigProvider {
  static getProposals(vaultId) {
    return `/api/v1/governance/vaults/${vaultId}/proposals`;
  }

  static createProposal(vaultId) {
    return `/api/v1/governance/vaults/${vaultId}/proposals`;
  }

  static getProposal(proposalId) {
    return `/api/v1/governance/proposals/${proposalId}`;
  }

  static voteOnProposal(proposalId) {
    return `/api/v1/governance/proposals/${proposalId}/vote`;
  }

  static getVotingPower(vaultId) {
    return `/api/v1/governance/vaults/${vaultId}/voting-power`;
  }

  // endpoints for assets
  static getAssetsToTerminate(vaultId) {
    return `/api/v1/governance/vaults/${vaultId}/assets/terminate`;
  }

  static getAssetsToStake(vaultId) {
    return `/api/v1/governance/vaults/${vaultId}/assets/stake`;
  }

  static getAssetsToDistribute(vaultId) {
    return `/api/v1/governance/vaults/${vaultId}/assets/distribute`;
  }

  static getAssetsToBurn(vaultId) {
    return `/api/v1/governance/vaults/${vaultId}/assets/burn`;
  }
}
