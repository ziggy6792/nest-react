const swcDefaultConfig = require('@nestjs/cli/lib/compiler/defaults/swc-defaults').swcDefaultsFactory().swcOptions;

module.exports = function (options, webpack) {
  return {
    ...options,
    externalsPresets: {
      node: true, // Externalize Node.js built-ins
    },
    externals: [
      // Externalize all node_modules, but bundle @orpc packages and their ESM dependencies
      function ({ request, context }, callback) {
        if (request && !request.startsWith('.') && !request.startsWith('/')) {
          // Bundle @orpc packages (ESM-only)
          if (request.startsWith('@orpc/')) {
            return callback();
          }
          // Bundle arktype and drizzle-arktype (ESM-only)
          if (request === 'arktype' || request === 'drizzle-arktype' || request.startsWith('@ark/') || request.startsWith('ark')) {
            return callback();
          }
          // Bundle dependencies imported from @orpc packages (like rou3)
          if (context && typeof context === 'string' && context.includes('@orpc')) {
            return callback();
          }
          // Bundle dependencies imported from arktype-related packages
          if (context && typeof context === 'string' && (context.includes('arktype') || context.includes('@ark') || context.includes('arkregex'))) {
            return callback();
          }
          // Externalize everything else
          return callback(null, `commonjs ${request}`);
        }
        callback();
      },
    ],
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
          include: /node_modules\/(@orpc|arktype|drizzle-arktype|@ark)/,
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


