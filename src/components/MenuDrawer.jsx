import clsx from 'clsx';
import { X } from 'lucide-react';
import { Link } from '@tanstack/react-router';

export const MenuDrawer = ({ navLinks, isOpen, onClose, onNavClick }) => {
  const handleNavClick = (link, e) => {
    if (onNavClick) {
      onNavClick(link.to, e);
    }
    onClose();
  };

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
          'fixed top-0 right-0 w-80 h-full bg-steel-900 shadow-xl transform transition-transform duration-300 ease-out z-50',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 pb-0 border-b border-steel-850">
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
          <div className="flex-1 p-4 bg-steel-900">
            <nav className="space-y-4">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  className="block text-lg font-medium text-primary-text hover:text-orange-500 transition-colors py-2"
                  to={link.to}
                  onClick={e => handleNavClick(link, e)}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="p-4 border-t border-steel-850 bg-steel-900">
            <div className="text-sm text-gray-400">L4VA Platform</div>
          </div>
        </div>
      </div>
    </>
  );
};
