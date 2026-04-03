import { createContext, useContext } from 'react';

/** LocalStorage keys cleared on logout and on 401 (same set as end of session). */
export function clearAuthLocalStorage() {
  localStorage.removeItem('jwt');
  localStorage.removeItem('authenticated_stake_address');
  localStorage.removeItem('vlrm_balance_cache');
  localStorage.removeItem('storageVault');
}

export const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
