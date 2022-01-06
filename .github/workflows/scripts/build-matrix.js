const path = require('path');
const fs = require('fs');

const getPossibleAppChanges = (changedFiles) =>
  fs.readdirSync(path.resolve(__dirname, '..', '..', '..', 'src', 'services'))
    .map(service => path.resolve(__dirname, '..', '..', '..', 'src', 'services', service))
    .filter(change =>
      changedFiles.filter(changedFile => changedFile.indexOf(change) === 0).length > 0
    ).map(change => {
    const npmRunner = fs.existsSync(path.resolve(change, 'package.json'));
    const makeRunner = fs.existsSync(path.resolve(change, 'Makefile'));

    const codebasePath = change.replace(path.resolve(__dirname, '..', '..', '..') + '/', "./");

    return {
      name: codebasePath.replace('./src/', '').replace(/\//, '-'),
      codebasePath,
      commandPrefix: makeRunner ? 'make' : npmRunner ? 'npm' : '',
      hasInfrastructure: fs.existsSync(path.resolve(change, 'infrastructure')),
      hasNodeJS: npmRunner,
    };
  });

const shouldRunInfrastructure = (changedFiles) => {
  return changedFiles
    .filter(
      changedFile =>
        changedFile.indexOf(
          path.resolve(__dirname, '..', '..', '..', 'src', 'infrastructure')
        ) === 0 ||
        changedFile.indexOf(`infrastructure${path.sep}account`) !== -1
    ).length > 0
};

const getActualChanges = async ({github, context}) => {
  const [owner, repo] = context.payload.repository.full_name.split('/');
  const pull_number = context.payload.pull_request.number;

  return (await github.rest.pulls.listFiles({owner, repo, pull_number})).data
    .map(file => path.resolve(__dirname, '..', '..', '..', file.filename));
}

module.exports = async ({github, context}) => {
  const changedFiles = await getActualChanges({github, context});
  const possibleAppRuns = getPossibleAppChanges(changedFiles);
  const infrastructure = shouldRunInfrastructure(changedFiles) ? {
    name: 'infrastructure',
    codebasePath: path.resolve(__dirname, '..', '..', '..', 'src/infrastructure'),
    commandPrefix: 'make',
    hasInfrastructure: true,
  } : undefined;

  return {
    infrastructure,
    apps: possibleAppRuns.filter(change => change.name !== 'infrastructure'),
    all: infrastructure ? possibleAppRuns.concat([infrastructure]) : possibleAppRuns,
  };
};
