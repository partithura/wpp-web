const { verify } = require('jsonwebtoken');
const { createServer } = require('http');

const { validateRequest, constructResponse, errorMessage } = require('../util');
const { SECRET, HOST, HTTP_STATUS } = require('./config');
const { buildClient } = require('../services/whatsapp');

async function buildServer(clientId = 'client-one') {
  const { sendMessage } = await buildClient(clientId);

  const app = createServer((request, response) => {
    validateRequest(request, response);

    if (response.statusCode === HTTP_STATUS.OK) {
      request.on('data', (data) => {
        const { token } = JSON.parse(data.toString());

        verify(
          token,
          SECRET,
          { complete: true },
          async (errorInValidationToken, decoded) => {
            response.writeHead(HTTP_STATUS.OK, {
              'Content-Type': 'application/json',
            });

            if (errorInValidationToken) {
              return constructResponse(response, errorMessage('Invalid token'));
            }

            const { phonenumber = null, message = null } = decoded?.payload;

            if (!phonenumber || !message) {
              return constructResponse(
                response,
                errorMessage('Payload not found')
              );
            }

            return constructResponse(
              response,
              await sendMessage(phonenumber, message)
            );
          }
        );
      });
    }
  });

  return {
    /**
     * Define qual porta o servidor vai receber requisições
     * @param {number} port
     */
    listen: (port) => {
      app.listen(port);
      console.log(`Server running at ${HOST}/`);
    },
  };
}

module.exports = { buildServer };
