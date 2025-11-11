import clsx from 'clsx';
import { X } from 'lucide-react';
import { Link } from '@tanstack/react-router';

import { LavaSteelSelect } from '@/components/shared/LavaSelect.jsx';
import { useCurrency } from '@/hooks/useCurrency.js';

export const MenuDrawer = ({ navLinks, isOpen, onClose, onNavClick }) => {
  const handleNavClick = (link, e) => {
    if (onNavClick) {
      onNavClick(link.to, e);
    }
    onClose();
  };

  const { currency: selectedCurrency, updateCurrency } = useCurrency();

  const currencyOptions = [
    { label: 'ADA', value: 'ada' },
    { label: 'USD', value: 'usdt' },
  ];

  return (
    <>
      <div
        className={clsx(
          'fixed inset-0 h-screen bg-black/50 z-40 transition-opacity duration-300',
          isOpen ? 'opacity-100 ' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />
      <div
        className={clsx(
          'fixed top-0 right-0 w-80 h-screen bg-steel-900 shadow-xl transform transition-transform duration-300 ease-out z-50',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
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
