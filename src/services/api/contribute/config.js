export class ContributeConfigProvider {
  static createTx(vaultId) {
    return `/api/v1/contribute/${vaultId}`;
  }

  static updateTx(txId) {
    return `/api/v1/contribute/transaction/${txId}/hash`;
  }
}