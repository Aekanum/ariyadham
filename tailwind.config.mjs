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
        primary: '#3B82F6', // Blue
        success: '#10B981', // Green
        warning: '#F59E0B', // Amber
        error: '#EF4444', // Red
        neutral: '#6B7280', // Gray
      },
    },
  },
  plugins: [typography],
  darkMode: 'class',
};
