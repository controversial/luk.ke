module.exports = {
  webpack: (config, { defaultLoaders }) => {
    config.module.rules.push({
      test: /\.sass$/,
      use: [
        defaultLoaders.babel,
        {
          loader: require('styled-jsx/webpack').loader,
          options: {
            type: (fileName, options) => options.query.type || 'scoped',
          },
        },
      ],
    });

    return config;
  },
};
