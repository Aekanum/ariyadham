/**
 * SeniorModeToggle Component
 * Story 8.5: Elderly User Accessibility (Senior-Friendly Mode)
 *
 * Toggle component for enabling/disabling senior-friendly mode
 */

'use client';

import { usePreferences } from '@/contexts/PreferencesContext';
import { Button } from '../ui/Button';

export default function SeniorModeToggle() {
  const { preferences, updateSeniorMode, loading } = usePreferences();

  const handleToggle = async () => {
    await updateSeniorMode(!preferences.seniorMode);
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Senior-Friendly Mode
          </h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Optimizes the interface for elderly users with larger text, simplified navigation, high
            contrast colors, and reduced animations.
          </p>

          {/* Feature list */}
          <ul className="mt-4 space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400">✓</span>
              <span>25% larger text for better readability</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400">✓</span>
              <span>High contrast colors</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400">✓</span>
              <span>Larger buttons and touch targets</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400">✓</span>
              <span>Simplified navigation</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400">✓</span>
              <span>Reduced animations</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400">✓</span>
              <span>Increased spacing and line height</span>
            </li>
          </ul>
        </div>

        <div className="ml-6">
          <Button
            onClick={handleToggle}
            variant={preferences.seniorMode ? 'default' : 'outline'}
            isLoading={loading}
            aria-pressed={preferences.seniorMode}
            aria-label={preferences.seniorMode ? 'Disable Senior Mode' : 'Enable Senior Mode'}
          >
            {preferences.seniorMode ? 'Enabled' : 'Enable'}
          </Button>
        </div>
      </div>

      {/* Status message */}
      {preferences.seniorMode && (
        <div
          className="mt-4 rounded-md bg-blue-50 p-4 dark:bg-blue-900/20"
          role="status"
          aria-live="polite"
        >
          <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
            Senior Mode is active. The interface has been optimized for easier reading and
            navigation.
          </p>
        </div>
      )}
    </div>
  );
}
