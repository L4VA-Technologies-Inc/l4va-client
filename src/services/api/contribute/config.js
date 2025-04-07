export class ContributeConfigProvider {
  static createTx(vaultId) {
    return `/api/v1/contribute/${vaultId}`;
  }
}
