const { sign } = require('jsonwebtoken');
const { request } = require('http');
const { writeFile } = require('fs');
const { URL } = require('url');

const { SECRET, HOST } = require('../src/server/config');

const parsedUrl = new URL(HOST);

function getMessage() {
  return {
    message: 'Hoje de noite estamos falando sobre a API',
  };
}

function constructToken() {
  const payload = getMessage();
  return sign(payload, SECRET);
}

const req = request(
  {
    headers: {
      'Content-Type': 'application/json',
    },
    port: 3002,
    host: parsedUrl.hostname,
    path: parsedUrl.pathname,
    method: 'POST',
  },
  (response) => {
    console.log(`statusCode: ${response.statusCode}`);

    response.on('data', (d) => {
      return process.stdout.write(d);
    });
  }
);
const payload = JSON.stringify({ token: constructToken() })
req.write(payload);

req.on('error', (error) => {
  console.error(error);
});

req.end();
