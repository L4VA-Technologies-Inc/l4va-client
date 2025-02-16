import { useState, useEffect } from 'react';
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

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <div className="py-6">
      <nav className="container mx-auto  flex items-center justify-between">
        <Link to="/">
          <img alt="L4VA Logo" className="w-[160px]" src="/assets/logo.webp"/>
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
            className=""
            type="button"
            onClick={toggleMobileMenu}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        <div className="hidden lg:block">
          <ConnectButton />
        </div>
      </nav>

      <div
        className={`lg:hidden fixed inset-0 bg-black/95 backdrop-blur-md transform transition-transform duration-300
          ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="absolute top-6 right-6">
          <button
            aria-label="Close mobile menu"
            className=" p-2 hover:bg-white/10 rounded-full transition-colors"
            type="button"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex flex-col items-center justify-center min-h-screen px-6 py-20">
          <div className="w-full max-w-sm space-y-8">
            <div className="flex justify-center mb-12">
              <CurrencyDropdown
                options={options}
                value="ADA"
                onSelect={(value) => console.log(value)}
              />
            </div>

            {navLinks.map(({ to, label }, index) => (
              <div
                key={to}
                className="transform transition-all duration-300 delay-100"
                style={{
                  opacity: isMobileMenuOpen ? 1 : 0,
                  transform: `translateY(${isMobileMenuOpen ? 0 : 20}px)`,
                  transitionDelay: `${index * 100}ms`,
                }}
              >
                <Link
                  className="block text-4xl text-center font-satoshi font-bold  hover:text-main-red transition-colors duration-200"
                  to={to}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {label}
                </Link>
              </div>
            ))}
            <div
              className="flex justify-center pt-12 transform transition-all duration-300 delay-500"
              style={{
                opacity: isMobileMenuOpen ? 1 : 0,
                transform: `translateY(${isMobileMenuOpen ? 0 : 20}px)`,
              }}
            >
              <ConnectButton />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
