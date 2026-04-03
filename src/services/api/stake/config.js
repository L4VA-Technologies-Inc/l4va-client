export class StakeConfigProvider {
  static buildStake() {
    return '/api/v1/stake/build-stake';
  }

  static buildUnstake() {
    return '/api/v1/stake/build-unstake';
  }

  static submit() {
    return '/api/v1/stake/submit';
  }

  static getBalance() {
    return '/api/v1/stake/balance';
  }
}
