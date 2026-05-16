import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Bars3Icon, BellIcon } from '@heroicons/react/24/outline';
import { notificationsAPI } from '../api/notifications';
import NotificationPanel from './NotificationPanel';

const pageMeta = {
  '/dashboard': {
    title: 'Dashboard',
    subtitle: 'Track delivery, workload, and project momentum.',
  },
  '/projects': {
    title: 'Projects',
    subtitle: 'Manage initiatives, ownership, and execution progress.',
  },
  '/tasks': {
    title: 'My Tasks',
    subtitle: 'Stay on top of assigned work and due dates.',
  },
  '/team': {
    title: 'Team',
    subtitle: 'Keep visibility on roles and collaborators.',
  },
  '/profile': {
    title: 'Profile',
    subtitle: 'Update your account details and security settings.',
  },
};

export default function Header({ onMenuClick }) {
  const location = useLocation();
  const [notifOpen, setNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const currentPage = Object.entries(pageMeta).find(([path]) =>
    location.pathname.startsWith(path)
  )?.[1] || { title: 'TeamFlow', subtitle: 'Collaborate across your workspace.' };

  useEffect(() => {
    notificationsAPI.getAll()
      .then(({ data }) => setUnreadCount(data.unreadCount))
      .catch(() => {});
  }, [location.pathname]);

  return (
    <header className="sticky top-0 z-10 border-b border-dark-800/80 bg-dark-900/70 backdrop-blur-xl flex items-center justify-between px-4 py-3 lg:px-6 flex-shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-dark-400 hover:text-white transition-colors p-1"
        >
          <Bars3Icon className="w-6 h-6" />
        </button>
        <div className="min-w-0">
          <h1 className="text-lg font-semibold text-white">{currentPage.title}</h1>
          <p className="hidden sm:block text-xs text-dark-500 truncate">{currentPage.subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden md:block text-right">
          <p className="text-xs font-medium text-dark-300">
            {new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'short', day: 'numeric' }).format(new Date())}
          </p>
          <p className="text-[11px] text-dark-600">Workspace activity</p>
        </div>
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative p-2 text-dark-400 hover:text-white hover:bg-dark-800 rounded-xl transition-all"
          >
            <BellIcon className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-brand-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <NotificationPanel
              onClose={() => setNotifOpen(false)}
              onRead={() => setUnreadCount(0)}
            />
          )}
        </div>
      </div>
    </header>
  );
}
