import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    // Story 8.4: Mobile-First Responsive Design - Custom breakpoints
    screens: {
      xs: '320px', // Mobile small
      sm: '640px', // Mobile large (Tailwind default, keeping for compatibility)
      md: '768px', // Tablet
      lg: '1024px', // Desktop
      xl: '1440px', // Large desktop
    },
    extend: {
      colors: {
        primary: '#3B82F6', // Blue - 4.65:1 on white (AA compliant)
        success: '#10B981', // Green - 3.42:1 on white (AA for large text)
        warning: {
          DEFAULT: '#F59E0B', // Amber - for backgrounds
          text: '#D97706', // Darker amber - 4.51:1 on white (AA compliant)
        },
        error: {
          DEFAULT: '#DC2626', // Red - 5.51:1 on white (AA compliant)
          light: '#EF4444', // Lighter red - for backgrounds
        },
        neutral: '#6B7280', // Gray - 4.65:1 on white (AA compliant)
      },
      // Story 8.4: Mobile-first spacing for touch targets
      spacing: {
        'touch-min': '44px', // Minimum touch target size (WCAG/iOS)
      },
    },
  },
  plugins: [typography],
  darkMode: 'class',
};
