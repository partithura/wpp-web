const { sign } = require('jsonwebtoken');
const { request } = require('http');
const { URL } = require('url');

const { SECRET, HOST, ALLOWED_METHODS } = require('../src/server/config');

function constructToken(message = 'Hello World', phonenumber = 5555999999999) {
  return sign({ message, phonenumber }, SECRET);
}

const token = constructToken();

const parsedUrl = new URL(HOST);

const [method] = ALLOWED_METHODS;

const options = {
  headers: {
    'Content-Type': 'application/json',
  },
  port: parsedUrl.port || 3001,
  host: parsedUrl.hostname,
  path: parsedUrl.pathname,
  method,
};

const req = request(options, (response) => {
  console.log(`statusCode: ${response.statusCode}`);

  response.on('data', (d) => {
    return process.stdout.write(d);
  });
});
req.write(JSON.stringify({ token }));

req.on('error', (error) => {
  console.error(error);
});

req.end();
