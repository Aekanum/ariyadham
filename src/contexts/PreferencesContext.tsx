'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

interface Preferences {
  fontSize: number;
  language: 'en' | 'th';
  accessibilityMode: boolean;
}

interface PreferencesContextType {
  preferences: Preferences;
  updateFontSize: (size: number) => Promise<void>;
  updateLanguage: (lang: 'en' | 'th') => Promise<void>;
  updateAccessibilityMode: (enabled: boolean) => Promise<void>;
  loading: boolean;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

const DEFAULT_PREFERENCES: Preferences = {
  fontSize: 16,
  language: 'en',
  accessibilityMode: false,
};

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<Preferences>(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(false);

  // Load preferences on mount and when user changes
  useEffect(() => {
    if (user) {
      setPreferences({
        fontSize: user.reading_font_size,
        language: user.language_preference,
        accessibilityMode: user.accessibility_mode,
      });
    } else {
      // Load from localStorage if not logged in
      const stored = localStorage.getItem('preferences');
      if (stored) {
        try {
          setPreferences(JSON.parse(stored));
        } catch {
          // Ignore invalid localStorage data
        }
      }
    }
  }, [user]);

  // Apply font size to document
  useEffect(() => {
    document.documentElement.style.setProperty('--base-font-size', `${preferences.fontSize}px`);
    localStorage.setItem('preferences', JSON.stringify(preferences));
  }, [preferences]);

  const updatePreference = async (key: keyof Preferences, value: unknown) => {
    setLoading(true);
    try {
      // Update local state immediately
      setPreferences((prev) => ({ ...prev, [key]: value }));

      // Update server if logged in
      if (user) {
        const response = await fetch('/api/preferences', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ [key]: value }),
        });

        if (!response.ok) {
          throw new Error('Failed to update preferences');
        }
      }
    } catch (error) {
      console.error('Failed to update preference:', error);
      // Revert on error
      if (user) {
        setPreferences({
          fontSize: user.reading_font_size,
          language: user.language_preference,
          accessibilityMode: user.accessibility_mode,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const updateFontSize = (size: number) => updatePreference('fontSize', size);
  const updateLanguage = (lang: 'en' | 'th') => updatePreference('language', lang);
  const updateAccessibilityMode = (enabled: boolean) =>
    updatePreference('accessibilityMode', enabled);

  return (
    <PreferencesContext.Provider
      value={{
        preferences,
        updateFontSize,
        updateLanguage,
        updateAccessibilityMode,
        loading,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('usePreferences must be used within PreferencesProvider');
  }
  return context;
}
