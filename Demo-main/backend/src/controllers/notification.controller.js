const { query } = require('../db/pool');
const { serialize } = require('../utils/serialize');

const getNotifications = async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20`,
      [req.user.id]
    );
    const unreadCount = rows.filter((n) => !n.read).length;
    res.json(serialize({ notifications: rows, unreadCount }));
  } catch (err) { next(err); }
};

const markAsRead = async (req, res, next) => {
  try {
    await query(`UPDATE notifications SET read = TRUE WHERE id = $1 AND user_id = $2`, [req.params.id, req.user.id]);
    res.json({ message: 'Marked as read' });
  } catch (err) { next(err); }
};

const markAllAsRead = async (req, res, next) => {
  try {
    await query(`UPDATE notifications SET read = TRUE WHERE user_id = $1 AND read = FALSE`, [req.user.id]);
    res.json({ message: 'All notifications marked as read' });
  } catch (err) { next(err); }
};

const deleteNotification = async (req, res, next) => {
  try {
    await query(`DELETE FROM notifications WHERE id = $1 AND user_id = $2`, [req.params.id, req.user.id]);
    res.json({ message: 'Notification deleted' });
  } catch (err) { next(err); }
};

module.exports = { getNotifications, markAsRead, markAllAsRead, deleteNotification };
