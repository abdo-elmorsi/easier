const path = require('path');

module.exports = {
  i18n: {
    defaultLocale: 'ar',
    locales: ['ar', 'en'],
    localeDetection: false,
  },
  localePath: path.resolve("./public/locales"),

  // Optional: Add a fallback to default locale in case a translation is missing
  fallbackLng: 'ar',

  // Optional: Add configuration for interpolation
  interpolation: {
    escapeValue: false, // React already does escaping
  },

  // Optional: Add debug option for development
  // debug: process.env.NODE_ENV === 'development',
};
