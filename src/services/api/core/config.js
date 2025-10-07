export class CoreConfigProvider {
  static login() {
    return '/api/v1/auth/login';
  }

  static sendNotification() {
    return '/api/v1/send-notification';
  }

  static getProfile() {
    return '/api/v1/users/profile';
  }

  static getPublicProfile(userId) {
    return `/api/v1/users/profile/${userId}`;
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
