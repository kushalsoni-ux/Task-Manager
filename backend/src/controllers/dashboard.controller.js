const { query, hasDatabaseConfig } = require('../db/pool');
const { getFallbackDashboard } = require('../utils/fallback-store');
const { serialize } = require('../utils/serialize');

const getDashboard = async (req, res, next) => {
  try {
    if (!hasDatabaseConfig()) {
      return res.json(serialize(getFallbackDashboard(req.user)));
    }

    const userId  = req.user.id;
    const isAdmin = req.user.role === 'ADMIN';
    const projectAccessClause = isAdmin
      ? ''
      : `AND (p.owner_id = $1 OR EXISTS (
           SELECT 1 FROM project_members pm WHERE pm.project_id = p.id AND pm.user_id = $1
         ))`;
    const taskAccessClause = isAdmin
      ? ''
      : `AND (p.owner_id = $1 OR EXISTS (
           SELECT 1 FROM project_members pm WHERE pm.project_id = t.project_id AND pm.user_id = $1
         ))`;
    const scopedParams = isAdmin ? [] : [userId];

    const [
      totalProjectsRes,
      activeProjectsRes,
      tasksByStatusRes,
      overdueRes,
      myTasksRes,
      recentTasksRes,
      upcomingRes,
      topProjectsRes,
    ] = await Promise.all([
      query(`SELECT COUNT(*)::int AS count FROM projects p WHERE 1=1 ${projectAccessClause}`, scopedParams),
      query(`SELECT COUNT(*)::int AS count FROM projects p WHERE p.status = 'ACTIVE' ${projectAccessClause}`, scopedParams),
      query(`SELECT t.status, COUNT(*)::int AS count FROM tasks t JOIN projects p ON p.id = t.project_id WHERE 1=1 ${taskAccessClause} GROUP BY t.status`, scopedParams),
      query(`SELECT COUNT(*)::int AS count FROM tasks t JOIN projects p ON p.id = t.project_id WHERE t.due_date < NOW() AND t.status != 'DONE' ${taskAccessClause}`, scopedParams),
      query(
        `SELECT t.*, json_build_object('id', p.id, 'name', p.name, 'color', p.color) AS project
         FROM tasks t JOIN projects p ON p.id = t.project_id
         WHERE t.assignee_id = $1 AND t.status != 'DONE' ${taskAccessClause}
         ORDER BY CASE t.priority WHEN 'URGENT' THEN 1 WHEN 'HIGH' THEN 2 WHEN 'MEDIUM' THEN 3 ELSE 4 END, t.due_date ASC NULLS LAST
         LIMIT 5`,
        [userId]
      ),
      query(
        `SELECT t.*,
           json_build_object('id', p.id, 'name', p.name, 'color', p.color) AS project,
           CASE WHEN a.id IS NOT NULL THEN json_build_object('id', a.id, 'name', a.name, 'avatar', a.avatar) ELSE NULL END AS assignee,
           json_build_object('id', c.id, 'name', c.name, 'avatar', c.avatar) AS creator
         FROM tasks t
         JOIN projects p ON p.id = t.project_id
         LEFT JOIN users a ON a.id = t.assignee_id
         JOIN users c ON c.id = t.creator_id
         WHERE 1=1 ${taskAccessClause}
         ORDER BY t.updated_at DESC LIMIT 8`,
        scopedParams
      ),
      query(
        `SELECT t.*, json_build_object('id', p.id, 'name', p.name, 'color', p.color) AS project,
           CASE WHEN a.id IS NOT NULL THEN json_build_object('id', a.id, 'name', a.name, 'avatar', a.avatar) ELSE NULL END AS assignee
         FROM tasks t JOIN projects p ON p.id = t.project_id
         LEFT JOIN users a ON a.id = t.assignee_id
         WHERE t.due_date >= NOW() AND t.due_date <= NOW() + INTERVAL '7 days' AND t.status != 'DONE'
         ${taskAccessClause}
         ORDER BY t.due_date ASC LIMIT 5`,
        scopedParams
      ),
      query(
        `SELECT p.*, json_build_object('id', u.id, 'name', u.name, 'avatar', u.avatar) AS owner
         FROM projects p JOIN users u ON u.id = p.owner_id
         WHERE p.status = 'ACTIVE' ${projectAccessClause}
         ORDER BY p.updated_at DESC LIMIT 4`,
        scopedParams
      ),
    ]);

    const statusMap = { TODO: 0, IN_PROGRESS: 0, IN_REVIEW: 0, DONE: 0 };
    tasksByStatusRes.rows.forEach((r) => { statusMap[r.status] = r.count; });
    const totalTasks = Object.values(statusMap).reduce((a, b) => a + b, 0);

    // Enrich top projects
    const topProjects = await Promise.all(
      topProjectsRes.rows.map(async (p) => {
        const { rows: stats } = await query(
          `SELECT status, COUNT(*)::int AS count FROM tasks WHERE project_id = $1 GROUP BY status`,
          [p.id]
        );
        const ts = { TODO: 0, IN_PROGRESS: 0, IN_REVIEW: 0, DONE: 0 };
        stats.forEach((s) => { ts[s.status] = s.count; });
        const tot  = Object.values(ts).reduce((a, b) => a + b, 0);
        const prog = tot > 0 ? Math.round((ts.DONE / tot) * 100) : 0;

        const { rows: members } = await query(
          `SELECT pm.user_id, u.name, u.avatar FROM project_members pm JOIN users u ON u.id = pm.user_id WHERE pm.project_id = $1 LIMIT 4`,
          [p.id]
        );
        return { ...p, taskStats: ts, progress: prog, members: members.map((m) => ({ userId: m.user_id, user: { name: m.name, avatar: m.avatar } })) };
      })
    );

    res.json(serialize({
      stats: {
        totalProjects:   totalProjectsRes.rows[0].count,
        activeProjects:  activeProjectsRes.rows[0].count,
        totalTasks,
        completedTasks:  statusMap.DONE,
        overdueTasks:    overdueRes.rows[0].count,
        tasksByStatus:   statusMap,
      },
      myTasks:      myTasksRes.rows,
      recentTasks:  recentTasksRes.rows,
      upcomingTasks: upcomingRes.rows,
      topProjects,
    }));
  } catch (err) { next(err); }
};

module.exports = { getDashboard };
