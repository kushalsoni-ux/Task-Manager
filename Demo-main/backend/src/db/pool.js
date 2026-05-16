const { Pool } = require('pg');

let _pool = null;

const getPool = () => {
  if (_pool) return _pool;

  const rawUrl = process.env.DATABASE_URL || '';
  if (!rawUrl) throw new Error('DATABASE_URL is not set');

  // Strip sslmode from URL — pass SSL via config object to avoid pg/Neon conflict
  const connectionString = rawUrl.replace(/[?&]sslmode=[^&]*/g, '').replace(/\?$/, '') || rawUrl;
  const useSSL = rawUrl.includes('neon.tech') || rawUrl.includes('amazonaws.com') || rawUrl.includes('sslmode=require');

  _pool = new Pool({
    connectionString,
    ssl: useSSL ? { rejectUnauthorized: false } : false,
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
