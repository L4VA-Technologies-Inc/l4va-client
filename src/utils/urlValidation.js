import { SOCIAL_PLATFORMS, socialPlatforms } from '@/constants/core.constants';

const URL_REGEX = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .\-@~:?#[\]!$&'()*+,;=%]*)*\/?$/i;

const SOCIAL_PLATFORM_HOSTS = {
  [SOCIAL_PLATFORMS.FACEBOOK]: ['facebook.com', 'fb.com', 'm.facebook.com'],
  [SOCIAL_PLATFORMS.X]: ['x.com', 'twitter.com'],
  [SOCIAL_PLATFORMS.MEDIUM]: ['medium.com'],
  [SOCIAL_PLATFORMS.TELEGRAM]: ['t.me', 'telegram.me'],
  [SOCIAL_PLATFORMS.TIKTOK]: ['tiktok.com'],
  [SOCIAL_PLATFORMS.YOUTUBE]: ['youtube.com', 'youtu.be'],
};

const getNormalizedHostname = url => {
  try {
    const formattedUrl = url.trim().startsWith('http') ? url.trim() : `https://${url.trim()}`;
    return new URL(formattedUrl).hostname.replace(/^www\./i, '').toLowerCase();
  } catch {
    return null;
  }
};

export const urlMatchesSocialPlatform = (url, platformId) => {
  if (!platformId || platformId === SOCIAL_PLATFORMS.WEBSITE) {
    return true;
  }

  const allowedHosts = SOCIAL_PLATFORM_HOSTS[platformId];
  if (!allowedHosts) {
    return true;
  }

  const hostname = getNormalizedHostname(url);
  if (!hostname) {
    return false;
  }

  return allowedHosts.some(host => hostname === host || hostname.endsWith(`.${host}`));
};

const getPlatformDisplayName = platformId => socialPlatforms.find(p => p.id === platformId)?.name || platformId;

const getLegacyPlatformPrefix = platformId => {
  const platform = socialPlatforms.find(p => p.id === platformId);
  return platform?.placeholder ?? '';
};

export const getSocialPlatformUrlPrefix = platformId => {
  const legacyPrefix = getLegacyPlatformPrefix(platformId);
  if (!legacyPrefix) {
    return '';
  }

  if (platformId === SOCIAL_PLATFORMS.WEBSITE || legacyPrefix.startsWith('http')) {
    return legacyPrefix;
  }

  return `https://${legacyPrefix}`;
};

const isPrefixOnlySocialUrl = (url, platformId) => {
  const trimmedUrl = String(url ?? '').trim();
  if (!trimmedUrl) {
    return false;
  }

  const prefixes = [getSocialPlatformUrlPrefix(platformId), getLegacyPlatformPrefix(platformId)].filter(Boolean);
  return prefixes.some(prefix => trimmedUrl === prefix);
};

export const getUrlForPlatformChange = (currentUrl, newPlatformId, oldPlatformId) => {
  const newPrefix = getSocialPlatformUrlPrefix(newPlatformId);

  if (!currentUrl?.trim()) {
    return newPrefix;
  }

  const oldPrefixes = [getSocialPlatformUrlPrefix(oldPlatformId), getLegacyPlatformPrefix(oldPlatformId)].filter(
    Boolean
  );

  if (oldPrefixes.some(prefix => currentUrl === prefix || currentUrl.trim() === prefix)) {
    return newPrefix;
  }

  return currentUrl;
};

export const sanitizeSocialUrlInput = url => String(url ?? '').replace(/\s/g, '');

export const validateSocialUrlForPlatform = (url, platformId) => {
  const baseValidation = validateUrlRealTime(url);

  if (baseValidation.isEmpty || !baseValidation.isValid) {
    return baseValidation;
  }

  if (isPrefixOnlySocialUrl(url, platformId)) {
    const platformName = getPlatformDisplayName(platformId);
    return {
      isValid: false,
      error: `Please complete the ${platformName} URL`,
      formattedUrl: baseValidation.formattedUrl,
      isEmpty: false,
    };
  }

  if (!urlMatchesSocialPlatform(url, platformId)) {
    const platformName = getPlatformDisplayName(platformId);
    return {
      isValid: false,
      error: `URL must be a ${platformName} link`,
      formattedUrl: baseValidation.formattedUrl,
      isEmpty: false,
    };
  }

  return baseValidation;
};

export const validateUrlRealTime = url => {
  if (!url || url.trim() === '') {
    return {
      isValid: false,
      error: '',
      formattedUrl: '',
      isEmpty: true,
    };
  }

  const trimmedUrl = url.trim();

  if (/\s/.test(trimmedUrl)) {
    return {
      isValid: false,
      error: 'URL cannot contain spaces',
      formattedUrl: trimmedUrl,
      isEmpty: false,
    };
  }

  const formattedUrl = trimmedUrl.startsWith('http') ? trimmedUrl : `https://${trimmedUrl}`;

  if (!URL_REGEX.test(formattedUrl)) {
    return {
      isValid: false,
      error: 'Please enter a valid URL (e.g., https://example.com)',
      formattedUrl,
      isEmpty: false,
    };
  }

  try {
    const urlObj = new URL(formattedUrl);
    if (!urlObj.hostname || urlObj.hostname.length < 3 || !urlObj.hostname.includes('.')) {
      return {
        isValid: false,
        error: 'Please enter a valid URL with a proper domain',
        formattedUrl,
        isEmpty: false,
      };
    }

    if (urlObj.protocol !== 'https:') {
      return {
        isValid: false,
        error: 'Only HTTPS URLs are allowed for security reasons',
        formattedUrl,
        isEmpty: false,
      };
    }
  } catch {
    return {
      isValid: false,
      error: 'Please enter a valid URL format',
      formattedUrl,
      isEmpty: false,
    };
  }

  return {
    isValid: true,
    error: '',
    formattedUrl,
    isEmpty: false,
  };
};

export const autoFormatUrl = url => {
  if (!url || url.trim() === '') return '';
  const trimmedUrl = url.trim();
  return trimmedUrl.startsWith('http') ? trimmedUrl : `https://${trimmedUrl}`;
};

export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};
