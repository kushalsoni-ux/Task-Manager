import { useState, useEffect } from 'react';
import { UsersIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { usersAPI } from '../api/users';
import useAuthStore from '../context/authStore';
import Avatar from '../components/ui/Avatar';
import { RoleBadge } from '../components/ui/Badge';
import { PageSpinner } from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';

export default function TeamPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { user: currentUser } = useAuthStore();

  useEffect(() => {
    usersAPI.getAll()
      .then(({ data }) => setUsers(data.users))
      .finally(() => setLoading(false));
  }, []);

  const handleRoleChange = async (userId, role) => {
    try {
      const { data } = await usersAPI.updateRole(userId, role);
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role: data.user.role } : u));
      toast.success('Role updated');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update role');
    }
  };

  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const admins = filtered.filter((u) => u.role === 'ADMIN');
  const members = filtered.filter((u) => u.role === 'MEMBER');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Team</h2>
          <p className="text-dark-400 text-sm mt-0.5">{users.length} member{users.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="relative max-w-sm">
        <UsersIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
        <input
          className="input pl-9"
          placeholder="Search team members..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <PageSpinner />
      ) : filtered.length === 0 ? (
        <EmptyState icon={UsersIcon} title="No members found" />
      ) : (
        <div className="space-y-6">
          {admins.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-brand-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <ShieldCheckIcon className="w-3.5 h-3.5" />
                Admins ({admins.length})
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {admins.map((u) => (
                  <MemberCard
                    key={u.id}
                    user={u}
                    currentUser={currentUser}
                    onRoleChange={handleRoleChange}
                  />
                ))}
              </div>
            </div>
          )}

          {members.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-3">
                Members ({members.length})
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {members.map((u) => (
                  <MemberCard
                    key={u.id}
                    user={u}
                    currentUser={currentUser}
                    onRoleChange={handleRoleChange}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MemberCard({ user, currentUser, onRoleChange }) {
  const isCurrentUser = user.id === currentUser?.id;
  const canManage = currentUser?.role === 'ADMIN' && !isCurrentUser;

  return (
    <div className="card p-4 flex items-center gap-3">
      <Avatar name={user.name} size="lg" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-white truncate">{user.name}</p>
          {isCurrentUser && <span className="text-[10px] text-dark-600">(you)</span>}
        </div>
        <p className="text-xs text-dark-500 truncate">{user.email}</p>
        <div className="mt-2">
          {canManage ? (
            <select
              value={user.role}
              onChange={(e) => onRoleChange(user.id, e.target.value)}
              className="bg-dark-800 border border-dark-700 rounded-lg px-2 py-1 text-xs text-dark-300 focus:outline-none focus:border-brand-500/50 cursor-pointer"
            >
              <option value="MEMBER">MEMBER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          ) : (
            <RoleBadge role={user.role} />
          )}
        </div>
      </div>
    </div>
  );
}
