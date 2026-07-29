import { useState, useEffect, useCallback } from 'react';

export type NetworkType = 'cardano' | 'robinhood';

const NETWORK_STORAGE_KEY = 'selectedNetwork';
const THEME_TRANSITION_CLASS = 'theme-transition';
const THEME_TRANSITION_DURATION_MS = 320;

// Normalize network value to ensure it's always valid
const normalizeNetwork = (value: string | null): NetworkType => {
  return value === 'robinhood' ? 'robinhood' : 'cardano';
};

let globalNetwork: NetworkType = normalizeNetwork(localStorage.getItem(NETWORK_STORAGE_KEY));

let transitionCleanupTimeout: number | null = null;

const FAVICONS = {
  cardano: {
    'favicon-ico': '/favicon/favicon.ico?v=2',
    'favicon-png': '/favicon/favicon.png',
    'favicon-32': '/favicon/favicon-32x32.png',
    'favicon-16': '/favicon/favicon-16x16.png',
  },
  robinhood: {
    'favicon-ico': '/favicon/favicon-rh.ico',
    'favicon-png': '/favicon/favicon-rh.png',
    'favicon-32': '/favicon/favicon-rh-32x32.png',
    'favicon-16': '/favicon/favicon-rh-16x16.png',
  },
} as const;

const applyFavicon = (newNetwork: NetworkType) => {
  const hrefsById = FAVICONS[newNetwork];
  Object.entries(hrefsById).forEach(([id, href]) => {
    const link = document.getElementById(id);
    if (link instanceof HTMLLinkElement) {
      link.href = href;
    }
  });
};

const applyNetworkTheme = (newNetwork: NetworkType, animate = true) => {
  const root = document.documentElement;
  applyFavicon(newNetwork);

  if (!animate) {
    root.setAttribute('data-chain', newNetwork);
    return;
  }

  root.classList.add(THEME_TRANSITION_CLASS);
  root.setAttribute('data-chain', newNetwork);

  if (transitionCleanupTimeout !== null) {
    window.clearTimeout(transitionCleanupTimeout);
  }

  transitionCleanupTimeout = window.setTimeout(() => {
    root.classList.remove(THEME_TRANSITION_CLASS);
    transitionCleanupTimeout = null;
  }, THEME_TRANSITION_DURATION_MS);
};

applyNetworkTheme(globalNetwork, false);

const subscribers = new Set<(newNetwork: NetworkType) => void>();

const notifySubscribers = (newNetwork: NetworkType) => {
  globalNetwork = newNetwork;
  applyNetworkTheme(newNetwork, true);
  subscribers.forEach(callback => callback(newNetwork));
};

export const useNetwork = (): {
  network: NetworkType;
  isCardano: boolean;
  isRobinHood: boolean;
  updateNetwork: (newNetwork: NetworkType) => void;
} => {
  const [network, setNetwork] = useState<NetworkType>(globalNetwork);

  const updateLocalNetwork = useCallback((newNetwork: NetworkType) => {
    setNetwork(newNetwork);
  }, []);

  useEffect(() => {
    subscribers.add(updateLocalNetwork);

    setNetwork(globalNetwork);

    return () => {
      subscribers.delete(updateLocalNetwork);
    };
  }, [updateLocalNetwork]);

  const updateNetwork = useCallback((newNetwork: NetworkType) => {
    localStorage.setItem(NETWORK_STORAGE_KEY, newNetwork);
    notifySubscribers(newNetwork);
  }, []);

  return {
    network,
    isCardano: network === 'cardano',
    isRobinHood: network === 'robinhood',
    updateNetwork,
  };
};
