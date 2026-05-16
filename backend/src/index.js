const app = require('./app');

const PORT = Number(process.env.PORT) || 5000;
const HOST = process.env.HOST || '0.0.0.0';
app.listen(PORT, HOST, () =>
  console.log(`🚀 TeamFlow API running on ${HOST}:${PORT} [${process.env.NODE_ENV || 'development'}]`));

module.exports = app;
