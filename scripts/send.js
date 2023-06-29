const { sign } = require('jsonwebtoken');
const { request } = require('http');
const { writeFile } = require('fs');
const { URL } = require('url');

const { SECRET, HOST, FILENAME } = require('../src/server/config');
const { db } = require(`../${FILENAME}`); // { "db": [ { "name": "José", "number": 555599999999  }, ... ] }
const { messages } = require('./messages');

const parsedUrl = new URL(HOST);

function getFirstAndPutItInLastPosition() {
  const first = db.shift();
  db.push(first);
  return first;
}

function persistChanges() {
  writeFile(`./${FILENAME}`, JSON.stringify({ db }), (err) => {
    if (err) throw err;
  });
}

function getMessageAndPhoneNumber() {
  const { name, number: phonenumber } = getFirstAndPutItInLastPosition();
  const random = Math.random();
  const index = Math.floor(random * messages(2).length);

  return {
    message: messages(name)[index],
    phonenumber,
  };
}

function constructToken() {
  const payload = getMessageAndPhoneNumber();
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
      persistChanges(db);
      return process.stdout.write(d);
    });
  }
);
req.write(JSON.stringify({ token: constructToken() }));

req.on('error', (error) => {
  console.error(error);
});

req.end();
