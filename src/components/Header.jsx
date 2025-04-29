import { Link, useNavigate } from '@tanstack/react-router';

import { ConnectButton } from './ConnectButton';
import { CurrencyDropdown } from './CurrencyDropdown';
import { MenuDrawer } from './MenuDrawer';

import { useAuth } from '@/lib/auth/auth';
import { useModal } from '@/context/modals';

import { MODAL_TYPES } from '@/constants/core.constants';

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
  const { isAuthenticated } = useAuth();
  const { openModal } = useModal();
  const navigate = useNavigate();

  const handleNavClick = (to, e) => {
    if (!isAuthenticated) {
      e.preventDefault();
      openModal(MODAL_TYPES.LOGIN, {
        onSuccess: () => navigate({ to }),
      });
    }
  };

  const NavLink = ({ to, label }) => (
    <Link
      activeProps={{ className: 'text-orange-500' }}
      className="min-w-[140px] text-center transition hover:text-orange-500"
      to={to}
      onClick={(e) => handleNavClick(to, e)}
    >
      {label}
    </Link>
  );

  return (
    <div className="py-6">
      <nav className="relative container mx-auto flex items-center justify-between px-4">
        <Link to="/">
          <img alt="L4VA Logo" className="w-[160px]" src="/assets/l4va-logo.webp" />
        </Link>
        <div className="hidden lg:flex items-center text-2xl font-satoshi font-bold">
          <CurrencyDropdown
            options={options}
            value="ADA"
            onSelect={(value) => console.log(value)}
          />
          {navLinks.map((link) => (
            <NavLink key={link.to} {...link} />
          ))}
        </div>
        <div className="flex items-center">
          <ConnectButton />
          <MenuDrawer navLinks={navLinks} />
        </div>
      </nav>
    </div>
  );
};
