export class CoreConfigProvider {
  static login() {
    return '/api/v1/auth/login';
  }

  static getProfile() {
    return '/api/v1/users/profile';
  }

  static updateProfile() {
    return '/api/v1/users/profile';
  }

  static uploadImage() {
    return '/api/v1/upload';
  }

  static handleCsv() {
    return '/api/v1/handle-csv';
  }

  static acquire(vaultId) {
    return `/api/v1/acquire/${vaultId}`;
  }

  static createContributionTx(vaultId) {
    return `/api/v1/contribute/${vaultId}`;
  }

  static updateTransactionHash(txId) {
    return `/api/v1/contribute/transaction/${txId}/hash`;
  }
}
