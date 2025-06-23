const path = require('path');

module.exports = {
  entry: './src/index.ts',
  output: {
    filename: 'neat.js',
    path: path.resolve(__dirname, 'dist'),
    library: 'NEAT',
    libraryTarget: 'umd',
    globalObject: 'this',
  },
  resolve: {
    extensions: ['.ts', '.js'],
    extensionAlias: {
      '.js': ['.ts', '.js'],
    },
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [{
          loader: 'ts-loader',
          options: {
            compilerOptions: {
              module: 'ESNext',
            },
          },
        }],
        exclude: /node_modules/,
      },
    ],
  },
  optimization: {
    minimize: true,
  },
};
