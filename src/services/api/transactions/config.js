export class TransactionsConfigProvider {
  static buildTransaction() {
    return '/api/v1/blockchain/transaction/build';
  }

  static submitTransaction() {
    return '/api/v1/blockchain/transaction/submit';
  }

  static waitingOwnerTransactions() {
    return '/api/v1/transactions/waiting-owner';
  }

  static generateUpdateTransaction(txId) {
    return `/api/v1/blockchain/transactions/generate-update/${txId}`;
  }

  static submitSignedTransaction(txId) {
    return `/api/v1/blockchain/transactions/submit/${txId}`;
  }
}
