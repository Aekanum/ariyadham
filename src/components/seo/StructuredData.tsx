'use client';

/**
 * StructuredData Component
 * Renders JSON-LD structured data in the document head
 * Avoids the Next.js error about sync/defer scripts outside main document
 */

import { useEffect } from 'react';

interface StructuredDataProps {
  data: Record<string, any>;
  type?: string;
}

export function StructuredData({ data, type = 'application/ld+json' }: StructuredDataProps) {
  useEffect(() => {
    // Create and inject script into the document head
    const script = document.createElement('script');
    script.type = type;
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);

    // Cleanup: remove script on unmount
    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [data, type]);

  // Return nothing - the script is injected directly into the DOM
  return null;
}

export default StructuredData;
