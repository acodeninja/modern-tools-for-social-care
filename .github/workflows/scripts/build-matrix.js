const path = require('path');
const fs = require('fs');

const getPossibleAppChanges = (changedFiles) =>
  fs.readdirSync(path.resolve(__dirname, '..', '..', '..', 'src', 'services'))
    .map(service => path.resolve(__dirname, '..', '..', '..', 'src', 'services', service))
    .filter(change => changedFiles.filter(changedFile => changedFile.indexOf(change) === 0).length > 0)
    .map(change => {
      const npmRunner = fs.existsSync(path.resolve(change, 'package.json'));
      const makeRunner = fs.existsSync(path.resolve(change, 'Makefile'));
      const codebasePath = change.replace(path.resolve(__dirname, '..', '..', '..') + '/', "./");

      return {
        name: codebasePath.replace('./src/', '').replace(/\//, '-'),
        codebasePath,
        commandPrefix: makeRunner ? 'make' : npmRunner ? 'npm' : '',
        hasNodeJS: npmRunner,
      };
    });

const getTarget = (context) => {
  if (context.payload.pull_request) return context.payload.pull_request.base.ref;
  if (context.payload.push) return context.payload.push.ref.split('/').slice(-1)[0];

  return null;
};

const getEnvironments = (context) => {
  switch (getTarget(context)) {
    case 'main':
      return ['Staging', 'Production'];
    case 'dev':
      return ['Testing'];
    case null:
      return null;
  }
};

module.exports = async ({context, changes}) => {
  const target = getTarget(context);
  const changedFiles = changes.map(change => path.resolve(__dirname, '..', '..', '..', change));
  const possibleAppRuns = getPossibleAppChanges(changedFiles)
    .map(run => ({
      ...run,
      target,
      needsDeployment: !!context.payload.push,
      type: !context.payload.push ? 'Plan' : 'Deploy',
      environments: getEnvironments(context),
    }));

  return {
    runs: possibleAppRuns,
    hasRuns: possibleAppRuns.length > 0,
  };
};
