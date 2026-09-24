export class SettingsConfigProvider {
  static getVlrmFeeSettings() {
    return '/api/v1/system-settings/vlrm-fee';
  }

  static getNftFlagsSettings() {
    return '/api/v1/system-settings/nft-flags';
  }

  static getVaultCreationFlags() {
    return '/api/v1/system-settings/vault-creation-flags';
  }
}
