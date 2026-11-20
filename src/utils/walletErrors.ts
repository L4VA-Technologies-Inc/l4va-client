/**
 * Wallet/RPC errors reach the UI as deeply nested viem or CIP-30 objects whose
 * `message` is a multi-line dump ("User rejected the request. Request
 * Arguments: chain: ... Details: MetaMask Tx Signature: ...  Version:
 * viem@2.55.2"). None of that means anything to a user, so these helpers
 * classify the common cases and produce a single readable sentence.
 */
import { BaseError, ContractFunctionRevertedError } from 'viem';

/** The loose shape of what a wallet, viem or axios throws. Fields are read defensively. */
interface ErrorLike {
  name?: string;
  message?: string;
  details?: string;
  shortMessage?: string;
  code?: number;
  data?: { errorName?: string };
  cause?: ErrorLike;
  response?: { data?: { message?: unknown } };
}

const asErr = (err: unknown): ErrorLike | undefined =>
  err && typeof err === 'object' ? (err as ErrorLike) : undefined;

/** True when the user dismissed the wallet prompt rather than something failing. */
export const isUserRejectedError = (error: unknown): boolean => {
  const err = asErr(error);
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
export const isInsufficientFundsError = (error: unknown): boolean => {
  const err = asErr(error);
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
export const getWalletErrorMessage = (
  error: unknown,
  fallback: string,
  options: { rejectedMessage?: string } = {}
): string => {
  const err = asErr(error);
  if (isUserRejectedError(err)) {
    return options.rejectedMessage || 'Cancelled — you rejected the request in your wallet.';
  }
  if (isInsufficientFundsError(err)) {
    return "Your wallet doesn't have enough funds to cover this amount plus gas.";
  }

  // Server errors carry a useful, already-human message; wallet errors do not.
  const apiMessage = err?.response?.data?.message;
  if (typeof apiMessage === 'string' && apiMessage) return apiMessage;

  const message = String(err?.message || '');
  // Only trust a wallet message when it is a single short line — anything
  // longer is a viem dump and belongs in the console, not the UI.
  if (message && message.length <= 120 && !message.includes('\n')) return message;

  return fallback;
};

/**
 * Custom-error name from a contract revert (e.g. 'VaultFrozen'), at any nesting
 * depth. viem wraps the revert in several layers, so walk the cause chain instead
 * of reading one fixed path.
 */
export const getContractErrorName = (error: unknown): string | null => {
  const err = asErr(error);
  if (!err) return null;
  if (error instanceof BaseError) {
    const reverted = error.walk(e => e instanceof ContractFunctionRevertedError);
    if (reverted instanceof ContractFunctionRevertedError) {
      return reverted.data?.errorName || reverted.reason || null;
    }
  }
  return err?.cause?.data?.errorName || err?.data?.errorName || null;
};

/** User-facing wording for the contract errors users can actually hit. */
const CONTRACT_ERROR_MESSAGES: Record<string, string> = {
  VaultFrozen: 'This vault is temporarily frozen by the protocol guardian. Please try again later.',
  NothingToClaim: 'These rewards were already claimed.',
  InvalidProof: 'Your rewards were just updated. Please refresh and try again.',
  EnforcedPause: 'This action is paused at the moment. Please try again later.',
  AuthorizationExpired: 'The authorization expired. Please try again.',
  SignatureExpired: 'The authorization expired. Please try again.',
  DeadlineExpired: 'The authorization expired. Please try again.',
};

/** Readable message for a known contract revert, or null. */
export const getContractErrorMessage = (err: unknown, overrides: Record<string, string> = {}): string | null => {
  const name = getContractErrorName(err);
  if (!name) return null;
  return overrides[name] || CONTRACT_ERROR_MESSAGES[name] || null;
};

/**
 * One message for any failed EVM transaction flow: known contract revert,
 * wallet rejection / insufficient funds, API error, viem short message.
 */
export interface EvmTxErrorOptions {
  rejectedMessage?: string;
  /** Per-flow wording for specific contract errors, overriding the defaults. */
  contractMessages?: Record<string, string>;
}

export const getEvmTxErrorMessage = (
  error: unknown,
  fallback = 'Transaction failed',
  options: EvmTxErrorOptions = {}
): string => {
  const err = asErr(error);
  const contractMessage = getContractErrorMessage(error, options.contractMessages);
  if (contractMessage) return contractMessage;
  if (isUserRejectedError(err)) return options.rejectedMessage || 'Transaction was cancelled';
  if (isInsufficientFundsError(err)) return "Your wallet doesn't have enough funds to cover this amount plus gas.";
  const apiMessage = err?.response?.data?.message;
  if (typeof apiMessage === 'string' && apiMessage) return apiMessage;
  const name = getContractErrorName(error);
  if (name) return `Transaction would fail: ${name}`;
  return err?.shortMessage || fallback;
};
