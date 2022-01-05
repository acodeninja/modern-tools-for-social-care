const path = require('path');
const fs = require('fs');

module.exports = () => new Promise(resolve => {
  const mainInfra = path.resolve(__dirname, '..', '..', '..', 'src', 'infrastructure');

  const services = fs.readdirSync(path.resolve(__dirname, '..', '..', '..', 'src', 'services'))
    .map(service => path.resolve(__dirname, '..', '..', '..', 'src', 'services', service));

  console.log(services);
  resolve();
});
