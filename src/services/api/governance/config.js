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

  static getAssets(vaultId, type) {
    return `/api/v1/governance/vaults/${vaultId}/assets/${type}`;
  }

  static getSwappableAssets(vaultId) {
    return `/api/v1/governance/vaults/${vaultId}/swappable-assets`;
  }
}
