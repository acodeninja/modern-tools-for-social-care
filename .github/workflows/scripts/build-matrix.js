const path = require('path');
const fs = require('fs');

const getPossibleChanges = () => [
  path.resolve(__dirname, '..', '..', '..', 'src', 'infrastructure'),
  fs.readdirSync(path.resolve(__dirname, '..', '..', '..', 'src', 'services'))
    .map(service => path.resolve(__dirname, '..', '..', '..', 'src', 'services', service)),
].flat();

const getActualChanges = async ({github, context}) => {
  const [owner, repo] = context.payload.repository.full_name.split('/');
  const pull_number = context.payload.pull_request.number;

  return (await github.rest.pulls.listFiles({owner, repo, pull_number})).data
    .map(file => path.resolve(__dirname, '..', '..', '..', file.filename));
}

module.exports = async ({github, context}) => {
  const possibleRuns = getPossibleChanges();
  const changedFiles = await getActualChanges({github, context});

  const runnableChanges = possibleRuns.filter(change =>
    changedFiles.filter(changedFile => changedFile.indexOf(change) === 0).length > 0
  );

  console.log(runnableChanges, possibleRuns, changedFiles);
};
