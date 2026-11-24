export class UniswapConfigProvider {
  static getConfig() {
    return '/api/v1/uniswap/config';
  }

  static quote() {
    return '/api/v1/uniswap/quote';
  }

  static checkApproval() {
    return '/api/v1/uniswap/check-approval';
  }

  static swap() {
    return '/api/v1/uniswap/swap';
  }

  static order() {
    return '/api/v1/uniswap/order';
  }
}
