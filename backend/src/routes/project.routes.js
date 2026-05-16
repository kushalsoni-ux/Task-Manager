const router = require('express').Router();
const { body } = require('express-validator');
const {
  getProjects, getProjectById, createProject, updateProject, deleteProject,
  addMember, removeMember, updateMemberRole,
} = require('../controllers/project.controller');
const { authenticate, requireProjectAccess, requireProjectAdmin } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');

router.use(authenticate);

router.get('/', getProjects);
router.post('/', [body('name').trim().isLength({ min: 2, max: 100 })], validate, createProject);
router.get('/:id', requireProjectAccess, getProjectById);
router.put('/:id', requireProjectAdmin, [body('name').optional().trim().isLength({ min: 2 })], validate, updateProject);
router.delete('/:id', requireProjectAdmin, deleteProject);

router.post('/:id/members', requireProjectAdmin, [body('userId').notEmpty()], validate, addMember);
router.delete('/:projectId/members/:userId', requireProjectAdmin, removeMember);
router.patch('/:projectId/members/:userId/role', requireProjectAdmin, [body('role').isIn(['ADMIN','MEMBER'])], validate, updateMemberRole);

module.exports = router;
