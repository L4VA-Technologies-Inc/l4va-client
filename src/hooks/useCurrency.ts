import { useState, useEffect, useCallback } from 'react';

// Normalize currency value to ensure it's always valid
const normalizeCurrency = (value: string | null): 'ada' | 'usdt' => {
  return value === 'usdt' ? 'usdt' : 'ada';
};

let globalCurrency = normalizeCurrency(localStorage.getItem('selectedCurrency'));
const subscribers = new Set<(newCurrency: 'ada' | 'usdt') => void>();

const notifySubscribers = (newCurrency: 'ada' | 'usdt') => {
  globalCurrency = newCurrency;
  subscribers.forEach(callback => callback(newCurrency));
};

export const useCurrency = (): {
  currency: 'ada' | 'usdt';
  currencySymbol: '₳' | '$';
  isAda: boolean;
  updateCurrency: (newCurrency: 'ada' | 'usdt') => void;
} => {
  const [currency, setCurrency] = useState<'ada' | 'usdt'>(globalCurrency);

  const updateLocalCurrency = useCallback((newCurrency: 'ada' | 'usdt') => {
    setCurrency(newCurrency);
  }, []);

  useEffect(() => {
    subscribers.add(updateLocalCurrency);

    setCurrency(globalCurrency);

    return () => {
      subscribers.delete(updateLocalCurrency);
    };
  }, [updateLocalCurrency]);

  const updateCurrency = useCallback((newCurrency: 'ada' | 'usdt') => {
    localStorage.setItem('selectedCurrency', newCurrency);
    notifySubscribers(newCurrency);
  }, []);

  const currencySymbol: '₳' | '$' = currency === 'ada' ? '₳' : '$';
  const isAda = currency === 'ada';

  return { currency, currencySymbol, isAda, updateCurrency };
};
