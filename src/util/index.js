const {
  ALLOWED_METHODS,
  BASE_ROUTE,
  HTTP_STATUS,
} = require('../server/config');

function constructResponse(response, body) {
  response.end(JSON.stringify(body));
}

function validateRequest(request, response) {
  if (!ALLOWED_METHODS.includes(request.method)) {
    response.statusCode = HTTP_STATUS.METHOD_NOT_ALLOWED;
    return constructResponse(response, errorMessage(`Method aren't allowed`));
  }
  if (!request.url.startsWith(BASE_ROUTE)) {
    response.statusCode = HTTP_STATUS.NOT_FOUND;
    return constructResponse(
      response,
      errorMessage(`Not found: ${request.url}`)
    );
  }
}

function errorMessage(message) {
  return {
    statusText: -1,
    error: message,
  };
}

module.exports = {
  errorMessage,
  constructResponse,
  validateRequest,
  HTTP_STATUS,
};
