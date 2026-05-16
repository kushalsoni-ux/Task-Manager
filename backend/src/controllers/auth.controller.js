const bcrypt = require('bcryptjs');
const { query, hasDatabaseConfig } = require('../db/pool');
const { generateTokenPair, verifyRefreshToken } = require('../utils/jwt');
const {
  createFallbackUser,
  getFallbackUserByEmail,
  getFallbackUserById,
  getSafeUser,
  getUserWithFallback,
  verifyFallbackPassword,
} = require('../utils/fallback-store');
const { serialize } = require('../utils/serialize');

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!hasDatabaseConfig()) {
      const user = await createFallbackUser({ name, email, password });
      if (!user) return res.status(409).json({ error: 'Email already registered' });

      return res.status(201).json(serialize({
        message: 'Account created',
        user,
        ...generateTokenPair(user),
      }));
    }

    const { rows: [existing] } = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing) return res.status(409).json({ error: 'Email already registered' });

    const hashed   = await bcrypt.hash(password, 12);
    const initials = name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

    const { rows: [user] } = await query(
      `INSERT INTO users (name, email, password, avatar)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role, avatar, created_at`,
      [name, email, hashed, initials]
    );

    res.status(201).json(serialize({ message: 'Account created', user, ...generateTokenPair(user) }));
  } catch (err) { next(err); }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!hasDatabaseConfig()) {
      const user = getFallbackUserByEmail(email);
      if (!user) return res.status(401).json({ error: 'Invalid email or password' });

      const valid = await verifyFallbackPassword(user, password);
      if (!valid) return res.status(401).json({ error: 'Invalid email or password' });

      const safeUser = getSafeUser(user);
      return res.json(serialize({
        message: 'Login successful',
        user: safeUser,
        ...generateTokenPair(safeUser),
      }));
    }

    const { rows: [user] } = await query('SELECT * FROM users WHERE email = $1', [email]);
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid email or password' });

    const { password: _, ...safeUser } = user;
    res.json(serialize({ message: 'Login successful', user: safeUser, ...generateTokenPair(safeUser) }));
  } catch (err) { next(err); }
};

const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ error: 'Refresh token required' });

    const decoded = verifyRefreshToken(refreshToken);

    if (!hasDatabaseConfig()) {
      const user = getFallbackUserById(decoded.id) || getUserWithFallback(decoded);
      return res.json(serialize({ ...generateTokenPair(user), user }));
    }

    const { rows: [user] } = await query(
      'SELECT id, name, email, role, avatar FROM users WHERE id = $1',
      [decoded.id]
    );
    if (!user) return res.status(401).json({ error: 'User not found' });

    res.json(serialize({ ...generateTokenPair(user), user }));
  } catch (err) {
    if (err.name === 'TokenExpiredError')
      return res.status(401).json({ error: 'Refresh token expired, please login again' });
    return res.status(401).json({ error: 'Invalid refresh token' });
  }
};

const me = (req, res) => res.json(serialize({ user: req.user }));

module.exports = { register, login, refresh, me };
