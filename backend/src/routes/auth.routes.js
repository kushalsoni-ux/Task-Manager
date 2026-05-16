const router = require('express').Router();
const { body } = require('express-validator');
const { register, login, refresh, me } = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');

router.post('/register',
  [body('name').trim().isLength({ min: 2, max: 50 }),
   body('email').isEmail().normalizeEmail(),
   body('password').isLength({ min: 6 })],
  validate, register);

router.post('/login',
  [body('email').isEmail().normalizeEmail(),
   body('password').notEmpty()],
  validate, login);

router.post('/refresh', refresh);
router.get('/me', authenticate, me);

module.exports = router;
