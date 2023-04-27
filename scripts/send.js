const { sign } = require('jsonwebtoken');
const { request } = require('http');
const { writeFile } = require('fs');
const { URL } = require('url');

const { SECRET, HOST, FILENAME } = require('../src/server/config');
const { db } = require(`../${FILENAME}`); // { "db": [ { "name": "José", "number": 555599999999  }, ... ] }

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
  return {
    message: `🎉 Parabéns, *${name}*! Tu fostes premiado a fazer o mate hoje!`,
    phonenumber,
  };
}

function constructToken() {
  return sign(getMessageAndPhoneNumber(), SECRET);
}

const parsedUrl = new URL(HOST);

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
