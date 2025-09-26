export class VaultsConfigProvider {
  static createVault() {
    return '/api/v1/vaults';
  }

  static getAcquire() {
    return '/api/v1/vaults/acquire';
  }

  static getStatistics() {
    return '/api/v1/vaults/statistics';
  }

  static getVaults() {
    return `/api/v1/vaults/search`;
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

  static saveDraft() {
    return '/api/v1/vaults/save-draft';
  }

  static launchVault() {
    return '/api/v1/vaults/publish';
  }

  static launchVaultBlueprints() {
    return '/api/v1/vaults/publish-blueprints';
  }

  static getVault(id) {
    return `/api/v1/vaults/${id}`;
  }

  static getVaultAssets(id) {
    return `/api/v1/assets/contributed/${id}`;
  }

  static getVaultAcquiredAssets(id) {
    return `/api/v1/assets/acquired/${id}`;
  }

  static viewVault(id) {
    return `/api/v1/vaults/${id}/view`;
  }
}
