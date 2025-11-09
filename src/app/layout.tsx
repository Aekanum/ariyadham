import type { Metadata } from 'next';
import '@/styles/globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { PreferencesProvider } from '@/contexts/PreferencesContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import WebVitalsReporter from '@/components/analytics/WebVitalsReporter';

export const metadata: Metadata = {
  title: 'Ariyadham - Buddhist Dharma Platform',
  description:
    'A modern platform for sharing and accessing Buddhist teachings (dharma) with accessibility and inclusivity at the core.',
  keywords: ['Buddhism', 'Dharma', 'Thai', 'English', 'Teachings', 'Learning'],
  authors: [{ name: 'Aekanum' }],
  creator: 'Aekanum',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://ariyadham.com',
    title: 'Ariyadham - Buddhist Dharma Platform',
    description: 'Access Buddhist teachings with modern technology',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Ariyadham',
      },
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <LanguageProvider>
          <ThemeProvider>
            <AuthProvider>
              <PreferencesProvider>
                {children}
                {/* Web Vitals monitoring - Story 7.2 */}
                <WebVitalsReporter debug={process.env.NODE_ENV === 'development'} />
              </PreferencesProvider>
            </AuthProvider>
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
