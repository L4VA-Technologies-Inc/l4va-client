import { Link } from '@tanstack/react-router';
import React, { useCallback, useState } from 'react';
import { Menu, Bell } from 'lucide-react';

import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent } from '@/components/ui/dropdown-menu';
import { ConnectButton } from '@/components/ConnectButton';
import { MenuDrawer } from '@/components/MenuDrawer';
import { useAuth } from '@/lib/auth/auth';
import { useModalControls } from '@/lib/modals/modal.context';
import { cn } from '@/lib/utils';
import L4vaIcon from '@/icons/l4va.svg?react';

const navLinks = [
  { to: '/create', label: 'Create' },
  { to: '/vaults?tab=contribute', label: 'Contribute' },
  { to: '/vaults?tab=acquire', label: 'Acquire' },
  { to: '/vaults?tab=govern', label: 'Govern' },
];

const mockNotifications = [
  {
    id: 1,
    title: 'Trade Chat #47a10c06 | trade84 | 01',
    message: 'Message text',
    time: '2 minutes',
  },
  {
    id: 2,
    title: 'Trade Chat #4djd06 | trade84 | 02',
    message: 'Message text',
    time: '23 minutes',
  },
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

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <header
      className={cn(
        'h-[var(--header-height)] flex items-center fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b border-steel-900/50'
      )}
    >
      <div className="container mx-auto px-4 xl:px-0">
        <nav className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 active" data-status="active" aria-current="page">
            <L4vaIcon className="flex-shrink-0" height={24} width={24} />
            <span className="hidden md:block text-2xl font-bold uppercase">L4VA</span>
          </Link>
          <button
            className={cn('md:hidden p-2 ml-2 rounded-full hover:bg-steel-850 transition-colors')}
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
            <div className="flex-1" />
            {isAuthenticated && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="p-2 rounded-full hover:bg-steel-850 transition-colors relative mr-2"
                    aria-label="Show notifications"
                    type="button"
                  >
                    <Bell className="w-6 h-6" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[380px] p-4 bg-steel-950 border-0 shadow-xl mt-2">
                  <h3 className="font-bold mb-4">Notifications</h3>
                  <div className="flex flex-col gap-2">
                    {mockNotifications.map(n => (
                      <div key={n.id} className="rounded-xl p-4">
                        <div className="font-medium text-white">{n.title}</div>
                        <div className="text-base text-dark-100">{n.message}</div>
                        <div className="text-sm mt-1 text-dark-100 opacity-70">{n.time}</div>
                      </div>
                    ))}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
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
