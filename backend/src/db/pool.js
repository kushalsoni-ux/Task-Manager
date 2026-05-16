const { Pool } = require('pg');

let _pool = null;

const resolveConnectionConfig = () => {
  const host = process.env.PGHOST || process.env.POSTGRES_HOST;
  const port = process.env.PGPORT || process.env.POSTGRES_PORT;
  const user = process.env.PGUSER || process.env.POSTGRES_USER;
  const password = process.env.PGPASSWORD || process.env.POSTGRES_PASSWORD;
  const database = process.env.PGDATABASE || process.env.POSTGRES_DATABASE;
  const sslMode = process.env.PGSSLMODE || process.env.POSTGRES_SSLMODE;
  const rawUrl = [
    process.env.DATABASE_URL,
    process.env.POSTGRES_URL,
    process.env.POSTGRES_PRISMA_URL,
    process.env.POSTGRES_URL_NON_POOLING,
    process.env.POSTGRES_URL_NO_SSL,
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

  if (host && user && database) {
    const useSSL =
      sslMode === 'require' ||
      (process.env.NODE_ENV === 'production' &&
        !['localhost', '127.0.0.1'].includes(host));

    return {
      host,
      port: port ? Number(port) : 5432,
      user,
      password,
      database,
      ssl: useSSL ? { rejectUnauthorized: false } : false,
    };
  }

  return null;
};

const hasDatabaseConfig = () => Boolean(resolveConnectionConfig());

const getConnectionConfig = () => {
  const config = resolveConnectionConfig();
  if (config) return config;

  throw new Error('Database connection env is not set. Add DATABASE_URL, POSTGRES_URL, or POSTGRES_HOST/POSTGRES_USER/POSTGRES_DATABASE.');
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

module.exports = { query, getClient, endPool, getPool, hasDatabaseConfig };
