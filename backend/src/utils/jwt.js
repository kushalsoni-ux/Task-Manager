const jwt = require('jsonwebtoken');

const generateTokenPair = (user) => {
  const payload = { id: user.id, email: user.email, role: user.role };
  return {
    accessToken: jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    }),
    refreshToken: jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    }),
  };
};

const verifyAccessToken  = (t) => jwt.verify(t, process.env.JWT_SECRET);
const verifyRefreshToken = (t) => jwt.verify(t, process.env.JWT_REFRESH_SECRET);

module.exports = { generateTokenPair, verifyAccessToken, verifyRefreshToken };
