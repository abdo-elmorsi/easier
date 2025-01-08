module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'next/core-web-vitals', // Add Next.js with core web vitals checks
    'prettier', // Add Prettier for code formatting
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  plugins: ['react', 'jsx-a11y'],
  rules: {
    'react/prop-types': 'off', // Turn off if using TypeScript or PropTypes are not used
    'react/jsx-uses-react': 'off', // Disable as React 17+ and Next.js handle this automatically
    'react/jsx-uses-vars': 'error', // Ensures variables used in JSX are defined
    'react/display-name': 'off', // Avoid noisy display name warnings in certain cases
    'react-hooks/exhaustive-deps': 'warn', // Warn if useEffect/useCallback dependencies are missing
    'jsx-a11y/anchor-is-valid': 'off', // Disabled due to conflict with Next.js Link component
    'no-console': 'warn', // Warn about console logs in production
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }], // Warn about unused variables, ignore underscore-prefixed ones
    'no-undef': 'error', // Throw an error when using an undefined variable or function
    'prettier/prettier': ['warn', { singleQuote: true, trailingComma: 'all' }], // Prettier rules for code style
  },
};
