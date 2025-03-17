export class VaultsConfigProvider {
  static createVault() {
    return '/api/v1/vaults';
  }

  static getVaults() {
    return '/api/v1/vaults';
  }

  static saveDraft() {
    return '/api/v1/vaults/save-draft';
  }
}
