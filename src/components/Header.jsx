import { Link, useMatchRoute } from '@tanstack/react-router';
import React, { useCallback, useState } from 'react';
import { Menu } from 'lucide-react';

import { ConnectButton } from '@/components/ConnectButton';
import { MenuDrawer } from '@/components/MenuDrawer';
import { useAuth } from '@/lib/auth/auth';
import { useModalControls } from '@/lib/modals/modal.context';
import L4vaIcon from '@/icons/l4va.svg?react';

const navLinks = [
  { to: '/create', label: 'Create' },
  { to: '/vaults?tab=contribute', label: 'Contribute' },
  { to: '/vaults?tab=acquire', label: 'Acquire' },
  { to: '/vaults?tab=govern', label: 'Govern' },
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
  const matchRoute = useMatchRoute();
  const isCreateRoute = !!matchRoute({ to: '/create' });

  const handleNavClick = useCallback(
    (to, e) => {
      if (!isAuthenticated) {
        e.preventDefault();
        openModal('LoginModal');
      }
    },
    [isAuthenticated, openModal]
  );

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <header
      className={`h-[var(--header-height)] flex items-center fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b border-steel-900/50 ${isCreateRoute ? 'bg-transparent' : 'bg-slate-950/80'}`}
    >
      <div className="container mx-auto px-4 xl:px-0">
        <nav className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 active" data-status="active" aria-current="page">
            <L4vaIcon className="flex-shrink-0" height={24} width={24} />
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
          <MenuDrawer
            navLinks={navLinks}
            isOpen={isMobileMenuOpen}
            onClose={closeMobileMenu}
            onNavClick={handleNavClick}
          />
        </nav>
      </div>
    </header>
  );
};
