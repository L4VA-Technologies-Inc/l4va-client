import { formatISO } from 'date-fns';

export const formatNum = (value, maximumFractionDigits = 2) =>
  value
    ? Number(value).toLocaleString('en', {
        useGrouping: true,
        maximumFractionDigits,
      })
    : 0;

/**
 * Format ADA prices intelligently to handle very small values
 * - For values >= 1: shows 2 decimal places (e.g., 123.45)
 * - For values < 1 but >= 0.01: shows up to 4 decimal places (e.g., 0.1234)
 * - For values < 0.01: uses compact notation with subscript zeros (e.g., 0.0₃129 for 0.000129)
 * @param {number|string} value - The price value to format
 * @returns {string} - Formatted price string
 */
export const formatAdaPrice = value => {
  const num = Number(value);

  // Handle invalid values
  if (!num && num !== 0) return '0';
  if (isNaN(num)) return '0';
  if (num === 0) return '0';

  // For negative values (shouldn't happen with prices, but handle gracefully)
  if (num < 0) return '0';

  // For large values >= 1, use 2 decimal places
  if (num >= 1) {
    return num.toLocaleString('en', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  // For medium values (0.01 to 1), use up to 4 decimal places
  if (num >= 0.01) {
    return num.toLocaleString('en', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    });
  }

  // For very small values (< 0.01), use compact notation with subscript
  // e.g., 0.000129 → 0.0₃129 (where ₃ indicates 3 zeros)
  const strValue = num.toString();

  // Handle scientific notation (e.g., 1e-7)
  if (strValue.includes('e')) {
    const [base, exponent] = strValue.split('e');
    const exp = Math.abs(parseInt(exponent));
    const baseNum = parseFloat(base);

    // Get significant digits (up to 4)
    const significantDigits = baseNum.toString().replace('.', '').substring(0, 4);
    const zerosCount = exp - 1;

    const subscriptDigits = ['₀', '₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈', '₉'];
    const subscript = zerosCount
      .toString()
      .split('')
      .map(d => subscriptDigits[parseInt(d)])
      .join('');

    return `0.0${subscript}${significantDigits}`;
  }

  // Regular decimal format
  const decimalPart = strValue.split('.')[1] || '';

  // Count leading zeros
  let zerosCount = 0;
  for (let i = 0; i < decimalPart.length; i++) {
    if (decimalPart[i] === '0') {
      zerosCount++;
    } else {
      break;
    }
  }

  // Get the significant digits after zeros (up to 4 digits)
  const significantDigits = decimalPart.substring(zerosCount, zerosCount + 4);

  // Convert zeros count to subscript
  const subscriptDigits = ['₀', '₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈', '₉'];
  const subscript = zerosCount
    .toString()
    .split('')
    .map(d => subscriptDigits[parseInt(d)])
    .join('');

  return `0.0${subscript}${significantDigits}`;
};

export const formatCompactNumber = num => {
  if (!num) return 0;
  const formatter = Intl.NumberFormat('en', { notation: 'compact' });
  return formatter.format(num);
};

export const formatAmount = amount => {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)}K`;
  }
  return amount.toLocaleString();
};

export const formatNumber = value => {
  if (!value) return '-';
  const numValue = typeof value === 'number' ? value : parseFloat(value);
  if (isNaN(numValue)) return '-';
  if (numValue >= 1e12) {
    const divided = numValue / 1e12;
    return `${divided % 1 === 0 ? divided.toFixed(0) : divided.toFixed(2)}T`;
  }
  if (numValue >= 1e9) {
    const divided = numValue / 1e9;
    return `${divided % 1 === 0 ? divided.toFixed(0) : divided.toFixed(2)}B`;
  }
  if (numValue >= 1e6) {
    const divided = numValue / 1e6;
    return `${divided % 1 === 0 ? divided.toFixed(0) : divided.toFixed(2)}M`;
  }
  if (numValue >= 1e3) {
    const divided = numValue / 1e3;
    return `${divided % 1 === 0 ? divided.toFixed(0) : divided.toFixed(2)}K`;
  }
  return numValue % 1 === 0 ? numValue.toFixed(0) : numValue.toFixed(2);
};

export const formatDeadline = deadline => {
  const end = new Date(deadline);
  const now = new Date();
  const diff = end - now;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  return `${String(days).padStart(2, '0')}D ${String(hours).padStart(2, '0')}H ${String(minutes).padStart(2, '0')}M`;
};

export const getButtonText = status => {
  switch (status) {
    case 'active':
      return 'Contribute';
    case 'pending':
      return 'Acquire';
    case 'completed':
      return 'Govern';
    default:
      return 'View';
  }
};

export const capitalizeFirst = str => str.charAt(0).toUpperCase() + str.slice(1);

export const transformZodErrorsIntoObject = error => {
  if (!error || !error.format) return {};

  const formattedErrors = {};

  const extractErrors = (obj, path = '') => {
    if (obj._errors && obj._errors.length > 0) {
      formattedErrors[path.slice(0, -1)] = obj._errors[0];
    }

    Object.keys(obj).forEach(key => {
      if (key !== '_errors' && typeof obj[key] === 'object') {
        extractErrors(obj[key], `${path}${key}.`);
      }
    });
  };

  extractErrors(error.format());
  return formattedErrors;
};

export const substringAddress = address => {
  const addressLength = address?.length || 0;
  return `${address?.substring(0, 4)}...${address?.substring(addressLength - 4)}`;
};

export const formatString = string => {
  if (!string) return '';

  const length = string.length;

  if (length <= 6) {
    return string;
  }

  return `${string.substring(0, 3)}...${string.substring(length - 3)}`;
};

export const getDisplayName = user => {
  const { name, address } = user;
  if (name) {
    return name.length < 10 ? name : `${name.slice(0, 10)}...`;
  }
  if (address) {
    return substringAddress(address);
  }
  return 'No name';
};

export const getAvatarLetter = user => {
  if (user) {
    return user.name.charAt(0).toUpperCase();
  }
  return 'U';
};

export const MS_PER_MINUTE = 60 * 1000;
export const MS_PER_HOUR = 60 * MS_PER_MINUTE;
export const MS_PER_DAY = 24 * MS_PER_HOUR;

export const msToInterval = ms => ({
  days: Math.floor(ms / MS_PER_DAY),
  hours: Math.floor((ms % MS_PER_DAY) / MS_PER_HOUR),
  minutes: Math.floor((ms % MS_PER_HOUR) / MS_PER_MINUTE),
});

export const intervalToMs = ({ days, hours, minutes }) =>
  days * MS_PER_DAY + hours * MS_PER_HOUR + minutes * MS_PER_MINUTE;

export const formatInterval = timestamp => {
  const { days, hours, minutes } = msToInterval(timestamp);
  const parts = [];

  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);

  return parts.length > 0 ? parts.join(' ') : '0m';
};

export const handleNumberInput = value => {
  return value.replace(/[^0-9]/g, '');
};

export const transformYupErrors = err => {
  if (!err?.inner) return {};

  const errors = {};
  err.inner.forEach(error => {
    errors[error.path] = error.message;
  });
  return errors;
};

export const calculateTimeLeft = endTime => {
  // Validate input - return zeros if invalid
  if (!endTime || endTime === null || endTime === undefined) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  const endDate = new Date(endTime);

  // Check if date is valid
  if (isNaN(endDate.getTime())) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  const difference = endDate - new Date();

  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  };
};

export const formatDate = date => {
  if (!date) return null;
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatDateWithTime = dt => {
  if (!dt) return null;

  const dateObj = typeof dt === 'string' ? new Date(dt) : dt;
  const date = formatDate(dateObj);
  const time = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return `${date} at ${time}`;
};

export const formatDateTime = dt => {
  if (!dt) return null;

  const dateObj = typeof dt === 'string' ? new Date(dt) : dt;

  const date = dateObj.toLocaleDateString();
  const time = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const timezoneOffset = formatISO(dateObj).slice(19, 25);
  const timezoneString = `GMT${timezoneOffset.slice(0, 3)}`;

  return `${date} ${time} (${timezoneString})`;
};

export const formatProposalEndDate = endDate => {
  if (!endDate) return null;

  const end = new Date(endDate);
  const now = new Date();
  const diff = end - now;
  const hoursLeft = diff / (1000 * 60 * 60);

  // Якщо пропозал завершився
  if (diff <= 0) {
    return {
      type: 'ended',
      value: formatDateWithTime(end),
    };
  }

  // Якщо до кінця менше 24 години - показуємо таймер
  if (hoursLeft < 24) {
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    return {
      type: 'countdown',
      value: { hours, minutes, seconds },
      totalMs: diff,
    };
  }

  // Якщо до кінця >= 24 години - показуємо дату + час
  return {
    type: 'date',
    value: formatDateWithTime(end),
  };
};

// IPFS URL resolver
export const getIPFSUrl = src => {
  if (!src) return src;
  if (src.startsWith('ipfs://')) {
    const hash = src.replace('ipfs://', '');
    return `https://ipfs.io/ipfs/${hash}`;
  }
  return src;
};

