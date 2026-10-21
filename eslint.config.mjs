import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      '.next/**',
      'coverage/**',
      'node_modules/**',
      'playwright-report/**',
      'src/generated/**',
      'storybook-static/**',
      'test-results/**',
    ],
  },
  ...tseslint.configs.recommended,
);
