/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  
  experimental: {
    serverActions: {
      bodySizeLimit: '30mb', // increase limit (supports 'kb', 'mb', 'gb')
    },
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
        port: '',
        pathname: '/**',
      }
    ],
  },
  webpack: (config) => {
    config.ignoreWarnings = [
      { module: /handlebars/ },
    ];
    return config;
  },
};

export default nextConfig;
