const fg = require('fast-glob');
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
        hasInfrastructure: fg.sync([`${codebasePath}/**/*.tf`]).length > 0,
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

const without = (source, key) => {
  const destination = Object.assign({}, source);
  delete destination[key];
  return destination;
}

module.exports = async ({context, changes}) => {
  const target = getTarget(context);
  const changedFiles = changes.map(change => path.resolve(__dirname, '..', '..', '..', change));
  const possibleAppRuns = getPossibleAppChanges(changedFiles)
    .map(run => ({
      ...run,
      needsDeployment: !!context.payload.push,
      type: !context.payload.push ? 'Plan' : 'Deploy',
      environments: getEnvironments(context),
    }));

  return {
    test: possibleAppRuns,
    lint: possibleAppRuns,
    build: possibleAppRuns,
    deploy: possibleAppRuns.map(run => run.environments.map(environment => ({...without(run, 'environments'), environment}))).flat(),
    target,
    environments: getEnvironments(context),
    hasRuns: possibleAppRuns.length > 0,
  };
};
