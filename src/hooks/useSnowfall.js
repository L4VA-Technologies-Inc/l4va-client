import { useState, useEffect, useCallback } from 'react';

const SNOWFALL_STORAGE_KEY = 'snowfallEnabled';
let globalSnowfallEnabled = localStorage.getItem(SNOWFALL_STORAGE_KEY) !== 'false';
const subscribers = new Set();

const notifySubscribers = newValue => {
  globalSnowfallEnabled = newValue;
  subscribers.forEach(callback => callback(newValue));
};

export const useSnowfall = () => {
  const [enabled, setEnabled] = useState(globalSnowfallEnabled);

  const updateLocalEnabled = useCallback(newValue => {
    setEnabled(newValue);
  }, []);

  useEffect(() => {
    subscribers.add(updateLocalEnabled);
    setEnabled(globalSnowfallEnabled);
    return () => {
      subscribers.delete(updateLocalEnabled);
    };
  }, [updateLocalEnabled]);

  const toggleSnowfall = useCallback(() => {
    const newValue = !globalSnowfallEnabled;
    localStorage.setItem(SNOWFALL_STORAGE_KEY, newValue.toString());
    notifySubscribers(newValue);
  }, []);

  return { enabled, toggleSnowfall };
};
