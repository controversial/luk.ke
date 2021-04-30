const path = require('path');

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  reactStrictMode: true,
  sassOptions: {
    includePaths: [path.join(__dirname, 'src')],
  },
  images: {
    loader: 'imgix',
    path: 'https://images.prismic.io/luke/',
  },

  future: { webpack5: true },
  webpack: (config) => {
    config.module.rules.push({
      test: require.resolve('./src/components/MobileLayout/sequences.js'),
      use: { loader: 'val-loader' },
    });
    return config;
  },
});
