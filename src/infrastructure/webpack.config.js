const {resolve} = require('path');

module.exports = [{
  entry: './lambda-authorizer.ts',
  target: 'node',
  devtool: 'source-map',
  externals: {
    'aws-crt': 'aws-crt',
  },
  module: {
    rules: [
      {test: /\.ts$/, use: 'ts-loader'},
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    path: resolve(__dirname, 'build', 'lambda-authorizer'),
    filename: 'lambda-authorizer.js',
    libraryTarget: "commonjs",
  }
}];
