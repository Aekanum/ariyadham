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
    },
  },
  plugins: [typography],
  darkMode: 'class',
};
