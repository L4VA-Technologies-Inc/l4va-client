// Whether an EVM sign-in (challenge + wallet signature) is in flight. Kept in sessionStorage
// so the wallet-change watchdog can read it synchronously; changes are also announced as a
// window event so hooks can react without polling.
const KEY = 'evm_login_in_progress';
const EVENT = 'l4va:evm-login-progress';

export const isEvmLoginInProgress = () => {
  try {
    return !!sessionStorage.getItem(KEY);
  } catch {
    return false;
  }
};

export const setEvmLoginInProgress = inProgress => {
  try {
    if (inProgress) sessionStorage.setItem(KEY, '1');
    else sessionStorage.removeItem(KEY);
  } catch {
    // Storage blocked: the event below still reaches listeners.
  }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: { inProgress } }));
};

/** Calls `listener(inProgress)` on every change; returns the unsubscribe function. */
export const onEvmLoginProgress = listener => {
  const handler = e => listener(!!e.detail?.inProgress);
  window.addEventListener(EVENT, handler);
  return () => window.removeEventListener(EVENT, handler);
};
