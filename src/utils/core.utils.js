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
  const numericValue = value.replace(/[^0-9]/g, '');
  return numericValue;
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
  const difference = new Date(endTime) - new Date();

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

export const formatDateTime = dt => {
  if (!dt) return null;

  const date = dt.toLocaleDateString();
  const time = dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const timezoneOffset = formatISO(dt).slice(19, 25);
  const timezoneString = `GMT${timezoneOffset.slice(0, 3)}`;

  return `${date} ${time} (${timezoneString})`;
};

export const getCountdownName = vault => {
  if (vault.vaultStatus === 'contribution') {
    return 'Contribution ends in';
  }
  if (vault.vaultStatus === 'acquire') {
    return 'Acquire ends in';
  }
  if (vault.vaultStatus === 'locked') {
    return 'Vault Locked';
  }
  return 'Contribution starts in';
};
