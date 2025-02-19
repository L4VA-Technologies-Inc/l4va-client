import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';

const socialLinks = [
  { name: 'X (Twitter)', icon: '/assets/social/footer/x.png', url: 'https://x.com' },
  { name: 'Telegram', icon: '/assets/social/footer/telegram.png', url: 'https://telegram.org' },
  { name: 'Medium', icon: '/assets/social/footer/medium.png', url: 'https://medium.com' },
  { name: 'Discord', icon: '/assets/social/footer/discord.png', url: 'https://discord.com' },
  { name: 'LinkedIn', icon: '/assets/social/footer/linkedin.png', url: 'https://linkedin.com' },
  { name: 'Instagram', icon: '/assets/social/footer/instagram.png', url: 'https://instagram.com' },
  { name: 'Facebook', icon: '/assets/social/footer/facebook.png', url: 'https://facebook.com' },
];

const navLinks = [
  { href: '/create', label: 'Create' },
  { href: '/contribute', label: 'Contribute' },
  { href: '/invest', label: 'Invest' },
  { href: '/how-it-works', label: 'How it works' },
  { href: '/about-us', label: 'About us' },
  { href: '/social-media', label: 'Social media' },
  { href: '/terms-of-service', label: 'Terms of Service' },
  { href: '/privacy-policy', label: 'Privacy Policy' },
];

export const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };
  return (
    <div className="relative py-16">
      <div
        className="absolute inset-0 -z-10 bg-cover bg-center bg-no-repeat h-[670px]"
        style={{ backgroundImage: 'url(/assets/footer-bg.png)' }}
      />
      <div className="container mx-auto">
        <div className="flex items-center flex-col mb-[60px]">
          <h2 className="text-primary-text text-[24px] font-russo font-bold mb-16">
            FIND US ON SOCIAL
          </h2>
          <div className="flex justify-center items-center gap-8">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                aria-label={`Visit our ${social.name} page`}
                className="transition-transform hover:scale-110"
                href={social.url}
                rel="noopener noreferrer"
                target="_blank"
              >
                <img
                  alt={`${social.name} icon`}
                  className="w-[60px] h-[60px]"
                  src={social.icon}
                />
              </a>
            ))}
          </div>
        </div>
        <div className="flex justify-center mb-8">
          <Link to="/">
            <img alt="L4VA Logo" className="w-[210px]" src="/assets/logo.webp"/>
          </Link>
        </div>
        <div className="flex items-center justify-center space-x-8 mb-16">
          {navLinks.map((link) => (
            <a
              key={link.href}
              className="font-bold hover:text-main-red transition-colors whitespace-nowrap text-lg"
              href={link.href}
            >
              {link.label}
            </a>
          ))}
        </div>
        <p className="text-center text-sm text-dark-100 pb-6">
          Copyright © {new Date().getFullYear()}. All Rights Reserved by L4VA
        </p>
        <button
          aria-label="Scroll to top"
          className="cursor-pointer absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center hover:opacity-80 transition-opacity"
          type="button"
          onClick={scrollToTop}
        >
          <ChevronDown className="rotate-180" size={24} />
        </button>
      </div>
    </div>
  );
};
