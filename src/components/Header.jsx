import { Link } from '@tanstack/react-router';
import React, { useCallback, useState } from 'react';
import { Menu } from 'lucide-react';

import { ConnectButton } from '@/components/ConnectButton';
import { MenuDrawer } from '@/components/MenuDrawer';
import { useAuth } from '@/lib/auth/auth';
import { useModalControls } from '@/lib/modals/modal.context';
import L4vaIcon from '@/icons/l4va.svg?react';

const navLinks = [
  { to: '/create', label: 'Create' },
  { to: '/contribute', label: 'Contribute' },
  { to: '/acquire', label: 'Acquire' },
  { to: '/govern', label: 'Govern' },
];

// Memoized NavLink for performance
const NavLink = React.memo(({ to, label, onClick }) => (
  <Link
    activeProps={{ className: 'text-orange-500' }}
    className="font-medium hover:text-orange-500 transition-colors"
    to={to}
    onClick={onClick}
  >
    {label}
  </Link>
));
NavLink.displayName = 'NavLink';

export const Header = () => {
  const { isAuthenticated } = useAuth();
  const { openModal } = useModalControls();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavClick = useCallback(
    (to, e) => {
      if (!isAuthenticated) {
        e.preventDefault();
        openModal('LoginModal');
      }
    },
    [isAuthenticated, openModal]
  );

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="flex items-center p-4 relative container mx-auto">
      <Link to="/" className="flex items-center gap-2 active" data-status="active" aria-current="page">
        <L4vaIcon className="flex-shrink-0" style={{ width: '24px', height: '24px' }} />
        <span className="hidden md:block text-2xl font-bold uppercase">L4VA</span>
      </Link>
      <button
        className="md:hidden p-2 ml-2 rounded-full hover:bg-steel-850 transition-colors"
        aria-label="Toggle mobile menu"
        onClick={toggleMobileMenu}
      >
        <Menu className="w-6 h-6" />
      </button>
      <div className="hidden md:flex items-center flex-1">
        <div className="flex items-center gap-8 ml-[56px]">
          {navLinks.map(link => (
            <NavLink key={link.to} to={link.to} label={link.label} onClick={e => handleNavClick(link.to, e)} />
          ))}
        </div>
        <div className="flex-1"></div>
        <ConnectButton />
      </div>
      <div className="md:hidden ml-auto">
        <ConnectButton />
      </div>
      <MenuDrawer navLinks={navLinks} isOpen={isMobileMenuOpen} onClose={closeMobileMenu} onNavClick={handleNavClick} />
    </nav>
  );
};
