import nextPlugin from 'eslint-config-next';

const eslintConfig = [
  {
    ignores: [
      '.next/**',
      'out/**',
      'build/**',
      'next-env.d.ts',
      'node_modules/**',
      '.claude/**',
      'bmad/**',
      'docs/**',
      'migrations/**',
    ],
  },
  ...nextPlugin,
];

export default eslintConfig;
