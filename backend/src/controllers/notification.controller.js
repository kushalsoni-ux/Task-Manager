const { query, hasDatabaseConfig } = require('../db/pool');
const {
  deleteFallbackNotification,
  getFallbackNotifications,
  markAllFallbackNotificationsAsRead,
  markFallbackNotificationAsRead,
} = require('../utils/fallback-store');
const { serialize } = require('../utils/serialize');

const getNotifications = async (req, res, next) => {
  try {
    if (!hasDatabaseConfig()) {
      return res.json(serialize({ storageMode: 'fallback', ...getFallbackNotifications(req.user.id) }));
    }

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
    if (!hasDatabaseConfig()) {
      markFallbackNotificationAsRead(req.params.id, req.user.id);
      return res.json({ message: 'Marked as read' });
    }

    await query(`UPDATE notifications SET read = TRUE WHERE id = $1 AND user_id = $2`, [req.params.id, req.user.id]);
    res.json({ message: 'Marked as read' });
  } catch (err) { next(err); }
};

const markAllAsRead = async (req, res, next) => {
  try {
    if (!hasDatabaseConfig()) {
      markAllFallbackNotificationsAsRead(req.user.id);
      return res.json({ message: 'All notifications marked as read' });
    }

    await query(`UPDATE notifications SET read = TRUE WHERE user_id = $1 AND read = FALSE`, [req.user.id]);
    res.json({ message: 'All notifications marked as read' });
  } catch (err) { next(err); }
};

const deleteNotification = async (req, res, next) => {
  try {
    if (!hasDatabaseConfig()) {
      deleteFallbackNotification(req.params.id, req.user.id);
      return res.json({ message: 'Notification deleted' });
    }

    await query(`DELETE FROM notifications WHERE id = $1 AND user_id = $2`, [req.params.id, req.user.id]);
    res.json({ message: 'Notification deleted' });
  } catch (err) { next(err); }
};

module.exports = { getNotifications, markAsRead, markAllAsRead, deleteNotification };
