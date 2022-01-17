const {resolve} = require('path');
const {BannerPlugin} = require('webpack');
const path = require("path");
const fs = require("fs");

class MakeOutputExecutablePlugin {
  apply(compiler) {
    compiler.hooks.done.tap('MakeOutputExecutablePlugin', async (compilation) => {
      const outputPath = path.resolve(
        compilation.compilation.outputOptions.path,
        compilation.compilation.outputOptions.filename,
      );

      fs.chmodSync(outputPath, 0o777);
      console.log(outputPath)
    });
  }
}

module.exports = {
  entry: './src/main.tsx',
  target: 'node',
  devtool: 'source-map',
  module: {
    rules: [
      {test: /\.ts?x$/, use: 'ts-loader'},
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  plugins: [
    new BannerPlugin({banner: "#!/usr/bin/env node", raw: true}),
    new MakeOutputExecutablePlugin(),
  ],
  ignoreWarnings: [{
    module: /node_modules\/yargs/,
  }, {
    module: /node_modules\/ws\/lib\/buffer-util/
  }, {
    module: /node_modules\/ws\/lib\/validation/
  }],
  output: {
    filename: 'mtsc',
    path: resolve(__dirname, '..', '..', '..', '.bin'),
    libraryTarget: "commonjs",
  }
};
