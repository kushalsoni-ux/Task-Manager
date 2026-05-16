const { query } = require('../db/pool');
const { serialize } = require('../utils/serialize');

// Helper: enrich a project with members, task stats, progress
async function enrichProject(project) {
  const { rows: members } = await query(
    `SELECT pm.*, u.id as uid, u.name, u.email, u.avatar, u.role as user_role
     FROM project_members pm
     JOIN users u ON u.id = pm.user_id
     WHERE pm.project_id = $1`,
    [project.id]
  );

  const { rows: stats } = await query(
    `SELECT status, COUNT(*)::int AS count FROM tasks WHERE project_id = $1 GROUP BY status`,
    [project.id]
  );

  const taskStats = { TODO: 0, IN_PROGRESS: 0, IN_REVIEW: 0, DONE: 0 };
  stats.forEach((s) => { taskStats[s.status] = s.count; });
  const total    = Object.values(taskStats).reduce((a, b) => a + b, 0);
  const progress = total > 0 ? Math.round((taskStats.DONE / total) * 100) : 0;

  const { rows: [owner] } = await query(
    'SELECT id, name, email, avatar FROM users WHERE id = $1',
    [project.owner_id]
  );

  return {
    ...project,
    owner,
    members: members.map((m) => ({
      userId: m.user_id,
      role: m.role,
      joinedAt: m.joined_at,
      user: { id: m.uid, name: m.name, email: m.email, avatar: m.avatar, role: m.user_role },
    })),
    taskStats,
    progress,
    _count: { tasks: total },
  };
}

const getProjects = async (req, res, next) => {
  try {
    const { search, status } = req.query;
    const isAdmin = req.user.role === 'ADMIN';

    let sql = `SELECT DISTINCT p.* FROM projects p`;
    const params = [];
    const conditions = [];

    if (!isAdmin) {
      sql += ` LEFT JOIN project_members pm ON pm.project_id = p.id`;
      conditions.push(`(p.owner_id = $${params.length + 1} OR pm.user_id = $${params.length + 1})`);
      params.push(req.user.id);
    }
    if (status) {
      conditions.push(`p.status = $${params.length + 1}`);
      params.push(status);
    }
    if (search) {
      conditions.push(`(p.name ILIKE $${params.length + 1} OR p.description ILIKE $${params.length + 1})`);
      params.push(`%${search}%`);
    }

    if (conditions.length) sql += ` WHERE ` + conditions.join(' AND ');
    sql += ` ORDER BY p.updated_at DESC`;

    const { rows: projects } = await query(sql, params);
    const enriched = await Promise.all(projects.map(enrichProject));
    res.json(serialize({ projects: enriched }));
  } catch (err) { next(err); }
};

const getProjectById = async (req, res, next) => {
  try {
    const { rows: [project] } = await query('SELECT * FROM projects WHERE id = $1', [req.params.id]);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const enriched = await enrichProject(project);

    // Fetch tasks with assignee + creator
    const { rows: tasks } = await query(
      `SELECT t.*,
         json_build_object('id', a.id, 'name', a.name, 'avatar', a.avatar) AS assignee,
         json_build_object('id', c.id, 'name', c.name, 'avatar', c.avatar) AS creator,
         (SELECT COUNT(*)::int FROM comments WHERE task_id = t.id) AS comment_count
       FROM tasks t
       LEFT JOIN users a ON a.id = t.assignee_id
       LEFT JOIN users c ON c.id = t.creator_id
       WHERE t.project_id = $1
       ORDER BY t.created_at DESC`,
      [req.params.id]
    );

    res.json(serialize({ project: { ...enriched, tasks } }));
  } catch (err) { next(err); }
};

const createProject = async (req, res, next) => {
  try {
    const { name, description, color, dueDate } = req.body;

    const { rows: [project] } = await query(
      `INSERT INTO projects (name, description, color, due_date, owner_id)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, description || null, color || '#10b981', dueDate || null, req.user.id]
    );

    await query(
      `INSERT INTO project_members (project_id, user_id, role) VALUES ($1, $2, 'ADMIN')`,
      [project.id, req.user.id]
    );

    const enriched = await enrichProject(project);
    res.status(201).json(serialize({ message: 'Project created', project: enriched }));
  } catch (err) { next(err); }
};

const updateProject = async (req, res, next) => {
  try {
    const { name, description, color, status, dueDate } = req.body;
    const { rows: [project] } = await query(
      `UPDATE projects
       SET name        = COALESCE($1, name),
           description = COALESCE($2, description),
           color       = COALESCE($3, color),
           status      = COALESCE($4, status),
           due_date    = COALESCE($5, due_date),
           updated_at  = NOW()
       WHERE id = $6 RETURNING *`,
      [name || null, description ?? null, color || null, status || null, dueDate || null, req.params.id]
    );
    const enriched = await enrichProject(project);
    res.json(serialize({ message: 'Project updated', project: enriched }));
  } catch (err) { next(err); }
};

const deleteProject = async (req, res, next) => {
  try {
    await query('DELETE FROM projects WHERE id = $1', [req.params.id]);
    res.json({ message: 'Project deleted' });
  } catch (err) { next(err); }
};

const addMember = async (req, res, next) => {
  try {
    const { userId, role } = req.body;
    const projectId = req.params.id;

    const { rows: [user] } = await query('SELECT id, name, email, avatar FROM users WHERE id = $1', [userId]);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const { rows: [existing] } = await query(
      'SELECT id FROM project_members WHERE project_id = $1 AND user_id = $2',
      [projectId, userId]
    );
    if (existing) return res.status(409).json({ error: 'User is already a member' });

    const { rows: [member] } = await query(
      `INSERT INTO project_members (project_id, user_id, role) VALUES ($1, $2, $3) RETURNING *`,
      [projectId, userId, role || 'MEMBER']
    );

    // Notify
    const { rows: [proj] } = await query('SELECT name FROM projects WHERE id = $1', [projectId]);
    await query(
      `INSERT INTO notifications (type, message, user_id) VALUES ('PROJECT_INVITE', $1, $2)`,
      [`You were added to project "${proj?.name}"`, userId]
    );

    res.status(201).json(serialize({ message: 'Member added', member: { ...member, user } }));
  } catch (err) { next(err); }
};

const removeMember = async (req, res, next) => {
  try {
    const { projectId, userId } = req.params;
    const { rows: [project] } = await query('SELECT owner_id FROM projects WHERE id = $1', [projectId]);
    if (project?.owner_id === userId)
      return res.status(400).json({ error: 'Cannot remove project owner' });

    await query('DELETE FROM project_members WHERE project_id = $1 AND user_id = $2', [projectId, userId]);
    res.json({ message: 'Member removed' });
  } catch (err) { next(err); }
};

const updateMemberRole = async (req, res, next) => {
  try {
    const { projectId, userId } = req.params;
    const { role } = req.body;
    await query(
      'UPDATE project_members SET role = $1 WHERE project_id = $2 AND user_id = $3',
      [role, projectId, userId]
    );
    res.json({ message: 'Member role updated' });
  } catch (err) { next(err); }
};

module.exports = {
  getProjects, getProjectById, createProject, updateProject, deleteProject,
  addMember, removeMember, updateMemberRole,
};
