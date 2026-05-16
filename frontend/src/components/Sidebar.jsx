import { NavLink, useNavigate } from 'react-router-dom';
import {
  HomeIcon,
  FolderIcon,
  ClipboardDocumentListIcon,
  UsersIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import useAuthStore from '../context/authStore';
import Avatar from './ui/Avatar';

const navItems = [
  { to: '/dashboard', icon: HomeIcon, label: 'Dashboard' },
  { to: '/projects', icon: FolderIcon, label: 'Projects' },
  { to: '/tasks', icon: ClipboardDocumentListIcon, label: 'My Tasks' },
  { to: '/team', icon: UsersIcon, label: 'Team' },
  { to: '/profile', icon: UserCircleIcon, label: 'Profile' },
];

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside
      className={`
        fixed lg:static inset-y-0 left-0 z-30
        w-64 flex flex-col bg-dark-900 border-r border-dark-800
        transform transition-transform duration-300 ease-in-out
        ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}
    >
      <div className="flex items-center justify-between px-5 py-5 border-b border-dark-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
              <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="text-lg font-bold text-white tracking-tight">TeamFlow</span>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden text-dark-400 hover:text-white transition-colors"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-dark-800">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-dark-800/50 mb-2">
          <Avatar name={user?.name} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-dark-100 truncate">{user?.name}</p>
            <p className="text-xs text-dark-500 truncate">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="sidebar-link w-full text-red-400 hover:text-red-300 hover:bg-red-500/10"
        >
          <ArrowRightOnRectangleIcon className="w-5 h-5" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
