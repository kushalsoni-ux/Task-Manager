const { Pool } = require('pg');

let _pool = null;

const getConnectionConfig = () => {
  const rawUrl = [
    process.env.DATABASE_URL,
    process.env.POSTGRES_URL,
    process.env.POSTGRES_PRISMA_URL,
    process.env.POSTGRES_URL_NON_POOLING,
  ].find(Boolean);

  if (rawUrl) {
    const connectionString = rawUrl.replace(/[?&]sslmode=[^&]*/g, '').replace(/\?$/, '') || rawUrl;
    const useSSL =
      rawUrl.includes('sslmode=require') ||
      rawUrl.includes('neon.tech') ||
      rawUrl.includes('amazonaws.com') ||
      rawUrl.includes('vercel-storage.com');

    return {
      connectionString,
      ssl: useSSL ? { rejectUnauthorized: false } : false,
    };
  }

  if (process.env.PGHOST && process.env.PGUSER && process.env.PGDATABASE) {
    const useSSL =
      process.env.PGSSLMODE === 'require' ||
      (process.env.NODE_ENV === 'production' &&
        !['localhost', '127.0.0.1'].includes(process.env.PGHOST));

    return {
      host: process.env.PGHOST,
      port: process.env.PGPORT ? Number(process.env.PGPORT) : 5432,
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      database: process.env.PGDATABASE,
      ssl: useSSL ? { rejectUnauthorized: false } : false,
    };
  }

  throw new Error('Database connection env is not set');
};

const getPool = () => {
  if (_pool) return _pool;

  _pool = new Pool({
    ...getConnectionConfig(),
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 20000,
  });

  _pool.on('error', (err) => console.error('Pool error:', err.message));
  return _pool;
};

const query = (text, params) => getPool().query(text, params);
const getClient = () => getPool().connect();
const endPool = () => _pool ? _pool.end().finally(() => { _pool = null; }) : Promise.resolve();

module.exports = { query, getClient, endPool, getPool };
