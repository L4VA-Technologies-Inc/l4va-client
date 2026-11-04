import { createContext, useContext } from 'react';

/** LocalStorage keys cleared on logout and on 401 (same set as end of session). */
export function clearAuthLocalStorage() {
  localStorage.removeItem('jwt');
  localStorage.removeItem('authenticated_stake_address');
  localStorage.removeItem('authenticated_wallet_address');
  localStorage.removeItem('authenticated_chain_type');
  localStorage.removeItem('vlrm_balance_cache');
  clearVaultCreationStorage();

  // Clear DexHunter swap component state
  localStorage.removeItem('dexhunter-selected-wallet');
}

/** Vault-creation drafts (manual form + AI chat) belong to one account. */
export const VAULT_DRAFT_OWNER_KEY = 'storageVaultOwner';

export function clearVaultCreationStorage() {
  localStorage.removeItem('storageVault');
  localStorage.removeItem('storageVaultAiMeta');
  localStorage.removeItem(VAULT_DRAFT_OWNER_KEY);
  try {
    sessionStorage.removeItem('aiVaultChat');
  } catch {
    // Best-effort.
  }
}

export const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
