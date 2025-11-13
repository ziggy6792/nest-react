const swcDefaultConfig = require('@nestjs/cli/lib/compiler/defaults/swc-defaults').swcDefaultsFactory().swcOptions;

module.exports = function (options, webpack) {
  return {
    ...options,
    externals: [],
    module: {
      ...options.module,
      rules: [
        {
          test: /\.ts$/,
          exclude: /node_modules/,
          use: {
            loader: 'swc-loader',
            options: swcDefaultConfig,
          },
        },
        {
          test: /\.mjs$/,
          include: /node_modules\/@orpc/,
          type: 'javascript/auto',
          resolve: {
            fullySpecified: false,
          },
        },
      ],
    },
    resolve: {
      ...options.resolve,
      extensionAlias: {
        '.js': ['.ts', '.js'],
      },
    },
  };
};


