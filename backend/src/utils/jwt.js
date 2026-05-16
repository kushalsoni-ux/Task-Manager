const jwt = require('jsonwebtoken');

const ACCESS_SECRET = process.env.JWT_SECRET || 'teamflow-demo-access-secret';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'teamflow-demo-refresh-secret';

const generateTokenPair = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    avatar: user.avatar,
    createdAt: user.createdAt || user.created_at,
  };
  return {
    accessToken: jwt.sign(payload, ACCESS_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    }),
    refreshToken: jwt.sign(payload, REFRESH_SECRET, {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    }),
  };
};

const verifyAccessToken  = (t) => jwt.verify(t, ACCESS_SECRET);
const verifyRefreshToken = (t) => jwt.verify(t, REFRESH_SECRET);

module.exports = { generateTokenPair, verifyAccessToken, verifyRefreshToken };
