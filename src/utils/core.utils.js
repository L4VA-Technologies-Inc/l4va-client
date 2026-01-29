import { formatISO } from 'date-fns';

export const formatNum = (value, maximumFractionDigits = 2) =>
  value
    ? Number(value).toLocaleString('en', {
        useGrouping: true,
        maximumFractionDigits,
      })
    : 0;

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

  return VAULT_STATUS_CONFIG[status].getCountdownTime(vault);
};
