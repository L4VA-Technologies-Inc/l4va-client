import { Link, useNavigate } from 'react-router-dom';

import { ConnectButton } from './ConnectButton';
import { CurrencyDropdown } from './CurrencyDropdown.jsx';

import { useModal } from '@/context/modals';
import { useAuth } from '@/context/auth';

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
        onSuccess: () => navigate(to),
      });
    }
  };

  const NavLink = ({ to, label }) => (
    <Link
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
          <img alt="L4VA Logo" className="hidden lg:block w-[160px]" src="/assets/l4va-logo.webp"/>
          <img alt="L4VA Logo" className="lg:hidden w-[60px]" src="/assets/l4va-icon.png"/>
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
        <ConnectButton />
      </nav>
    </div>
  );
};
