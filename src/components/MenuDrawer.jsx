import clsx from 'clsx';
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

  return (
    <>
      <div
        className={clsx(
          'fixed inset-0 bg-black/50 z-40 transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0'
        )}
        style={{ pointerEvents: isOpen ? 'auto' : 'none', height: '100dvh' }}
        onClick={onClose}
      />
      <div
        className="fixed right-0 w-80 bg-steel-900 shadow-xl transition-transform duration-300 ease-out z-50"
        style={{ top: 0, bottom: 0, height: '100dvh', transform: isOpen ? 'translateX(0)' : 'translateX(100%)' }}
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
    </>
  );
};
