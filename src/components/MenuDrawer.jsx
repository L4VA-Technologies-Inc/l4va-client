import clsx from 'clsx';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { Link } from '@tanstack/react-router';

import { LavaSteelSelect } from '@/components/shared/LavaSelect.jsx';
import { useCurrency } from '@/hooks/useCurrency.js';
import { useNetwork } from '@/hooks/useNetwork.js';
import { useAuth } from '@/lib/auth/auth';
import { ChainType } from '@/utils/types';
import CardanoIcon from '@/icons/cardano.svg?react';
import RobinhoodIcon from '@/icons/robinhood.svg?react';

export const MenuDrawer = ({ navLinks, isOpen, onClose, onNavClick }) => {
  const handleNavClick = (link, e) => {
    if (onNavClick) {
      onNavClick(link.to, e, link.isAuth);
    }
    onClose();
  };

  const { isAuthenticated } = useAuth();
  const { currency: selectedCurrency, updateCurrency } = useCurrency();
  const { network: selectedNetwork, updateNetwork, isRobinHood, isCardano } = useNetwork();

  const currencyOptions = [
    ...(isRobinHood ? [] : [{ label: 'ADA', value: 'ada' }]),
    { label: 'USD', value: 'usdt' },
    ...(isCardano ? [] : [{ label: 'ETH', value: 'eth' }]),
  ];

  const networkOptions = [
    {
      label: 'Cardano',
      value: ChainType.CARDANO,
      icon: <CardanoIcon className="w-4 h-4 flex-shrink-0 text-white" />,
    },
    {
      label: 'Robinhood',
      value: ChainType.ROBINHOOD,
      icon: <RobinhoodIcon className="w-4 h-4 flex-shrink-0 text-white" />,
    },
  ];

  const handleNetworkChange = val => {
    updateNetwork(val);
    // ADA isn't available on Robinhood and ETH isn't on Cardano —
    // swap to the network's native currency in the same tick.
    if (val === ChainType.ROBINHOOD && selectedCurrency === 'ada') {
      updateCurrency('eth');
    } else if (val === ChainType.CARDANO && selectedCurrency === 'eth') {
      updateCurrency('ada');
    }
  };

  // Portaled to <body>: the header uses backdrop-blur, which makes it the containing block for
  // `position: fixed` children, so rendered inside it the drawer was sized to the header instead
  // of the screen and left the bottom of the page uncovered on mobile (L4VA-1068).
  return createPortal(
    <>
      <div
        className={clsx(
          'fixed inset-0 bg-black/50 z-[60] transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0'
        )}
        style={{ pointerEvents: isOpen ? 'auto' : 'none' }}
        onClick={onClose}
      />
      <div
        className="fixed inset-y-0 right-0 w-80 max-w-[85vw] bg-steel-900 shadow-xl transition-transform duration-300 ease-out z-[70]"
        style={{ transform: isOpen ? 'translateX(0)' : 'translateX(100%)' }}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-steel-750">
            <h2 className="text-lg font-semibold text-primary-text">Menu</h2>
            <button
              className="p-2 rounded-full hover:bg-steel-850 transition-colors"
              type="button"
              onClick={onClose}
              aria-label="Close menu"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
          <div className="flex-1 p-4 bg-steel-900 overflow-y-auto">
            <div className="flex flex-col gap-2 pb-6 border-b border-steel-750">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-400">Pages</h3>

              <nav className="space-y-1">
                {navLinks.map(link => (
                  <Link
                    key={link.to}
                    className="block text-base font-medium text-primary-text hover:text-orange-400 transition-colors py-1"
                    to={link.to}
                    onClick={e => handleNavClick(link, e)}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="flex flex-col gap-2 pt-6">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-400">Network</h3>

              <LavaSteelSelect
                options={networkOptions}
                value={selectedNetwork}
                disabled={isAuthenticated}
                onChange={handleNetworkChange}
              />
            </div>

            <div className="flex flex-col gap-2 pt-6">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-400">Currency</h3>

              <LavaSteelSelect options={currencyOptions} value={selectedCurrency} onChange={updateCurrency} />
            </div>
          </div>
          <div className="p-4 border-t border-steel-750 bg-steel-900">
            <div className="text-sm text-gray-400">L4VA Platform</div>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
};
