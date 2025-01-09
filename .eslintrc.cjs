module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true, // Added for Node.js support since Prisma may require it
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'next/core-web-vitals', // Next.js core web vitals checks
    'prettier', // Prettier for consistent code formatting
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
  },
  settings: {
    react: {
      version: 'detect', // Automatically detect the React version
    },
  },
  plugins: ['react', 'jsx-a11y', 'prettier'], // Added Prettier as a plugin
  rules: {
    'react/prop-types': 'off', // Turn off PropTypes if using TypeScript
    'react/jsx-uses-react': 'off', // Disable as React 17+ and Next.js manage this automatically
    'react/jsx-uses-vars': 'error', // Ensure variables used in JSX are defined
    'react/display-name': 'off', // Avoid display name warnings
    'react-hooks/exhaustive-deps': 'warn', // Warn about missing dependencies in hooks
    'jsx-a11y/anchor-is-valid': 'off', // Disabled due to Next.js Link component conflicts
    'no-console': 'warn', // Warn about console logs
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }], // Ignore underscore-prefixed unused variables
    'no-undef': 'error', // Error on undefined variables
    'prettier/prettier': ['warn', { singleQuote: true, trailingComma: 'all' }], // Prettier rules for consistent formatting
  },
};
