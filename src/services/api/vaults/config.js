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

  static saveDraft() {
    return '/api/v1/vaults/save-draft';
  }

  static getVault(id) {
    return `/api/v1/vaults/${id}`;
  }
}
