export class FaucetConfigProvider {
  static status() {
    return '/api/v1/faucet/status';
  }

  static claim() {
    return '/api/v1/faucet/claim';
  }
}
