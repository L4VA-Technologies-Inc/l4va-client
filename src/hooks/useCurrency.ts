import { useState, useEffect, useCallback } from 'react';

type CurrencyType = 'ada' | 'usdt' | 'eth';
type CurrencySymbol = '₳' | '$' | 'ETH ';

// Normalize currency value to ensure it's always valid
const normalizeCurrency = (value: string | null): CurrencyType => {
  if (value === 'usdt') return 'usdt';
  if (value === 'eth') return 'eth';
  return 'ada';
};

let globalCurrency = normalizeCurrency(localStorage.getItem('selectedCurrency'));
const subscribers = new Set<(newCurrency: CurrencyType) => void>();

const notifySubscribers = (newCurrency: CurrencyType) => {
  globalCurrency = newCurrency;
  subscribers.forEach(callback => callback(newCurrency));
};

export const useCurrency = (): {
  currency: CurrencyType;
  currencySymbol: CurrencySymbol;
  isAda: boolean;
  pickByCurrency: <T>(values: { ada: T; usd: T; eth: T }) => T;
  updateCurrency: (newCurrency: CurrencyType) => void;
} => {
  const [currency, setCurrency] = useState<CurrencyType>(globalCurrency);

  const updateLocalCurrency = useCallback((newCurrency: CurrencyType) => {
    setCurrency(newCurrency);
  }, []);

  useEffect(() => {
    subscribers.add(updateLocalCurrency);

    setCurrency(globalCurrency);

    return () => {
      subscribers.delete(updateLocalCurrency);
    };
  }, [updateLocalCurrency]);

  const updateCurrency = useCallback((newCurrency: CurrencyType) => {
    localStorage.setItem('selectedCurrency', newCurrency);
    notifySubscribers(newCurrency);
  }, []);

  const currencySymbol: CurrencySymbol = currency === 'ada' ? '₳' : currency === 'eth' ? 'ETH ' : '$';
  const isAda = currency === 'ada';

  // Select the value matching the active currency. Backend returns ada/usd/eth-denominated
  // fields side by side, so callers pass all three variants.
  const pickByCurrency = useCallback(
    <T>(values: { ada: T; usd: T; eth: T }): T => {
      return currency === 'ada' ? values.ada : currency === 'eth' ? values.eth : values.usd;
    },
    [currency]
  );

  return { currency, currencySymbol, isAda, pickByCurrency, updateCurrency };
};
