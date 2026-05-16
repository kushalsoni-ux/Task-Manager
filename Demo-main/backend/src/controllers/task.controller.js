const { query } = require('../db/pool');
const { serialize } = require('../utils/serialize');

const TASK_SELECT = `
  SELECT t.*,
    CASE WHEN a.id IS NOT NULL
      THEN json_build_object('id', a.id, 'name', a.name, 'email', a.email, 'avatar', a.avatar)
      ELSE NULL END AS assignee,
    json_build_object('id', c.id, 'name', c.name, 'email', c.email, 'avatar', c.avatar) AS creator,
    json_build_object('id', p.id, 'name', p.name, 'color', p.color) AS project,
    (SELECT COUNT(*)::int FROM comments WHERE task_id = t.id) AS comment_count
  FROM tasks t
  LEFT JOIN users a ON a.id = t.assignee_id
  JOIN  users c ON c.id = t.creator_id
  JOIN  projects p ON p.id = t.project_id
`;

const getTasks = async (req, res, next) => {
  try {
    const { projectId, status, priority, assigneeId, search, overdue } = req.query;
    const isAdmin = req.user.role === 'ADMIN';

    const conditions = [];
    const params = [];

    if (projectId) { conditions.push(`t.project_id = $${params.length+1}`); params.push(projectId); }
    if (status)    { conditions.push(`t.status = $${params.length+1}`);      params.push(status); }
    if (priority)  { conditions.push(`t.priority = $${params.length+1}`);    params.push(priority); }
    if (assigneeId){ conditions.push(`t.assignee_id = $${params.length+1}`); params.push(assigneeId); }
    if (overdue === 'true') {
      conditions.push(`t.due_date < NOW() AND t.status != 'DONE'`);
    }
    if (search) {
      conditions.push(`(t.title ILIKE $${params.length+1} OR t.description ILIKE $${params.length+1})`);
      params.push(`%${search}%`);
    }
    if (!isAdmin) {
      conditions.push(`(p.owner_id = $${params.length+1} OR EXISTS (
        SELECT 1 FROM project_members pm WHERE pm.project_id = t.project_id AND pm.user_id = $${params.length+1}
      ))`);
      params.push(req.user.id);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const sql = `${TASK_SELECT} ${where} ORDER BY
      CASE t.priority WHEN 'URGENT' THEN 1 WHEN 'HIGH' THEN 2 WHEN 'MEDIUM' THEN 3 ELSE 4 END,
      t.created_at DESC`;

    const { rows } = await query(sql, params);
    res.json(serialize({ tasks: rows }));
  } catch (err) { next(err); }
};

const getTaskById = async (req, res, next) => {
  try {
    const { rows: [task] } = await query(`${TASK_SELECT} WHERE t.id = $1`, [req.params.id]);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const { rows: comments } = await query(
      `SELECT cm.*, json_build_object('id', u.id, 'name', u.name, 'avatar', u.avatar) AS author
       FROM comments cm JOIN users u ON u.id = cm.author_id
       WHERE cm.task_id = $1 ORDER BY cm.created_at ASC`,
      [req.params.id]
    );
    res.json(serialize({ task: { ...task, comments } }));
  } catch (err) { next(err); }
};

const createTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, dueDate, assigneeId, projectId, tags } = req.body;

    // Verify project access
    const { rows: [project] } = await query('SELECT * FROM projects WHERE id = $1', [projectId]);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const { rows: [member] } = await query(
      'SELECT id FROM project_members WHERE project_id = $1 AND user_id = $2',
      [projectId, req.user.id]
    );
    if (!member && project.owner_id !== req.user.id && req.user.role !== 'ADMIN')
      return res.status(403).json({ error: 'Access denied' });

    const { rows: [task] } = await query(
      `INSERT INTO tasks (title, description, status, priority, due_date, assignee_id, project_id, creator_id, tags)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [title, description || null, status || 'TODO', priority || 'MEDIUM',
       dueDate || null, assigneeId || null, projectId, req.user.id, tags || []]
    );

    if (assigneeId && assigneeId !== req.user.id) {
      await query(
        `INSERT INTO notifications (type, message, user_id) VALUES ('TASK_ASSIGNED', $1, $2)`,
        [`You were assigned to "${title}"`, assigneeId]
      );
    }

    const { rows: [full] } = await query(`${TASK_SELECT} WHERE t.id = $1`, [task.id]);
    res.status(201).json(serialize({ message: 'Task created', task: full }));
  } catch (err) { next(err); }
};

const updateTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, dueDate, assigneeId, tags } = req.body;

    const { rows: [existing] } = await query('SELECT * FROM tasks WHERE id = $1', [req.params.id]);
    if (!existing) return res.status(404).json({ error: 'Task not found' });

    const fieldMap = [
      { key: 'title', column: 'title', value: title },
      { key: 'description', column: 'description', value: description ?? null },
      { key: 'status', column: 'status', value: status },
      { key: 'priority', column: 'priority', value: priority },
      { key: 'dueDate', column: 'due_date', value: dueDate ?? null },
      { key: 'assigneeId', column: 'assignee_id', value: assigneeId ?? null },
      { key: 'tags', column: 'tags', value: tags ?? null },
    ];

    const updates = fieldMap.filter(({ key }) => Object.prototype.hasOwnProperty.call(req.body, key));
    if (updates.length === 0) {
      const { rows: [full] } = await query(`${TASK_SELECT} WHERE t.id = $1`, [existing.id]);
      return res.json(serialize({ message: 'Task updated', task: full }));
    }

    const params = [];
    const assignments = updates.map(({ column, value }) => {
      params.push(value);
      return `${column} = $${params.length}`;
    });
    params.push(req.params.id);

    const { rows: [task] } = await query(
      `UPDATE tasks SET
         ${assignments.join(', ')},
         updated_at = NOW()
       WHERE id = $${params.length} RETURNING *`,
      params
    );

    if (assigneeId && assigneeId !== existing.assignee_id && assigneeId !== req.user.id) {
      await query(
        `INSERT INTO notifications (type, message, user_id) VALUES ('TASK_ASSIGNED', $1, $2)`,
        [`You were assigned to "${task.title}"`, assigneeId]
      );
    }

    const { rows: [full] } = await query(`${TASK_SELECT} WHERE t.id = $1`, [task.id]);
    res.json(serialize({ message: 'Task updated', task: full }));
  } catch (err) { next(err); }
};

const updateTaskStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const { rows: [task] } = await query(
      `UPDATE tasks SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [status, req.params.id]
    );
    if (!task) return res.status(404).json({ error: 'Task not found' });
    const { rows: [full] } = await query(`${TASK_SELECT} WHERE t.id = $1`, [task.id]);
    res.json(serialize({ message: 'Status updated', task: full }));
  } catch (err) { next(err); }
};

