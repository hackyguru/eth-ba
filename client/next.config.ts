import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    // Polyfills for Waku and Web3 libraries
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
      stream: false,
      assert: false,
      http: false,
      https: false,
      os: false,
      url: false,
      zlib: false,
      path: false,
    };

    // Ignore Solana dependencies from Privy since we only use EVM (Oasis)
    config.resolve.alias = {
      ...config.resolve.alias,
      '@solana-program/system': false,
    };

    return config;
  },
};

export default nextConfig;
