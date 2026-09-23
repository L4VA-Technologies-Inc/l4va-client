export class SettingsConfigProvider {
  static getVlrmFeeSettings() {
    return '/api/v1/system-settings/vlrm-fee';
  }

  static getVaultCreationFlags() {
    return '/api/v1/system-settings/vault-creation-flags';
  }
}
