/**
 * MobileMenu Component
 * Story 8.4: Mobile-First Responsive Design
 * Story 8.5: Elderly User Accessibility (Senior-Friendly Mode)
 *
 * Full-screen mobile navigation overlay with touch-friendly targets
 * Simplified navigation in senior mode
 */

'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Home, BookOpen, Search, User, Settings } from 'lucide-react';
import { useSeniorMode } from '@/hooks/useSeniorMode';
import { useTranslation } from '@/contexts/LanguageContext';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Navigation items with icons for mobile menu
 * Story 8.5: senior property indicates if item is essential for senior mode
 */
const navigationItems = [
  { href: '/', labelKey: 'nav.home', icon: Home, essential: true },
  { href: '/articles', labelKey: 'nav.articles', icon: BookOpen, essential: true },
  { href: '/search', labelKey: 'nav.search', icon: Search, essential: true },
  { href: '/reader/bookmarks', labelKey: 'nav.bookmarks', icon: User, essential: false }, // Hidden in senior mode
  { href: '/settings', labelKey: 'nav.settings', icon: Settings, essential: true },
];

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const isSeniorMode = useSeniorMode(); // Story 8.5
  const { t } = useTranslation('common');

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen]);

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 lg:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Mobile Menu Panel */}
      <nav
        id="mobile-menu"
        className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-white shadow-xl dark:bg-gray-900 lg:hidden"
        role="navigation"
        aria-label="Mobile navigation"
      >
        <div className="flex h-full flex-col">
          {/* Menu Header */}
          <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('nav.menu')}</h2>
          </div>

          {/* Navigation Items - Story 8.4: Touch-friendly spacing, Story 8.5: Simplified in senior mode */}
          <div className="flex-1 overflow-y-auto px-4 py-6">
            <ul className="space-y-2">
              {navigationItems
                .filter((item) => !isSeniorMode || item.essential) // Story 8.5: Hide non-essential items in senior mode
                .map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className="flex items-center gap-4 rounded-lg px-4 py-3 text-base font-medium text-gray-700 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary dark:text-gray-300 dark:hover:bg-gray-800 min-h-touch-min"
                      >
                        <Icon className="h-5 w-5" aria-hidden="true" />
                        <span>{t(item.labelKey)}</span>
                      </Link>
                    </li>
                  );
                })}
            </ul>
          </div>

          {/* Menu Footer */}
          <div className="border-t border-gray-200 px-6 py-4 dark:border-gray-800">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              © 2025 {t('app.name')}. {t('app.tagline')}
            </p>
          </div>
        </div>
      </nav>
    </>
  );
}
