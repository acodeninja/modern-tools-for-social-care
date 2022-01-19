const {request} = require('http');
const faker = require('faker');

const port = parseInt(process.argv.slice(-2, -1).join(''));
const number = parseInt(process.argv.slice(-1).join(''));

if (isNaN(port))
  throw 'Must provide a port: node search.seed.js <PORT> <NUMBER>';

if (isNaN(number))
  throw 'Must provide a number of records: node search.seed.js <PORT> <NUMBER>';

const runRequest = (index, items) => new Promise(resolve => {
  const data = JSON.stringify({
    index,
    items,
  });

  console.log(`Sending to index ${index}`, JSON.stringify(items, null, 2));

  const req = request({
    hostname: 'localhost',
    port,
    path: '/',
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  }, res => {
    res.on('data', d => {
      process.stdout.write(d);
    });

    res.on('end', () => {
      console.log(`Sent ${items.length} items to the search service`);
      resolve();
    });
  })

  req.on('error', error => {
    console.error(error)
  });

  req.write(data);
  req.end();
});

const processRecords = (index, records) => Promise.all(
  Array(Math.ceil(records.length / 50))
    .fill([])
    .map((_, index) => index * 50)
    .map(begin => records.slice(begin, begin + 50))
    .map(items => runRequest(index, items))
)

const records = (new Array(number))
  .fill(null)
  .map((_, i) => {
    const firstName = faker.name.firstName();
    const lastName = faker.name.lastName();

    return {
      _meta: {
        location: {
          api: `https://service-api/entity/${i + 1}`,
          frontend: `https://service-website/entity/${i + 1}`,
        },
        domain: 'entity',
      },
      someSystemId: faker.datatype.number(),
      someOtherSystemId: faker.datatype.number(),
      title: faker.name.prefix(),
      firstName,
      lastName,
      otherNames: [{
        firstName,
        lastName: faker.name.lastName(),
      }],
      emailAddress: faker.internet.exampleEmail(firstName, lastName),
      address: {
        address: faker.address.streetAddress(false),
        postcode: `E${faker.datatype.number({max: 99})} ${faker.datatype.number({max: 9})}${faker.datatype.string(2).toUpperCase()}`, //faker.address.zipCode(undefined).replace(/^[A-Z]+/, 'E8'),
      },
    };
  });

processRecords('entities', records)
  .then(() => console.log('ON RUNNING FINISHED'))
  .catch(console.error);
