const { verify } = require('jsonwebtoken');
const { createServer } = require('http');

const { validateRequest, constructResponse, errorMessage } = require('../util');
const { SECRET, HTTP_STATUS } = require('./config');
const { buildClient } = require('../services/whatsapp');



async function buildServer() {
  const { name } = require('../../package.json')
  const { sendMessage } = await buildClient(name);
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
            const {
              phonenumber = null,
              message = null,
              origin = null,
            } = decoded?.payload;
            if (!message) {
              return constructResponse(
                response,
                errorMessage('Payload not found')
              );
            }
            return constructResponse(
              response,
              await sendMessage(phonenumber, message, origin)
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
      console.log(`Server running in port ${port}!`);
    },
  };
}

module.exports = { buildServer };
