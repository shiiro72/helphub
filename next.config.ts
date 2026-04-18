import type { NextConfig } from "next";

// @ts-ignore
const { i18n } = require('./next-i18next.config');

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  i18n,
};

export default nextConfig;
