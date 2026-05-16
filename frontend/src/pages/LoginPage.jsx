import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import useAuthStore from '../context/authStore';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    if (role === 'admin') setForm({ email: 'admin@demo.com', password: 'Demo@1234' });
    else setForm({ email: 'jordan@demo.com', password: 'Demo@1234' });
  };

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center shrink-0">
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
              <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="text-lg font-bold text-white">TeamFlow</span>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-1">Sign in</h1>
          <p className="text-dark-400 text-sm">Enter your credentials to continue.</p>
        </div>

        <div className="flex gap-2 mb-5">
          <button
            type="button"
            onClick={() => fillDemo('admin')}
            className="flex-1 py-2 px-3 bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/30 text-brand-400 text-xs font-medium rounded-lg transition-all"
          >
            Demo Admin
          </button>
          <button
            type="button"
            onClick={() => fillDemo('member')}
            className="flex-1 py-2 px-3 bg-dark-800 hover:bg-dark-700 border border-dark-700 text-dark-300 text-xs font-medium rounded-lg transition-all"
          >
            Demo Member
          </button>
        </div>

        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-dark-800" />
          <span className="text-xs text-dark-600">or sign in manually</span>
          <div className="flex-1 h-px bg-dark-800" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Email address</label>
            <input
              type="email"
              className="input"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label className="label">Password</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                className="input pr-10"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-300"
              >
                {showPass ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full justify-center py-2.5 mt-2"
          >
            {loading && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="text-center text-sm text-dark-500 mt-6">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="text-brand-400 hover:text-brand-300 font-medium">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
