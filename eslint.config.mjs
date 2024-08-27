import globals from 'globals';
import tseslint from 'typescript-eslint';

export default [
  { files: ['src/**/*.{js,ts}'] },
  {
    languageOptions: {
      globals: { ...globals.node },
    },
  },
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-namespace': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
    },
  },
];
