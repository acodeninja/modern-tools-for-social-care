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
    const bornAgo = Math.floor(Math.random() * (80 - 18 + 1) + 18);
    const diedAgo = faker.datatype.boolean() ? Math.floor(Math.random() * (bornAgo - 10 + 1) + 10) : null;

    const firstName = faker.name.firstName();
    const lastName = faker.name.lastName();

    return {
      _meta: {
        location: {
          api: `https://service-api/resident/${i + 1}`,
          frontend: `https://service-website/resident/${i + 1}`,
        },
        domain: 'resident',
      },
      mosaicId: faker.datatype.number(),
      title: faker.name.prefix(),
      firstName,
      lastName,
      otherNames: [{
        firstName,
        lastName: faker.name.lastName(),
      }],
      dateOfBirth: faker.date.past(bornAgo).toISOString().split("T")[0],
      dateOfDeath: diedAgo ? faker.date.past(diedAgo).toISOString().split("T")[0] : null,
      nhsNumber: faker.datatype.number(),
      emailAddress: faker.internet.exampleEmail(firstName, lastName),
      address: {
        address: faker.address.streetAddress(false),
        postcode: faker.address.zipCode(undefined).replace(/^[A-Z]+/, 'E'),
      },
      phoneNumbers: [
        {
          number: faker.phone.phoneNumber("07#########"),
        },
        {
          number: faker.phone.phoneNumber("0##########"),
        }
      ],
    };
  });

processRecords('residents', records)
  .then(() => console.log('ON RUNNING FINISHED'))
  .catch(console.error);
