/**
 * Wallet/RPC errors reach the UI as deeply nested viem or CIP-30 objects whose
 * `message` is a multi-line dump ("User rejected the request. Request
 * Arguments: chain: ... Details: MetaMask Tx Signature: ...  Version:
 * viem@2.55.2"). None of that means anything to a user, so these helpers
 * classify the common cases and produce a single readable sentence.
 */

/** True when the user dismissed the wallet prompt rather than something failing. */
export const isUserRejectedError = err => {
  if (!err) return false;
  const message = String(err?.message || '');
  const details = String(err?.details || '');
  return (
    err?.name === 'UserRejectedRequestError' ||
    err?.cause?.name === 'UserRejectedRequestError' ||
    err?.cause?.cause?.name === 'UserRejectedRequestError' ||
    err?.code === 4001 ||
    err?.cause?.code === 4001 ||
    // Cardano (CIP-30) wallets surface this exact string.
    message === 'user declined sign tx' ||
    message.includes('User rejected the request') ||
    message.includes('User denied transaction signature') ||
    details.includes('User denied')
  );
};

/** True when the wallet reports the account cannot cover the amount plus gas. */
export const isInsufficientFundsError = err => {
  const message = `${err?.message || ''} ${err?.details || ''}`.toLowerCase();
  return (
    err?.name === 'InsufficientFundsError' ||
    err?.cause?.name === 'InsufficientFundsError' ||
    message.includes('insufficient funds') ||
    message.includes('exceeds the balance')
  );
};

/**
 * Turn any wallet/API error into one readable sentence.
 *
 * @param err       the caught error
 * @param fallback  what to say when the error is not a recognised wallet case
 * @param options.rejectedMessage  wording for the user-cancelled case
 */
export const getWalletErrorMessage = (err, fallback, options = {}) => {
  if (isUserRejectedError(err)) {
    return options.rejectedMessage || 'Cancelled — you rejected the request in your wallet.';
  }
  if (isInsufficientFundsError(err)) {
    return "Your wallet doesn't have enough funds to cover this amount plus gas.";
  }

  // Server errors carry a useful, already-human message; wallet errors do not.
  const apiMessage = err?.response?.data?.message;
  if (apiMessage) return apiMessage;

  const message = String(err?.message || '');
  // Only trust a wallet message when it is a single short line — anything
  // longer is a viem dump and belongs in the console, not the UI.
  if (message && message.length <= 120 && !message.includes('\n')) return message;

  return fallback;
};
