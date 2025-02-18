export const formatNum = (value, maximumFractionDigits = 2) => (value ? Number(value).toLocaleString('en', {
  useGrouping: true,
  maximumFractionDigits,
}) : 0);

export const formatCompactNumber = (num) => {
  if (!num) return 0;
  const formatter = Intl.NumberFormat('en', { notation: 'compact' });
  return formatter.format(num);
};

export const formatAmount = (amount) => {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)}K`;
  }
  return amount.toLocaleString();
};

export const formatDeadline = (deadline) => {
  const end = new Date(deadline);
  const now = new Date();
  const diff = end - now;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  return `${String(days).padStart(2, '0')}D ${String(hours).padStart(2, '0')}H ${String(minutes).padStart(2, '0')}M`;
};

export const getButtonText = (status) => {
  switch (status) {
    case 'active': return 'Contribute';
    case 'pending': return 'Invest';
    case 'completed': return 'Govern';
    default: return 'View';
  }
};

export const capitalizeFirst = (str) => str.charAt(0).toUpperCase() + str.slice(1);
