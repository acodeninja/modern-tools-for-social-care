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
  if (context.eventName === 'pull_request') return context.payload.pull_request.base.ref;
  if (context.eventName === 'push') return context.ref.split('/').slice(-1)[0];

  return null;
};

const getEnvironments = (context) => {
  switch (getTarget(context)) {
    case 'main':
      return ['Staging', 'Production'];
    case 'dev':
      return ['Testing'];
    case null:
      return [];
  }
};

const without = (source, key) => {
  const destination = Object.assign({}, source);
  delete destination[key];
  return destination;
}

module.exports = async ({context, changes}) => {
  console.log(`Building change list for target ${getTarget(context)} on ${getEnvironments(context)}`);

  if (changes.filter(change => change.indexOf('src/framework/service') === 0).length > 0) {
    fs.readdirSync(path.resolve(__dirname, '..', '..', '..', 'src', 'services'))
      .forEach(service => {
        changes.push(`src/services/${service}`);
      });
  }

  if (changes.filter(change => change.indexOf('environments/') === 0).length > 0) {
    fs.readdirSync(path.resolve(__dirname, '..', '..', '..', 'src', 'services'))
      .forEach(service => {
        changes.push(`src/services/${service}`);
      });
  }

  if (changes.filter(change => change.indexOf('.github') === 0).length > 0) {
    fs.readdirSync(path.resolve(__dirname, '..', '..', '..', 'src', 'services'))
      .forEach(service => {
        changes.push(`src/services/${service}`);
      });
  }

  const target = getTarget(context);
  const changedFiles = changes.map(change => path.resolve(__dirname, '..', '..', '..', change));
  const possibleAppRuns = getPossibleAppChanges(changedFiles)
    .map(run => ({
      ...run,
      type: context.eventName === 'push' ? 'Deploy' : 'Plan',
      environments: getEnvironments(context),
    }));

  return {
    test: possibleAppRuns,
    lint: possibleAppRuns,
    build: possibleAppRuns,
    deploy: possibleAppRuns.map(run =>
      run.environments.map(environment => ({...without(run, 'environments'), environment}))
    ).flat(),
    target,
    needsDeployment: context.eventName === 'push',
    environments: getEnvironments(context),
    hasRuns: possibleAppRuns.length > 0,
  };
};