const VAULT_STATUS_CONFIG = {
  published: {
    countdownName: 'Contribution starts in:',
    getCountdownTime: vault => new Date(vault.contributionOpenWindowTime).getTime(),
    buttonText: 'View',
    isCountdownActive: true,
  },
  contribution: {
    countdownName: 'Contribution ends in:',
    getCountdownTime: vault => new Date(vault.contributionPhaseStart).getTime() + vault.contributionDuration,
    buttonText: 'Contribute',
    isCountdownActive: true,
  },
  acquire: {
    countdownName: 'Acquire ends in:',
    getCountdownTime: vault => new Date(vault.acquirePhaseStart).getTime() + vault.acquireWindowDuration,
    buttonText: 'Acquire',
    isCountdownActive: true,
  },
  custom_acquire: {
    countdownName: 'Acquire starts in:',
    getCountdownTime: vault => vault.acquireOpenWindowTime,
    buttonText: 'Acquire',
    isCountdownActive: true,
  },
  burned: {
    countdownName: '',
    getCountdownTime: () => 'Burned',
    buttonText: '',
    isCountdownActive: false,
  },
  failed: {
    countdownName: '',
    getCountdownTime: () => 'Failed',
    buttonText: '',
    isCountdownActive: false,
  },
  locked: {
    countdownName: '',
    getCountdownTime: () => 'Locked',
    buttonText: 'Create Proposal',
    isCountdownActive: false,
  },
  expansion: {
    countdownName: 'Expansion ends in:',
    getCountdownTime: vault =>
      vault.expansionPhaseStart ? new Date(vault.expansionPhaseStart).getTime() + vault.expansionDuration : Date.now(),
    buttonText: 'Contribute',
    isCountdownActive: true,
  },
  created: {
    countdownName: 'Contribution starts in:',
    getCountdownTime: vault => new Date(vault.contributionOpenWindowTime).getTime(),
    buttonText: '',
    isCountdownActive: true,
  },
  terminating: {
    countdownName: '',
    getCountdownTime: () => 'Terminating',
    buttonText: '',
    isCountdownActive: false,
  },
};

