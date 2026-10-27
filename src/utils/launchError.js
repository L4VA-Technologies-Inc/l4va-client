/**
 * Human-readable reason a vault launch failed: the API's validation message
 * (Nest returns a string or a list), a wallet / RPC short message, or the
 * error's own message. Falls back to `fallback` when nothing useful is there.
 */
export const getLaunchErrorMessage = (error, fallback = 'Failed to launch vault. Please try again.') => {
  const apiMessage = error?.response?.data?.message;
  if (Array.isArray(apiMessage) && apiMessage.length > 0) return apiMessage.join('; ');
  if (typeof apiMessage === 'string' && apiMessage.trim()) return apiMessage;
  if (typeof error?.shortMessage === 'string' && error.shortMessage.trim()) return error.shortMessage;
  if (
    typeof error?.message === 'string' &&
    error.message.trim() &&
    !/^Request failed with status code/.test(error.message)
  ) {
    return error.message;
  }
  return fallback;
};
