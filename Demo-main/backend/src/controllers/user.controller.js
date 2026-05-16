const bcrypt = require('bcryptjs');
const { query } = require('../db/pool');
const { serialize } = require('../utils/serialize');

const getAllUsers = async (req, res, next) => {
  try {
    const { rows } = await query(
      'SELECT id, name, email, role, avatar, created_at FROM users ORDER BY name ASC'
    );
    res.json(serialize({ users: rows }));
  } catch (err) { next(err); }
};

const getUserById = async (req, res, next) => {
  try {
    const { rows: [user] } = await query(
      'SELECT id, name, email, role, avatar, created_at FROM users WHERE id = $1',
      [req.params.id]
    );
    if (!user) return res.status(404).json({ error: 'User not found' });

    const { rows: [counts] } = await query(
      `SELECT
         (SELECT COUNT(*) FROM tasks    WHERE assignee_id = $1) AS assigned_tasks,
         (SELECT COUNT(*) FROM projects WHERE owner_id    = $1) AS owned_projects`,
      [req.params.id]
    );
    res.json(serialize({ user: { ...user, _count: counts } }));
  } catch (err) { next(err); }
};

const updateProfile = async (req, res, next) => {
  try {
    const { name } = req.body;
    const initials = name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

    const { rows: [user] } = await query(
      `UPDATE users SET name = $1, avatar = $2, updated_at = NOW()
       WHERE id = $3 RETURNING id, name, email, role, avatar`,
      [name, initials, req.user.id]
    );
    res.json(serialize({ message: 'Profile updated', user }));
  } catch (err) { next(err); }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const { rows: [user] } = await query('SELECT password FROM users WHERE id = $1', [req.user.id]);

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return res.status(400).json({ error: 'Current password is incorrect' });

    const hashed = await bcrypt.hash(newPassword, 12);
    await query('UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2', [hashed, req.user.id]);
    res.json({ message: 'Password changed successfully' });
  } catch (err) { next(err); }
};

const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (req.params.id === req.user.id)
      return res.status(400).json({ error: 'Cannot change your own role' });

    const { rows: [user] } = await query(
      'UPDATE users SET role = $1, updated_at = NOW() WHERE id = $2 RETURNING id, name, email, role',
      [role, req.params.id]
    );
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(serialize({ message: 'Role updated', user }));
  } catch (err) { next(err); }
};

module.exports = { getAllUsers, getUserById, updateProfile, changePassword, updateUserRole };
