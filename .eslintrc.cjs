module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react/jsx-runtime",
    "plugin:jsx-a11y/recommended",
    "next/core-web-vitals",
    "plugin:prettier/recommended", // ✅ Ensures Prettier runs correctly
  ],
  ignorePatterns: ["dist", ".eslintrc.cjs"],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: "module",
  },
  settings: {
    react: {
      version: "detect",
    },
  },
  plugins: ["react", "jsx-a11y", "prettier"],
  rules: {
    "react/prop-types": "warn",
    "react/jsx-uses-react": "off",
    "react/jsx-uses-vars": "error",
    "react/display-name": "off",
    "react-hooks/exhaustive-deps": "warn",
    "jsx-a11y/anchor-is-valid": "off",
    "no-console": "warn",
    "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    "no-undef": "error",
    "prettier/prettier": ["warn", { singleQuote: true, trailingComma: "all" }],
  },
};
