import clsx from 'clsx';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

export const MenuDrawer = ({ navLinks }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <button
        className="ml-4 p-2 rounded-full hover:bg-steel-850 transition-colors"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Menu className="w-6 h-6 text-white" />
      </button>
      <div
        className={clsx(
          'fixed inset-0 bg-black/50 z-50 transition-all duration-300',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none',
        )}
        onClick={() => setIsOpen(!isOpen)}
      />
      <div
        className={clsx(
          'fixed top-0 right-0 w-64 h-full bg-steel-950 transform transition-all duration-300 ease-out z-50',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <div className="p-6">
          <div className="flex justify-end mb-6">
            <button
              className="p-2 rounded-full hover:bg-steel-850 transition-colors"
              type="button"
              onClick={() => setIsOpen(!isOpen)}
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
          <div className="flex flex-col space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                className="text-2xl font-satoshi font-bold text-white hover:text-orange-500 transition-colors"
                to={link.to}
                onClick={() => setIsOpen(!isOpen)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
