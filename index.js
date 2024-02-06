require('dotenv').config();

const { buildServer } = require('./src/server');

const PORT = process.env.PORT;

(async () => {
  const server = await buildServer();

  server.listen(PORT);
})();
