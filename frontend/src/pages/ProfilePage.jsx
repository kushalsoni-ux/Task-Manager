import { useState } from 'react';
import { UserCircleIcon, KeyIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { usersAPI } from '../api/users';
import useAuthStore from '../context/authStore';
import Avatar from '../components/ui/Avatar';
import { RoleBadge } from '../components/ui/Badge';

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const [nameForm, setNameForm] = useState({ name: user?.name || '' });
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [nameLoading, setNameLoading] = useState(false);
  const [passLoading, setPassLoading] = useState(false);

  const handleNameSave = async (e) => {
    e.preventDefault();
    setNameLoading(true);
    try {
      const { data } = await usersAPI.updateProfile({ name: nameForm.name });
      updateUser(data.user);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setNameLoading(false);
    }
  };

  const handlePassSave = async (e) => {
    e.preventDefault();
    if (passForm.newPassword !== passForm.confirm) {
      toast.error('Passwords do not match');
      return;
    }
    if (passForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setPassLoading(true);
    try {
      await usersAPI.changePassword({
        currentPassword: passForm.currentPassword,
        newPassword: passForm.newPassword,
      });
      toast.success('Password changed!');
      setPassForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to change password');
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="card p-6">
        <div className="flex items-center gap-5">
          <Avatar name={user?.name} size="xl" />
          <div>
            <h2 className="text-xl font-bold text-white">{user?.name}</h2>
            <p className="text-dark-400 text-sm">{user?.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <RoleBadge role={user?.role} />
              {user?.role === 'ADMIN' && (
                <div className="flex items-center gap-1 text-xs text-brand-400">
                  <ShieldCheckIcon className="w-3.5 h-3.5" />
                  Full access
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center gap-2 mb-5">
          <UserCircleIcon className="w-5 h-5 text-brand-400" />
          <h3 className="text-base font-semibold text-white">Edit Profile</h3>
        </div>
        <form onSubmit={handleNameSave} className="space-y-4">
          <div>
            <label className="label">Full name</label>
            <input
              className="input"
              value={nameForm.name}
              onChange={(e) => setNameForm({ name: e.target.value })}
              required
              minLength={2}
            />
          </div>
          <div>
            <label className="label">Email address</label>
            <input
              className="input opacity-60 cursor-not-allowed"
              value={user?.email}
              disabled
            />
            <p className="text-xs text-dark-600 mt-1">Email cannot be changed</p>
          </div>
          <button type="submit" disabled={nameLoading} className="btn-primary">
            {nameLoading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            Save Changes
          </button>
        </form>
      </div>

      <div className="card p-6">
        <div className="flex items-center gap-2 mb-5">
          <KeyIcon className="w-5 h-5 text-brand-400" />
          <h3 className="text-base font-semibold text-white">Change Password</h3>
        </div>
        <form onSubmit={handlePassSave} className="space-y-4">
          <div>
            <label className="label">Current password</label>
            <input
              type="password"
              className="input"
              placeholder="••••••••"
              value={passForm.currentPassword}
              onChange={(e) => setPassForm({ ...passForm, currentPassword: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="label">New password</label>
            <input
              type="password"
              className="input"
              placeholder="Min. 6 characters"
              value={passForm.newPassword}
              onChange={(e) => setPassForm({ ...passForm, newPassword: e.target.value })}
              required
              minLength={6}
            />
          </div>
          <div>
            <label className="label">Confirm new password</label>
            <input
              type="password"
              className="input"
              placeholder="••••••••"
              value={passForm.confirm}
              onChange={(e) => setPassForm({ ...passForm, confirm: e.target.value })}
              required
            />
          </div>
          <button type="submit" disabled={passLoading} className="btn-primary">
            {passLoading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            Update Password
          </button>
        </form>
      </div>

      <div className="card p-6">
        <h3 className="text-sm font-semibold text-dark-300 mb-4">Account Info</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-dark-500">User ID</span>
            <span className="text-dark-300 font-mono text-xs">{user?.id?.slice(0, 16)}...</span>
          </div>
          <div className="flex justify-between">
            <span className="text-dark-500">Role</span>
            <span className="text-dark-300">{user?.role}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
