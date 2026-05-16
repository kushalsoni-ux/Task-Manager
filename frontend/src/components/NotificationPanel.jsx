import { useState, useEffect, useRef } from 'react';
import { BellIcon, CheckIcon, ClipboardDocumentListIcon, FolderIcon, ExclamationTriangleIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';
import { notificationsAPI } from '../api/notifications';
import { formatDistanceToNow } from 'date-fns';

const typeIcon = {
  TASK_ASSIGNED: ClipboardDocumentListIcon,
  PROJECT_INVITE: FolderIcon,
  TASK_OVERDUE: ExclamationTriangleIcon,
  COMMENT: ChatBubbleLeftIcon,
};

export default function NotificationPanel({ onClose, onRead }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const ref = useRef(null);

  useEffect(() => {
    notificationsAPI.getAll()
      .then(({ data }) => setNotifications(data.notifications))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const markAll = async () => {
    await notificationsAPI.markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    onRead();
  };

  return (
    <div
      ref={ref}
      className="absolute right-0 top-12 w-80 bg-dark-900 border border-dark-700 rounded-xl shadow-2xl shadow-black/40 z-50 animate-slide-up overflow-hidden"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-dark-800">
        <div className="flex items-center gap-2">
          <BellIcon className="w-4 h-4 text-brand-400" />
          <span className="text-sm font-semibold text-white">Notifications</span>
        </div>
        <button
          onClick={markAll}
          className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1"
        >
          <CheckIcon className="w-3 h-3" />
          Mark all read
        </button>
      </div>

      <div className="max-h-80 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-8 text-dark-500 text-sm">
            <BellIcon className="w-8 h-8 mx-auto mb-2 opacity-30" />
            No notifications
          </div>
        ) : (
          notifications.map((n) => {
            const Icon = typeIcon[n.type] || BellIcon;
            return (
              <div
                key={n.id}
                className={`px-4 py-3 border-b border-dark-800/50 hover:bg-dark-800/50 transition-colors ${
                  !n.read ? 'bg-brand-500/5' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <Icon className="w-4 h-4 mt-0.5 text-dark-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${n.read ? 'text-dark-400' : 'text-dark-100'}`}>
                      {n.message}
                    </p>
                    <p className="text-xs text-dark-600 mt-0.5">
                      {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  {!n.read && (
                    <div className="w-2 h-2 bg-brand-500 rounded-full mt-1.5 flex-shrink-0" />
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
