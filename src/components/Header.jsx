import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

import { ConnectButton } from './ConnectButton';
import { CurrencyDropdown } from './CurrencyDropdown.jsx';

const options = [
  { value: 'USD', icon: '/assets/icons/flag.svg', label: 'USD' },
  { value: 'ADA', icon: '/assets/icons/ada.svg', label: 'ADA' },
];

const navLinks = [
  { to: '/create', label: 'Create' },
  { to: '/contribute', label: 'Contribute' },
  { to: '/invest', label: 'Invest' },
  { to: '/govern', label: 'Govern' },
];

export const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="absolute top-0 w-full z-10 px-6">
      <nav className="container mx-auto text-primary-text py-4 flex items-center justify-between">
        <Link to="/">
          <img alt="L4VA Logo" className="w-[160px] h-[60px]" src="/assets/logo.webp"/>
        </Link>
        <div className="hidden lg:flex items-center text-2xl font-satoshi font-bold">
          <CurrencyDropdown
            options={options}
            value="ADA"
            onSelect={(value) => console.log(value)}
          />
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              className="min-w-[140px] text-center transition hover:text-main-red"
              to={to}
            >
              {label}
            </Link>
          ))}
        </div>
        <div className="lg:hidden flex items-center gap-4">
          <button
            aria-label="Toggle mobile menu"
            className="text-primary-text"
            type="button"
            onClick={toggleMobileMenu}
          >
            {isMobileMenuOpen ? (
              <X size={24} />
            ) : (
              <Menu size={24} />
            )}
          </button>
        </div>
        <div className="hidden lg:block">
          <ConnectButton />
        </div>
      </nav>
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-black/90 py-6">
          <div className="container mx-auto flex flex-col items-center gap-6">
            <CurrencyDropdown
              options={options}
              value="ADA"
              onSelect={(value) => console.log(value)}
            />
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                className="text-2xl font-satoshi font-bold text-primary-text hover:text-main-red"
                to={to}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {label}
              </Link>
            ))}
            <ConnectButton />
          </div>
        </div>
      )}
    </div>
  );
};
