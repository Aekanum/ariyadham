/**
 * useCopyToClipboard Hook
 *
 * Hook to copy text to clipboard with success/error state
 */

import { useState, useCallback } from 'react';

interface CopyState {
  value: string | null;
  success: boolean;
  error: Error | null;
}

/**
 * Hook to copy text to clipboard
 *
 * @returns Tuple of [copyState, copyToClipboard]
 *
 * @example
 * const [copyState, copyToClipboard] = useCopyToClipboard();
 *
 * <button onClick={() => copyToClipboard('Text to copy')}>
 *   {copyState.success ? 'Copied!' : 'Copy'}
 * </button>
 */
export function useCopyToClipboard(): [CopyState, (text: string) => Promise<void>] {
  const [state, setState] = useState<CopyState>({
    value: null,
    success: false,
    error: null,
  });

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      // Modern clipboard API
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        setState({ value: text, success: true, error: null });
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        const successful = document.execCommand('copy');
        textArea.remove();

        if (successful) {
          setState({ value: text, success: true, error: null });
        } else {
          throw new Error('Failed to copy text');
        }
      }

      // Reset success state after 2 seconds
      setTimeout(() => {
        setState((prev: CopyState) => ({ ...prev, success: false }));
      }, 2000);
    } catch (error) {
      setState({
        value: null,
        success: false,
        error: error as Error,
      });
    }
  }, []);

  return [state, copyToClipboard];
}
