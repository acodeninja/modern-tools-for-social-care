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
  const possibleChanges = getPossibleChanges();
  const actualChanges = await getActualChanges({github, context});

  console.log(possibleChanges, actualChanges);
};
