export class VaultsConfigProvider {
  static createVault() {
    return '/api/v1/vaults';
  }

  static getVaults() {
    return '/api/v1/vaults';
  }

  static getMyDraftVaults() {
    return '/api/v1/vaults/my/drafts';
  }

  static getMyOpenVaults() {
    return '/api/v1/vaults/my?filter=open';
  }

  static getMyLockedVaults() {
    return '/api/v1/vaults/my?filter=locked';
  }

  static getInvestVaults() {
    return '/api/v1/vaults?filter=invest';
  }

  static getContributeVaults() {
    return '/api/v1/vaults?filter=contribute';
  }

  static getUpcomingVaults() {
    return '/api/v1/vaults?filter=upcoming';
  }

  static getPastVaults() {
    return '/api/v1/vaults?filter=past';
  }

  static saveDraft() {
    return '/api/v1/vaults/save-draft';
  }

  static launchVault() {
    return '/api/v1/vaults';
  }

  static getVault(id) {
    return `/api/v1/vaults/${id}`;
  }
}
