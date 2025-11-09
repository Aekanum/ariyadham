/**
 * Header Component
 * Story 8.4: Mobile-First Responsive Design
 *
 * Responsive header with mobile navigation and desktop menu
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { useTranslation } from '@/contexts/LanguageContext';
import { Menu, X } from 'lucide-react';
import MobileMenu from './MobileMenu';
import LanguageSwitcher from './LanguageSwitcher';

interface HeaderProps {
  className?: string;
}

export default function Header({ className = '' }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isDesktop } = useBreakpoint();
  const { t } = useTranslation('common');

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 ${className}`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white"
          >
            <span className="text-2xl" role="img" aria-label="lotus">
              🪷
            </span>
            <span className="hidden sm:inline">Ariyadham</span>
          </Link>

          {/* Desktop Navigation */}
          {isDesktop && (
            <nav className="hidden lg:flex lg:items-center lg:gap-6" role="navigation">
              <Link
                href="/articles"
                className="text-gray-700 transition-colors hover:text-primary dark:text-gray-300 dark:hover:text-primary"
              >
                {t('nav.articles')}
              </Link>
              <Link
                href="/categories/meditation"
                className="text-gray-700 transition-colors hover:text-primary dark:text-gray-300 dark:hover:text-primary"
              >
                {t('nav.meditation')}
              </Link>
              <Link
                href="/categories/dharma"
                className="text-gray-700 transition-colors hover:text-primary dark:text-gray-300 dark:hover:text-primary"
              >
                {t('nav.dharma')}
              </Link>
              <Link
                href="/search"
                className="text-gray-700 transition-colors hover:text-primary dark:text-gray-300 dark:hover:text-primary"
              >
                {t('nav.search')}
              </Link>
            </nav>
          )}

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            {/* Language switcher - visible on all sizes */}
            <LanguageSwitcher />

            {/* Mobile menu button - Story 8.4: Touch-friendly 44x44px */}
            <button
              type="button"
              onClick={toggleMobileMenu}
              className="lg:hidden inline-flex h-touch-min w-touch-min items-center justify-center rounded-lg text-gray-700 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary dark:text-gray-300 dark:hover:bg-gray-800"
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <MobileMenu isOpen={isMobileMenuOpen} onClose={closeMobileMenu} />
    </>
  );
}
