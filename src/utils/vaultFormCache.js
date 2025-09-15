const CACHE_KEY = 'lava_vault_form_cache';

export const saveVaultFormCache = (formData) => {
  localStorage.setItem(CACHE_KEY, JSON.stringify(formData));
};

export const loadVaultFormCache = () => {
  try {
    const cachedData = localStorage.getItem(CACHE_KEY);
    if (!cachedData) return null;

    return JSON.parse(cachedData);
  } catch (error) {
    clearVaultFormCache();
    return null;
  }
};

export const clearVaultFormCache = () => {
  localStorage.removeItem(CACHE_KEY);
};

export const hasVaultFormCache = () => {
  try {
    const cachedData = localStorage.getItem(CACHE_KEY);
    return cachedData !== null;
  } catch (error) {
    return false;
  }
};

let saveTimeout;
export const debouncedSaveVaultFormCache = (formData, delay = 1000) => {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    saveVaultFormCache(formData);
  }, delay);
};
