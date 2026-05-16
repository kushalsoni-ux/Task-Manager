import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon, FolderIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { projectsAPI } from '../api/projects';
import Modal from '../components/ui/Modal';
import Avatar from '../components/ui/Avatar';
import EmptyState from '../components/ui/EmptyState';
import { PageSpinner } from '../components/ui/Spinner';

const PROJECT_COLORS = [
  '#3b82f6', '#6366f1', '#f59e0b', '#ef4444', '#10b981',
  '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#84cc16',
];

function ProjectCard({ project }) {
  return (
    <div className="card-hover p-5 flex flex-col">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ background: project.color }} />
          <h3 className="font-semibold text-white text-sm leading-tight">{project.name}</h3>
        </div>
        <span className={`badge text-xs ${project.status === 'ACTIVE' ? 'bg-brand-500/15 text-brand-400' : 'bg-dark-700 text-dark-400'}`}>
          {project.status}
        </span>
      </div>

      {project.description && (
        <p className="text-xs text-dark-500 mb-3 line-clamp-2">{project.description}</p>
      )}

      <div className="mb-3">
        <div className="flex justify-between text-xs text-dark-500 mb-1.5">
          <span>{project._count?.tasks || 0} tasks</span>
          <span>{project.progress}%</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${project.progress}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-1 mb-4">
        {Object.entries(project.taskStats || {}).map(([status, count]) => (
          <div key={status} className="text-center">
            <p className="text-sm font-semibold text-white">{count}</p>
            <p className="text-[10px] text-dark-600 leading-tight">{status.replace('_', ' ')}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mt-auto pt-3 border-t border-dark-800">
        <div className="flex -space-x-1.5">
          {project.members?.slice(0, 4).map((m) => (
            <Avatar key={m.userId} name={m.user?.name} size="xs" className="ring-1 ring-dark-900" />
          ))}
          {project.members?.length > 4 && (
            <div className="w-6 h-6 rounded-full bg-dark-700 ring-1 ring-dark-900 flex items-center justify-center text-[10px] text-dark-400">
              +{project.members.length - 4}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {project.dueDate && (
            <span className="text-xs text-dark-500">{format(new Date(project.dueDate), 'MMM d')}</span>
          )}
          <Link
            to={`/projects/${project.id}`}
            className="text-xs text-brand-400 hover:text-brand-300 font-medium"
          >
            Open
          </Link>
        </div>
      </div>
    </div>
  );
}

function CreateProjectModal({ isOpen, onClose, onCreated }) {
  const [form, setForm] = useState({ name: '', description: '', color: '#3b82f6', dueDate: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await projectsAPI.create(form);
      toast.success('Project created!');
      onCreated(data.project);
      onClose();
      setForm({ name: '', description: '', color: '#3b82f6', dueDate: '' });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Project">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Project name *</label>
          <input
            className="input"
            placeholder="e.g. Product Redesign 2025"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            minLength={2}
          />
        </div>
        <div>
          <label className="label">Description</label>
          <textarea
            className="input resize-none"
            rows={3}
            placeholder="What's this project about?"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>
        <div>
          <label className="label">Due date</label>
          <input
            type="date"
            className="input"
            value={form.dueDate}
            onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
          />
        </div>
        <div>
          <label className="label">Color</label>
          <div className="flex gap-2 flex-wrap">
            {PROJECT_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setForm({ ...form, color: c })}
                className={`w-7 h-7 rounded-full transition-all ${form.color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-dark-900 scale-110' : ''}`}
                style={{ background: c }}
              />
            ))}
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
            {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            Create Project
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [createOpen, setCreateOpen] = useState(false);

  const fetchProjects = () => {
    setLoading(true);
    projectsAPI.getAll()
      .then(({ data }) => setProjects(data.projects))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProjects(); }, []);

  const filtered = projects.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'ALL' || p.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Projects</h2>
          <p className="text-dark-400 text-sm mt-0.5">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setCreateOpen(true)} className="btn-primary">
          <PlusIcon className="w-4 h-4" />
          New Project
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
          <input
            className="input pl-9"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {['ALL', 'ACTIVE', 'COMPLETED', 'ON_HOLD'].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                filter === s
                  ? 'bg-brand-500/15 text-brand-400 border border-brand-500/30'
                  : 'bg-dark-800 text-dark-400 border border-dark-700 hover:text-dark-200'
              }`}
            >
              {s === 'ALL' ? 'All' : s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <PageSpinner />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={FolderIcon}
          title="No projects found"
          description={search ? 'Try a different search term' : 'Create your first project to get started'}
          action={
            !search && (
              <button onClick={() => setCreateOpen(true)} className="btn-primary">
                <PlusIcon className="w-4 h-4" />
                New Project
              </button>
            )
          }
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      <CreateProjectModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(p) => setProjects((prev) => [p, ...prev])}
      />
    </div>
  );
}
