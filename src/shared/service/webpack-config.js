const {basename, resolve} = require('path');
const {opendir} = require('fs/promises');

module.exports = async (env) => {
  const {rootDir} = env;
  const entryPoints = (await Promise.all(
    ['views', 'actions', 'subscribers', 'events', 'components']
      .map(type => new Promise((r) => {
        opendir(resolve(rootDir, type))
          .then(async (dir) => {
            const entries = [];

            for await (const file of dir) {
              if (file.name.endsWith('.ts') && !file.name.endsWith('.test.ts')) {
                entries.push(`${dir.path}/${file.name}`);
              }
            }

            r({type, entries});
          })
      })),
  )).map(entrySet => entrySet.entries.map(entry => ({
      entry,
      target: 'node',
      devtool: 'source-map',
      module: {
        rules: [
          {test: /\.ts$/, use: 'ts-loader'},
        ],
      },
      resolve: {
        extensions: ['.ts', '.js'],
      },
      output: {
        filename: basename(entry, '.ts') + '.js',
        path: resolve(rootDir, 'build', entrySet.type),
      }
    }))).flat();

  console.log(JSON.stringify(entryPoints, null, 2));
  return entryPoints;
};
