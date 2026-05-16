const router = require('express').Router();
const { body } = require('express-validator');
const { getAllUsers, getUserById, updateProfile, changePassword, updateUserRole } = require('../controllers/user.controller');
const { authenticate, requireAdmin } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');

router.use(authenticate);

router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.patch('/me/profile',
  [body('name').trim().isLength({ min: 2, max: 50 })], validate, updateProfile);
router.patch('/me/password',
  [body('currentPassword').notEmpty(), body('newPassword').isLength({ min: 6 })], validate, changePassword);
router.patch('/:id/role', requireAdmin,
  [body('role').isIn(['ADMIN', 'MEMBER'])], validate, updateUserRole);

module.exports = router;
