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

// Format large numeric values with K/M/B/T suffixes
export const formatLargeNumber = value => {
  if (value === null || value === undefined || value === '') return '-';
  const numValue = typeof value === 'number' ? value : parseFloat(value);
  if (isNaN(numValue)) return '-';
  if (numValue >= 1e12) return `${(numValue / 1e12).toFixed(2)}T`;
  if (numValue >= 1e9) return `${(numValue / 1e9).toFixed(2)}B`;
  if (numValue >= 1e6) return `${(numValue / 1e6).toFixed(2)}M`;
  if (numValue >= 1e3) return `${(numValue / 1e3).toFixed(2)}K`;
  return numValue.toFixed(2);
};

// Format USD currency values
export const formatUsdCurrency = value => {
  if (value === null || value === undefined || value === '') return '-';
  const numValue = typeof value === 'number' ? value : parseFloat(value);
  if (isNaN(numValue)) return '-';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(numValue);
};

// Format percentage with +/- sign
export const formatPercentage = value => {
  if (value === null || value === undefined || value === '') return '-';
  const numValue = typeof value === 'number' ? value : parseFloat(value);
  if (isNaN(numValue)) return '-';
  const percentValue = numValue * 100;
  const sign = percentValue >= 0 ? '+' : '-';
  const formatted = formatLargeNumber(Math.abs(percentValue));
  return `${sign}${formatted}%`;
};

export const formatCompactNumber = num => {
  if (!num) return 0;
  const formatter = Intl.NumberFormat('en', { notation: 'compact' });
  return formatter.format(num);
};

/**
 * Convert decimal-adjusted (UX) quantity to raw blockchain quantity
 * Uses string manipulation to avoid floating-point precision errors
 * @param {number|string} decimalQuantity - User-facing quantity with decimals (e.g., 3.5)
 * @param {number} decimals - Number of decimal places (default 6)
 * @returns {number} Raw blockchain quantity
 * @example getRawQuantity(3.673214, 6) => 3673214
 * @example getRawQuantity(3.5, 6) => 3500000
 * @example getRawQuantity(0.29, 6) => 290000 (avoids FP error)
 */
export const getRawQuantity = (decimalQuantity, decimals = 6) => {
  if (!decimalQuantity && decimalQuantity !== 0) return 0;
  if (!decimals) return Math.floor(Number(decimalQuantity));

  // Clamp decimals to safe range (0-20)
  const safeDecimals = Math.max(0, Math.min(decimals, 20));

  // Convert to string and split on decimal point
  const strValue = String(decimalQuantity);
  const [integerPart = '0', fractionalPart = ''] = strValue.split('.');

  // Pad or truncate fractional part to match decimals
  const paddedFraction = fractionalPart.padEnd(safeDecimals, '0').substring(0, safeDecimals);

  // Concatenate and parse as integer (handles leading zeros correctly)
  const rawString = integerPart + paddedFraction;
  return parseInt(rawString, 10);
};

/**
 * Convert raw token quantity to decimal-adjusted quantity
 * @param {number} rawQuantity - Raw quantity from blockchain
 * @param {number} decimals - Number of decimal places (default 6)
 * @returns {number} Decimal-adjusted quantity
 * @example getDecimalAdjustedQuantity(3673214, 6) => 3.673214
 * @example getDecimalAdjustedQuantity(3500000, 6) => 3.5
 */
export const getDecimalAdjustedQuantity = (rawQuantity, decimals = 6) => {
  if (!rawQuantity && rawQuantity !== 0) return 0;
  if (!decimals) return rawQuantity;
  return rawQuantity / Math.pow(10, decimals);
};

/**
 * Format token quantity for display with proper decimal adjustment
 * @param {number} rawQuantity - Raw quantity from blockchain
 * @param {number} decimals - Number of decimal places (default 6)
 * @param {number} maxDisplayDecimals - Maximum decimals to show (default 6)
 * @returns {string} Formatted quantity string
 * @example formatTokenQuantity(3673214, 6, 6) => "3.673214"
 * @example formatTokenQuantity(1000000000, 6, 2) => "1,000.00"
 */
