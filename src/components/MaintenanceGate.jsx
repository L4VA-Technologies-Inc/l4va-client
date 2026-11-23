import { useRef, useState } from 'react';

import { useAuth } from '@/lib/auth/auth';
import { useNetwork } from '@/hooks/useNetwork';
import { useModalControls } from '@/lib/modals/modal.context';
import { useSiteAccess } from '@/services/api/queries';

// Taps on the logo within this window that open the (otherwise hidden) wallet sign-in.
const SECRET_TAPS = 5;
const SECRET_WINDOW_MS = 3000;

const MaintenancePage = () => {
  const { openModal } = useModalControls();
  const { isAuthenticated, user, logout } = useAuth();
  const { network, updateNetwork } = useNetwork();
  const [unlocked, setUnlocked] = useState(false);
  const taps = useRef([]);

  // No visible sign-in: allowlisted team wallets tap the logo 5 times to connect.
  const onLogoTap = () => {
    const now = Date.now();
    taps.current = [...taps.current.filter(t => now - t < SECRET_WINDOW_MS), now];
    if (taps.current.length >= SECRET_TAPS) {
      taps.current = [];
      setUnlocked(true);
      openModal('LoginModal');
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-steel-950 px-4 text-center">
      <img
        src="/assets/l4va-brand-logo.png"
        alt="L4VA"
        className="h-12 w-auto select-none object-contain"
        draggable={false}
        onClick={onLogoTap}
      />
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white">Under maintenance</h1>
        <p className="max-w-md text-dark-100">We&apos;re getting things ready. Please check back soon.</p>
      </div>
      {/* Sign-in follows the selected chain and the header switcher is hidden here, so the
          unlocked view offers it (Cardano vs Robinhood wallet). */}
      {unlocked && !isAuthenticated && (
        <div className="flex items-center gap-3 text-xs text-dark-100">
          {['robinhood', 'cardano'].map(n => (
            <button
              key={n}
              type="button"
              onClick={() => {
                updateNetwork(n);
                openModal('LoginModal');
              }}
              className={n === network ? 'text-white underline underline-offset-2' : 'hover:text-white'}
            >
              {n === 'robinhood' ? 'Robinhood wallet' : 'Cardano wallet'}
            </button>
          ))}
        </div>
      )}
      {/* Signed in with a wallet that is not allowlisted: let it switch to another one. */}
      {isAuthenticated && (
        <button
          type="button"
          onClick={() => logout?.()}
          className="text-xs text-dark-100 underline-offset-2 hover:text-white hover:underline"
        >
          {user?.address ? `${user.address.slice(0, 6)}…${user.address.slice(-4)} · ` : ''}Sign out
        </button>
      )}
    </div>
  );
};

/**
 * Closed launch: while the API's `maintenance_mode` is on, everyone except allowlisted
 * wallets sees a maintenance page. UI-only gate — the API itself stays reachable.
 */
export const MaintenanceGate = ({ children }) => {
  const { user, isLoading: authLoading } = useAuth();

  const { data, isLoading, isError } = useSiteAccess(user?.id);

  if (isLoading || authLoading) return null;
  // Fail closed: if access can't be confirmed (API unreachable), keep the site shut. Once a
  // check has succeeded, a later failed refetch keeps the last known answer.
  if (!data && isError) return <MaintenancePage />;
  if (data?.maintenance && !data.allowed) return <MaintenancePage />;
  return children;
};
