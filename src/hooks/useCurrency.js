import { useState, useEffect, useCallback } from 'react';

let globalCurrency = localStorage.getItem('selectedCurrency') || 'ada';
const subscribers = new Set();

const notifySubscribers = newCurrency => {
  globalCurrency = newCurrency;
  subscribers.forEach(callback => callback(newCurrency));
};

export const useCurrency = () => {
  const [currency, setCurrency] = useState(globalCurrency);

  const updateLocalCurrency = useCallback(newCurrency => {
    setCurrency(newCurrency);
  }, []);

  useEffect(() => {
    subscribers.add(updateLocalCurrency);

    setCurrency(globalCurrency);

    return () => {
      subscribers.delete(updateLocalCurrency);
    };
  }, [updateLocalCurrency]);

  const updateCurrency = useCallback(newCurrency => {
    localStorage.setItem('selectedCurrency', newCurrency);
    notifySubscribers(newCurrency);
  }, []);

  return { currency, updateCurrency };
};
