export class TransactionsConfigProvider {
  static buildTransaction() {
    return '/api/v1/blockchain/transaction/build';
  }

  static submitTransaction() {
    return '/api/v1/blockchain/transaction/submit';
  }
}
