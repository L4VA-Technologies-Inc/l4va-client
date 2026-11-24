/**
 * Compact money formatter for Tokens pages — respects active currency symbol.
 * @param {number|null|undefined} value
 * @param {'ada'|'usdt'|'eth'} currency
 * @param {string} currencySymbol
 * @param {{ price?: boolean }} [opts] — price=true uses more decimals for small values
 */
export const formatTokenMoney = (value, currency, currencySymbol, opts = {}) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '—';
  const n = Number(value);
  const isPrice = !!opts.price;

  const withSuffix = (num, suffix) => {
    const digits = Math.abs(num) >= 100 ? 0 : 2;
    return `${currencySymbol}${num.toFixed(digits)}${suffix}`;
  };

  if (n >= 1000000000) return withSuffix(n / 1000000000, 'B');
  if (n >= 1000000) return withSuffix(n / 1000000, 'M');
  if (n >= 1000) return withSuffix(n / 1000, 'K');

  if (currency === 'eth' || currency === 'ada') {
    if (n >= 1) return `${currencySymbol}${n.toFixed(isPrice ? 4 : 2)}`;
    if (n >= 0.000001) return `${currencySymbol}${n.toFixed(isPrice ? 6 : 4)}`;
    if (n > 0) return `${currencySymbol}< 0.000001`;
    return `${currencySymbol}0`;
  }

  // USD — avoid scientific notation for tiny memecoin prices
  if (n >= 1) return `$${n.toFixed(isPrice ? 4 : 2)}`;
  if (n >= 0.0001) return `$${n.toFixed(isPrice ? 6 : 4)}`;
  if (n >= 0.00000001) return `$${n.toFixed(10).replace(/\.?0+$/, '')}`;
  if (n > 0) return `$${n.toExponential(2)}`;
  return `$0`;
};

/** Pick usd/eth/ada fields from a token-like object for a metric key prefix. */
export const pickTokenAmount = (token, pickByCurrency, keys) => {
  if (!token) return null;
  return pickByCurrency({
    usd: token[keys.usd],
    eth: token[keys.eth],
    ada: token[keys.ada],
  });
};
