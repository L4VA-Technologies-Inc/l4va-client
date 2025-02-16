export const formatNum = (value, maximumFractionDigits = 2) => (value ? Number(value).toLocaleString('en', {
  useGrouping: true,
  maximumFractionDigits,
}) : 0);

export const formatCompactNumber = (num) => {
  if (!num) return 0;
  const formatter = Intl.NumberFormat('en', { notation: 'compact' });
  return formatter.format(num);
};
