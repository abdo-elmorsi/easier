const il8nextConfig = require("./next-i18next.config");

/** @type {import('next').NextConfig} */

const withPWA = require('next-pwa')({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development'
})

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  i18n: il8nextConfig.i18n,
  images: {
    domains: [
      "res.cloudinary.com"
    ],
  },
  productionBrowserSourceMaps: true, // Enable source maps in production


}
module.exports = withPWA(nextConfig)