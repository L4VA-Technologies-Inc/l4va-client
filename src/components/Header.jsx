import { Link, useRouter } from '@tanstack/react-router';
import React, { useCallback, useState, useEffect, useRef } from 'react';
import { Menu, Bell } from 'lucide-react';
import { useCounts, useNotifications } from '@novu/react';

import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent } from '@/components/ui/dropdown-menu';
import { ConnectButton } from '@/components/ConnectButton';
import { MenuDrawer } from '@/components/MenuDrawer';
import { useAuth } from '@/lib/auth/auth';
import { useModalControls } from '@/lib/modals/modal.context';
import { cn } from '@/lib/utils';
import L4vaIcon from '@/icons/l4va.svg?react';
import { LavaSteelSelect } from '@/components/shared/LavaSelect.jsx';
import { useCurrency } from '@/hooks/useCurrency';

const navLinks = [
  { to: '/create', label: 'Create' },
  { to: '/vaults?tab=contribute', label: 'Contribute' },
  { to: '/vaults?tab=acquire', label: 'Acquire' },
  { to: '/vaults?tab=past', label: 'Govern' },
];

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
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const { currency: selectedCurrency, updateCurrency } = useCurrency();

  const currencyOptions = [
    { label: 'ADA', value: 'ada' },
    { label: 'USD', value: 'usdt' },
  ];

  const { notifications, fetching, readAll, hasMore, isLoading, fetchMore } = useNotifications();
  const observerTarget = useRef(null);
  const router = useRouter();

  const { counts } = useCounts({
    filters: [{ read: false }],
  });

  const unreadCount = counts?.[0]?.count ?? 0;

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          fetchMore();
        }
      },
      { threshold: 0.5 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isLoading, fetchMore]);

  const handleNavClick = useCallback(
    (to, e) => {
      if (!isAuthenticated) {
        e.preventDefault();
        openModal('LoginModal');
      }
    },
    [isAuthenticated, openModal]
  );

  const handleNotificationClick = vaultId => {
    if (vaultId) {
      router.navigate({ to: `/vaults/${vaultId}` });
      setIsNotificationsOpen(false);
    }
  };

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
          <div className="md:hidden flex items-center gap-2">
            <ConnectButton />
            <button
              className={cn('p-2 rounded-full hover:bg-steel-850 transition-colors')}
              aria-label="Toggle mobile menu"
              onClick={toggleMobileMenu}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
          <div className="hidden md:flex items-center flex-1">
            <div className="flex items-center gap-8 ml-[56px]">
              <div>
                <LavaSteelSelect
                  options={currencyOptions}
                  value={selectedCurrency}
                  onChange={val => {
                    updateCurrency(val);
                  }}
                />
              </div>
              {navLinks.map(link => (
                <NavLink key={link.to} to={link.to} label={link.label} onClick={e => handleNavClick(link.to, e)} />
              ))}
            </div>
            <div className="flex-1" />
            {isAuthenticated && (
              <DropdownMenu
                open={isNotificationsOpen}
                onOpenChange={() => {
                  setIsNotificationsOpen(!isNotificationsOpen);
                  readAll();
                }}
              >
                <DropdownMenuTrigger asChild>
                  <button
                    className="p-2 rounded-full hover:bg-steel-850 transition-colors relative mr-2"
                    aria-label="Show notifications"
                  >
                    <Bell className="w-6 h-6" />
                    {unreadCount > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full" />}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[380px] p-4 bg-steel-950 border-0 shadow-xl mt-2 max-h-[500px] overflow-y-auto">
                  <h3 className="font-bold mb-4">Notifications</h3>
                  <div className="flex flex-col gap-2">
                    {fetching && notifications?.length === 0 && <div className="text-dark-100">Loading...</div>}
                    {notifications?.map(n => (
                      <div
                        key={n.id}
                        className="cursor-pointer rounded-xl p-4 bg-steel-900 hover:bg-steel-800 transition"
                        onClick={() => handleNotificationClick(n.data?.vaultId)}
                      >
                        <div className="font-medium text-white">{n.subject || 'No subject'}</div>
                        <div className="text-base text-dark-100">{n.body || 'No message'}</div>
                        <div className="text-sm mt-1 text-dark-100 opacity-70">
                          {new Date(n.createdAt).toLocaleString()}
                        </div>
                      </div>
                    ))}
                    {!fetching && notifications?.length === 0 && (
                      <div className="text-dark-100">No notifications yet</div>
                    )}
                    {hasMore && (
                      <div ref={observerTarget} className="h-10 flex items-center justify-center">
                        {isLoading && <div className="text-dark-100">Loading more...</div>}
                      </div>
                    )}
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
