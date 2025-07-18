import { Link } from '@tanstack/react-router';
import React, { useCallback } from 'react';
import { ChevronDown } from 'lucide-react';

import { useAuth } from '@/lib/auth/auth';
import { useModalControls } from '@/lib/modals/modal.context';
import L4vaIcon from '@/icons/l4va.svg?react';
import XIcon from '@/icons/x.svg?react';
import MediumIcon from '@/icons/medium.svg?react';
import DiscordIcon from '@/icons/discord.svg?react';
import YouTubeIcon from '@/icons/youtube.svg?react';

const socialLinks = [
  { name: 'X (Twitter)', icon: XIcon, url: 'https://x.com/lava_protocol' },
  { name: 'Medium', icon: MediumIcon, url: 'https://l4va.medium.com' },
  { name: 'Discord', icon: DiscordIcon, url: 'https://discord.com/invite/mBbTUfAzuS' },
  { name: 'YouTube', icon: YouTubeIcon, url: 'https://www.youtube.com/@_L4VA_' },
];

const navLinks = [
  { to: '/create', label: 'Create' },
  { to: '/vaults?tab=contribute', label: 'Contribute' },
  { to: '/vaults?tab=acquire', label: 'Acquire' },
  { to: '/how-it-works', label: 'How it works' },
  { to: '/about-us', label: 'About us' },
  { to: '/social-media', label: 'Social media' },
  { to: '/terms-of-service', label: 'Terms of Service' },
  { to: '/privacy-policy', label: 'Privacy Policy' },
];

// Memoized NavLink for performance - matching Header pattern
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

export const Footer = () => {
  const { isAuthenticated } = useAuth();
  const { openModal } = useModalControls();

  const handleNavClick = useCallback(
    (to, e) => {
      if (!isAuthenticated) {
        e.preventDefault();
        openModal('LoginModal');
      }
    },
    [isAuthenticated, openModal]
  );

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <div className="container mx-auto px-4 xl:px-0">
      <div className="flex items-center flex-col mb-8 md:mb-16">
        <h2 className="text-primary-text text-xl md:text-2xl font-russo font-bold mb-8 md:mb-16">FIND US ON SOCIAL</h2>
        <div className="flex flex-wrap justify-center items-center gap-4 md:gap-16">
          {socialLinks.map(social => {
            const IconComponent = social.icon;
            return (
              <a
                key={social.name}
                aria-label={`Visit our ${social.name} page`}
                className="transition-transform hover:scale-110"
                href={social.url}
                rel="noopener noreferrer"
                target="_blank"
              >
                <IconComponent className="w-6 h-6" />
              </a>
            );
          })}
        </div>
      </div>
      <div className="grid grid-cols-2 md:flex md:flex-row md:justify-center gap-4 md:gap-8 mb-8 md:mb-16">
        {navLinks.map(link => (
          <NavLink key={link.to} to={link.to} label={link.label} onClick={e => handleNavClick(link.to, e)} />
        ))}
      </div>
      <div className="flex justify-center mb-8">
        <Link to="/" className="flex items-center gap-2 active" data-status="active" aria-current="page">
          <L4vaIcon className="flex-shrink-0" style={{ width: '48px', height: '48px' }} />
          <span className="text-4xl font-bold uppercase">L4VA</span>
        </Link>
      </div>
      <p className="text-center text-dark-100 pb-6">
        Copyright © {new Date().getFullYear()}. All Rights Reserved by L4VA
      </p>
      <button
        aria-label="Scroll to top"
        className="cursor-pointer absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center hover:opacity-80 transition-opacity"
        type="button"
        onClick={scrollToTop}
      >
        <ChevronDown className="rotate-180" size={24} />
      </button>
    </div>
  );
};