export const getCountdownName = vault => {
  const contributionEnd = new Date(vault.contributionPhaseStart).getTime() + vault.contributionDuration;

  if (
    vault.acquireOpenWindowType === 'custom' &&
    contributionEnd < Date.now() &&
    (vault.acquirePhaseStart ? vault.acquirePhaseStart < Date.now() : true)
  ) {
    return VAULT_STATUS_CONFIG['custom_acquire']?.countdownName;
  }

  const status = vault?.vaultStatus?.toLowerCase();
  return VAULT_STATUS_CONFIG[status]?.countdownName;
};

export const getCountdownTime = vault => {
  if (!vault) return null;

  const status = vault.vaultStatus?.toLowerCase();
  if (!status || !VAULT_STATUS_CONFIG[status]) return null;

  const contributionEnd = new Date(vault.contributionPhaseStart).getTime() + vault.contributionDuration;
  if (
    vault.acquireOpenWindowType === 'custom' &&
    contributionEnd < Date.now() &&
    (vault.acquirePhaseStart ? vault.acquirePhaseStart < Date.now() : true)
  ) {
    return VAULT_STATUS_CONFIG['custom_acquire'].getCountdownTime(vault);
  }

  if (status === 'expansion' && vault.expansionNoLimit && vault.expansionAssetMax) {
    return `Asset Limit`;
  }

  return VAULT_STATUS_CONFIG[status].getCountdownTime(vault);
};
