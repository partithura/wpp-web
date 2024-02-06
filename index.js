require('dotenv').config();

const { buildServer } = require('./src/server');

const PORT = process.env.PORT || 5000;

(async () => {
  const server = await buildServer();

  server.listen(PORT, '0.0.0.0');
})();
