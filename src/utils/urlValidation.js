const URL_REGEX = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i;

export const validateUrlRealTime = (url) => {
  if (!url || url.trim() === '') {
    return {
      isValid: false,
      error: '',
      formattedUrl: '',
      isEmpty: true
    };
  }

  const trimmedUrl = url.trim();
  
  const formattedUrl = trimmedUrl.startsWith('http') ? trimmedUrl : `https://${trimmedUrl}`;
  
  if (!URL_REGEX.test(formattedUrl)) {
    return {
      isValid: false,
      error: 'Please enter a valid URL (e.g., https://example.com)',
      formattedUrl,
      isEmpty: false
    };
  }

  try {
    const urlObj = new URL(formattedUrl);
    if (!urlObj.hostname || urlObj.hostname.length < 3 || !urlObj.hostname.includes('.')) {
      return {
        isValid: false,
        error: 'Please enter a valid URL with a proper domain',
        formattedUrl,
        isEmpty: false
      };
    }
    
    if (urlObj.protocol !== 'https:') {
      return {
        isValid: false,
        error: 'Only HTTPS URLs are allowed for security reasons',
        formattedUrl,
        isEmpty: false
      };
    }
  } catch (error) {
    return {
      isValid: false,
      error: 'Please enter a valid URL format',
      formattedUrl,
      isEmpty: false
    };
  }

  return {
    isValid: true,
    error: '',
    formattedUrl,
    isEmpty: false
  };
};

export const autoFormatUrl = (url) => {
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