const deleteTask = async (req, res, next) => {
  try {
    const { rows: [task] } = await query('SELECT * FROM tasks WHERE id = $1', [req.params.id]);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const { rows: [project] } = await query('SELECT owner_id FROM projects WHERE id = $1', [task.project_id]);
    if (task.creator_id !== req.user.id && project?.owner_id !== req.user.id && req.user.role !== 'ADMIN')
      return res.status(403).json({ error: 'Not authorized to delete this task' });

    await query('DELETE FROM tasks WHERE id = $1', [req.params.id]);
    res.json({ message: 'Task deleted' });
  } catch (err) { next(err); }
};

const addComment = async (req, res, next) => {
  try {
    const { content } = req.body;
    const { rows: [task] } = await query('SELECT id FROM tasks WHERE id = $1', [req.params.id]);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const { rows: [comment] } = await query(
      `INSERT INTO comments (content, task_id, author_id) VALUES ($1,$2,$3) RETURNING *`,
      [content, req.params.id, req.user.id]
    );
    const { rows: [full] } = await query(
      `SELECT cm.*, json_build_object('id', u.id, 'name', u.name, 'avatar', u.avatar) AS author
       FROM comments cm JOIN users u ON u.id = cm.author_id WHERE cm.id = $1`,
      [comment.id]
    );
    res.status(201).json(serialize({ message: 'Comment added', comment: full }));
  } catch (err) { next(err); }
};

const deleteComment = async (req, res, next) => {
  try {
    const { rows: [comment] } = await query('SELECT * FROM comments WHERE id = $1', [req.params.commentId]);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });
    if (comment.author_id !== req.user.id && req.user.role !== 'ADMIN')
      return res.status(403).json({ error: 'Not authorized' });

    await query('DELETE FROM comments WHERE id = $1', [req.params.commentId]);
    res.json({ message: 'Comment deleted' });
  } catch (err) { next(err); }
};

module.exports = { getTasks, getTaskById, createTask, updateTask, updateTaskStatus, deleteTask, addComment, deleteComment };
