'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { usePreferences } from '@/contexts/PreferencesContext';
import { useState } from 'react';
import SeniorModeToggle from '@/components/accessibility/SeniorModeToggle'; // Story 8.5

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { preferences, updateFontSize, updateLanguage, updateAccessibilityMode, loading } =
    usePreferences();
  const [saveMessage, setSaveMessage] = useState('');

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    showSaveMessage('Theme updated');
  };

  const handleFontSizeChange = async (size: number) => {
    await updateFontSize(size);
    showSaveMessage('Font size updated');
  };

  const handleLanguageChange = async (lang: 'en' | 'th') => {
    await updateLanguage(lang);
    showSaveMessage('Language updated');
  };

  const handleAccessibilityToggle = async (enabled: boolean) => {
    await updateAccessibilityMode(enabled);
    showSaveMessage('Accessibility mode updated');
  };

  const showSaveMessage = (message: string) => {
    setSaveMessage(message);
    setTimeout(() => setSaveMessage(''), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 dark:bg-gray-900">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Customize your reading experience</p>
        </div>

        {/* Save Message */}
        {saveMessage && (
          <div className="mb-6 rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
            <p className="text-sm text-green-800 dark:text-green-200">{saveMessage}</p>
          </div>
        )}

        <div className="space-y-6">
          {/* Theme Section */}
          <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Appearance</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Theme
                </label>
                <div className="mt-2 grid grid-cols-3 gap-3">
                  {(['light', 'dark', 'system'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => handleThemeChange(t)}
                      className={`rounded-lg border-2 p-3 text-sm font-medium transition-colors ${
                        theme === t
                          ? 'border-blue-600 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-900/20 dark:text-blue-300'
                          : 'border-gray-300 text-gray-700 hover:border-gray-400 dark:border-gray-600 dark:text-gray-300 dark:hover:border-gray-500'
                      }`}
                    >
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Reading Preferences */}
          <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Reading Preferences
            </h2>

            <div className="space-y-6">
              {/* Font Size */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Font Size: {preferences.fontSize}px
                </label>
                <input
                  type="range"
                  min="12"
                  max="24"
                  value={preferences.fontSize}
                  onChange={(e) => handleFontSizeChange(Number(e.target.value))}
                  disabled={loading}
                  className="mt-2 w-full accent-blue-600"
                />
                <div className="mt-2 flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>Smaller</span>
                  <span>Larger</span>
                </div>
              </div>

              {/* Language */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Language
                </label>
                <div className="mt-2 grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleLanguageChange('en')}
                    disabled={loading}
                    className={`rounded-lg border-2 p-3 text-sm font-medium transition-colors ${
                      preferences.language === 'en'
                        ? 'border-blue-600 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-900/20 dark:text-blue-300'
                        : 'border-gray-300 text-gray-700 hover:border-gray-400 dark:border-gray-600 dark:text-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => handleLanguageChange('th')}
                    disabled={loading}
                    className={`rounded-lg border-2 p-3 text-sm font-medium transition-colors ${
                      preferences.language === 'th'
                        ? 'border-blue-600 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-900/20 dark:text-blue-300'
                        : 'border-gray-300 text-gray-700 hover:border-gray-400 dark:border-gray-600 dark:text-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    ไทย (Thai)
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Accessibility */}
          <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Accessibility
            </h2>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Accessibility Mode
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Enhanced features for better readability
                </p>
              </div>
              <button
                onClick={() => handleAccessibilityToggle(!preferences.accessibilityMode)}
                disabled={loading}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preferences.accessibilityMode ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferences.accessibilityMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Story 8.5: Senior-Friendly Mode */}
          <SeniorModeToggle />
        </div>
      </div>
    </div>
  );
}
