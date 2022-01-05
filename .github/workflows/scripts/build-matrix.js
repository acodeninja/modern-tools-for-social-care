const path = require('path');
const fs = require('fs');

module.exports = async ({github, context}) => {
  const possibleChanges = [path.resolve(__dirname, '..', '..', '..', 'src', 'infrastructure')] +
    fs.readdirSync(path.resolve(__dirname, '..', '..', '..', 'src', 'services'))
      .map(service => path.resolve(__dirname, '..', '..', '..', 'src', 'services', service));

  const [owner, repo] = context.payload.repository.full_name.split('/');
  const pull_number = context.payload.pull_request.number;

  const actualChanges = github.rest.pulls.listFiles({
    owner,
    repo,
    pull_number,
  });

  console.log(possibleChanges, actualChanges);
};