export const formatTokenQuantity = (rawQuantity, decimals = 6, maxDisplayDecimals = 6) => {
  const decimalQty = getDecimalAdjustedQuantity(rawQuantity, decimals);

  // For very large numbers, use compact notation
  if (decimalQty >= 1000000) {
    return formatCompactNumber(decimalQty);
  }

  // Otherwise, use locale string with specified decimal places
  // Cap at 8 for UX consistency and clamp to 20 (platform limit for toLocaleString)
  const safeMaxDecimals = Math.min(maxDisplayDecimals, decimals, 8, 20);
  return decimalQty.toLocaleString('en', {
    minimumFractionDigits: 0,
    maximumFractionDigits: safeMaxDecimals,
  });
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
  if (!value) return 0;
  const numValue = typeof value === 'number' ? value : parseFloat(value);
  if (isNaN(numValue)) return 0;
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

/**
 * Clamp a decimal input string to "numbers + one dot" format.
 * - Keeps digits and a single decimal point
 * - Prevents multiple dots
 * - Does not apply any rounding or locale formatting
 *
 * @example clampDecimalInput('1,234.50') => '1234.50'
 * @example clampDecimalInput('..12.3.4') => '.1234' (then normalized by caller if needed)
 */
export const clampDecimalInput = (raw, maxDecimals) =>
  (() => {
    const sanitized = String(raw).replace(/[^\d.]/g, '');
    const firstDotIndex = sanitized.indexOf('.');
    if (firstDotIndex === -1) return sanitized;

    const head = sanitized.slice(0, firstDotIndex + 1);
    const tail = sanitized.slice(firstDotIndex + 1).replace(/\./g, '');

    const dec = Number.isFinite(Number(maxDecimals)) ? Math.max(0, Number(maxDecimals)) : undefined;
    if (dec === undefined) return head + tail;
    return head + tail.slice(0, dec);
  })();

/**
 * Format a number without rounding (raw JS string form).
 * Useful when backend already returns the display-ready number.
 */
export const formatRawNumber = n => {
  if (typeof n === 'number') {
    if (!Number.isFinite(n)) return '0';
    // Avoid "-0"
    if (Object.is(n, -0)) return '0';
    return String(n);
  }

  const raw = String(n ?? '').trim();
  if (!raw) return '0';

  // Preserve display-ready decimal strings as-is (avoid Number(...) coercion)
  if (!/^[+-]?(?:\d+\.?\d*|\.\d+)$/.test(raw)) return '0';
  if (/^[+-]?0+(?:\.0+)?$/.test(raw)) return '0';
  return raw.startsWith('+') ? raw.slice(1) : raw;
};

/**
 * Check if an array contains a UTxO ref.
 * @param {{txHash: string, outputIndex: number}[]} arr
 * @param {{txHash: string, outputIndex: number}} ref
 */
export const includesUtxoRef = (arr, ref) =>
  Array.isArray(arr) && !!ref && arr.some(r => r?.txHash === ref.txHash && r?.outputIndex === ref.outputIndex);

// Convert scientific notation to a plain decimal string.
// Example: "1.23e-4" -> "0.000123"
const expandExponential = str => {
  const s = String(str);
  if (!/[eE]/.test(s)) return s;

  const match = s.match(/^([+-])?(\d+)(?:\.(\d+))?[eE]([+-]?\d+)$/);
  if (!match) return s;

  const sign = match[1] || '';
  const intPart = match[2] || '0';
  const fracPart = match[3] || '';
  const exp = parseInt(match[4], 10);

  const digits = `${intPart}${fracPart}`.replace(/^0+/, '') || '0';
  const decPos = intPart.length;
  const newPos = decPos + exp;

  if (digits === '0') return '0';

  if (newPos <= 0) {
    return `${sign}0.${'0'.repeat(-newPos)}${digits}`;
  }

  if (newPos >= digits.length) {
    return `${sign}${digits}${'0'.repeat(newPos - digits.length)}`;
  }

  return `${sign}${digits.slice(0, newPos)}.${digits.slice(newPos)}`;
};

const toScaledBigInt = (value, scale) => {
  // Convert a decimal number to an integer at `scale` decimals without floating point summation.
  // Example: value=112.0021, scale=4 -> 1120021n
  const s = expandExponential(String(value));
  const [intPartRaw, fracRaw = ''] = s.split('.');
  const sign = intPartRaw.startsWith('-') ? -1n : 1n;
  const intPart = intPartRaw.replace('-', '');
  const frac = String(fracRaw ?? '')
    .padEnd(scale, '0')
    .slice(0, scale);
  const digits = `${intPart || '0'}${frac}`;
  const asInt = BigInt(digits || '0');
  return sign * asInt;
};

const formatScaledBigInt = (value, scale) => {
  const negative = value < 0n;
  const abs = negative ? -value : value;
  const s = abs.toString();

  if (scale <= 0) return `${negative ? '-' : ''}${s}`;

  const pad = scale + 1;
  const padded = s.length < pad ? s.padStart(pad, '0') : s;
  const i = padded.length - scale;
  const intPart = padded.slice(0, i);
  const fracPart = padded.slice(i);
  const trimmedFrac = fracPart.replace(/0+$/, '');
  return `${negative ? '-' : ''}${intPart}${trimmedFrac ? `.${trimmedFrac}` : ''}`;
};

/**
 * Sum decimal numbers exactly (avoids 0.1+0.2 FP artifacts).
 * Returns a string with no rounding, trimming trailing zeros.
 *
 * @param {(number|string)[]} values
 * @returns {string}
 */
export const sumExactDecimals = values => {
  if (!Array.isArray(values) || values.length === 0) return '0';

  const normalized = values
    .map(v => expandExponential(String(v)))
    .filter(v => v && /^[+-]?(?:\d+\.?\d*|\.\d+)$/.test(v));

  if (!normalized.length) return '0';

  const scales = normalized.map(s => {
    const idx = s.indexOf('.');
    return idx === -1 ? 0 : s.length - idx - 1;
  });
  const scale = Math.max(0, ...scales);
  const sum = normalized.reduce((acc, v) => acc + toScaledBigInt(v, scale), 0n);
  return formatScaledBigInt(sum, scale);
};

/**
 * Safely format a policy ID for display
 * @param {string} policyId - The policy ID to format (can be null/undefined)
 * @param {number} prefixLen - Number of characters to show at start (default 6)
 * @param {number} suffixLen - Number of characters to show at end (default 6)
 * @returns {string} Formatted policy ID or empty string if not provided
 * @example formatPolicyId('0b8fd6250b719b611625c7d21831...') => '0b8fd6...23f7'
 */
export const formatPolicyId = (policyId, prefixLen = 6, suffixLen = 6) => {
  if (!policyId || typeof policyId !== 'string') return '';
  if (policyId.length <= prefixLen + suffixLen) return policyId;
  return `${policyId.substring(0, prefixLen)}...${policyId.substring(policyId.length - suffixLen)}`;
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
  if (!endTime) {
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

export const formatDateTime = (dt, options = {}) => {
  if (!dt) return null;

  // Default must remain stable across the app (legacy format).
  const { variant = 'withTimezone' } = options;
  const dateObj = typeof dt === 'string' ? new Date(dt) : dt;

  if (variant === 'withTimezone') {
    const date = dateObj.toLocaleDateString();
    const time = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const timezoneOffset = formatISO(dateObj).slice(19, 25);
    const timezoneString = `GMT${timezoneOffset.slice(0, 3)}`;
    return `${date} ${time} (${timezoneString})`;
  }

  // Default: compact, high-legibility UI format (matches StakingWidget's original look)
  return dateObj.toLocaleString(undefined, {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
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
  const status = vault?.vaultStatus?.toLowerCase();

  // Only check for custom acquire window if vault is in contribution status
  if (status === 'contribution') {
    const contributionEnd = new Date(vault.contributionPhaseStart).getTime() + vault.contributionDuration;

    if (
      vault.acquireOpenWindowType === 'custom' &&
      contributionEnd < Date.now() &&
      (!vault.acquirePhaseStart || new Date(vault.acquirePhaseStart).getTime() > Date.now())
    ) {
      return VAULT_STATUS_CONFIG['custom_acquire']?.countdownName;
    }
  }

  return VAULT_STATUS_CONFIG[status]?.countdownName;
};

export const getCountdownTime = vault => {
  if (!vault) return null;

  const status = vault.vaultStatus?.toLowerCase();
  if (!status || !VAULT_STATUS_CONFIG[status]) return null;

  // Only check for custom acquire window if vault is in contribution status
  if (status === 'contribution') {
    const contributionEnd = new Date(vault.contributionPhaseStart).getTime() + vault.contributionDuration;

    if (
      vault.acquireOpenWindowType === 'custom' &&
      contributionEnd < Date.now() &&
      (!vault.acquirePhaseStart || new Date(vault.acquirePhaseStart).getTime() > Date.now())
    ) {
      return VAULT_STATUS_CONFIG['custom_acquire'].getCountdownTime(vault);
    }
  }

  if (status === 'expansion' && vault.expansionNoLimit && vault.expansionAssetMax) {
    return `Asset Limit`;
  }

  return VAULT_STATUS_CONFIG[status].getCountdownTime(vault);
};
