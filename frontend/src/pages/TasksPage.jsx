import { useState, useEffect } from 'react';
import {
  ClipboardDocumentListIcon, MagnifyingGlassIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { format, isPast, isToday } from 'date-fns';
import toast from 'react-hot-toast';
import { tasksAPI } from '../api/tasks';
import useAuthStore from '../context/authStore';
import { StatusBadge, PriorityBadge } from '../components/ui/Badge';
import Avatar from '../components/ui/Avatar';
import EmptyState from '../components/ui/EmptyState';
import { PageSpinner } from '../components/ui/Spinner';

const STATUSES = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'];
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

function TaskRow({ task, onStatusChange }) {
  const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && task.status !== 'DONE';
  const isDueToday = task.dueDate && isToday(new Date(task.dueDate));

  return (
    <div className={`flex items-center gap-4 p-4 bg-dark-900 border rounded-xl hover:border-dark-700 transition-all ${isOverdue ? 'border-red-500/20' : 'border-dark-800'}`}>
      <div className={`w-1 h-10 rounded-full flex-shrink-0 ${
        task.priority === 'URGENT' ? 'bg-red-500' :
        task.priority === 'HIGH' ? 'bg-orange-500' :
        task.priority === 'MEDIUM' ? 'bg-yellow-500' : 'bg-dark-600'
      }`} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-sm font-medium text-dark-100 truncate">{task.title}</p>
          {isOverdue && <ExclamationTriangleIcon className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-dark-500" style={{ color: task.project?.color }}>
            {task.project?.name}
          </span>
          {task.dueDate && (
            <span className={`text-xs ${isOverdue ? 'text-red-400' : isDueToday ? 'text-yellow-400' : 'text-dark-600'}`}>
              {isOverdue ? 'Overdue · ' : isDueToday ? 'Due today · ' : ''}{format(new Date(task.dueDate), 'MMM d')}
            </span>
          )}
          {task.tags?.map((tag) => (
            <span key={tag} className="badge bg-dark-800 text-dark-500 text-[10px]">{tag}</span>
          ))}
        </div>
      </div>

      <div className="flex-shrink-0">
        {task.assignee ? (
          <div className="flex items-center gap-1.5">
            <Avatar name={task.assignee.name} size="xs" />
            <span className="text-xs text-dark-500 hidden sm:block">{task.assignee.name.split(' ')[0]}</span>
          </div>
        ) : (
          <span className="text-xs text-dark-700">—</span>
        )}
      </div>

      <div className="flex-shrink-0 hidden sm:block">
        <PriorityBadge priority={task.priority} />
      </div>

      <div className="flex-shrink-0">
        <select
          value={task.status}
          onChange={(e) => onStatusChange(task.id, e.target.value)}
          className="bg-dark-800 border border-dark-700 rounded-lg px-2 py-1.5 text-xs text-dark-300 focus:outline-none focus:border-brand-500/50 cursor-pointer"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s.replace('_', ' ')}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [overdueOnly, setOverdueOnly] = useState(false);
  const { user } = useAuthStore();

  const fetchTasks = () => {
    const params = { assigneeId: user?.id };
    if (statusFilter) params.status = statusFilter;
    if (priorityFilter) params.priority = priorityFilter;
    if (overdueOnly) params.overdue = 'true';

    tasksAPI.getAll(params)
      .then(({ data }) => setTasks(data.tasks))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchTasks(); }, [statusFilter, priorityFilter, overdueOnly]);

  const handleStatusChange = async (taskId, status) => {
    try {
      const { data } = await tasksAPI.updateStatus(taskId, status);
      setTasks((prev) => prev.map((t) => t.id === taskId ? data.task : t));
      toast.success('Status updated');
    } catch {
      toast.error('Failed to update status');
    }
  };

  const filtered = tasks.filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.project?.name.toLowerCase().includes(search.toLowerCase())
  );

  const grouped = {
    overdue: filtered.filter((t) => t.dueDate && isPast(new Date(t.dueDate)) && t.status !== 'DONE'),
    active: filtered.filter((t) => t.status !== 'DONE' && !(t.dueDate && isPast(new Date(t.dueDate)))),
    done: filtered.filter((t) => t.status === 'DONE'),
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">My Tasks</h2>
        <p className="text-dark-400 text-sm mt-0.5">{tasks.length} task{tasks.length !== 1 ? 's' : ''} assigned to you</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
          <input
            className="input pl-9"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="input w-auto"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
        </select>
        <select
          className="input w-auto"
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
        >
          <option value="">All priorities</option>
          {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <button
          onClick={() => setOverdueOnly(!overdueOnly)}
          className={`px-3 py-2 rounded-lg text-xs font-medium transition-all border flex items-center gap-1.5 ${
            overdueOnly
              ? 'bg-red-500/15 text-red-400 border-red-500/30'
              : 'bg-dark-800 text-dark-400 border-dark-700 hover:text-dark-200'
          }`}
        >
          <ExclamationTriangleIcon className="w-3.5 h-3.5" />
          Overdue
        </button>
      </div>

      {loading ? (
        <PageSpinner />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={ClipboardDocumentListIcon}
          title="No tasks found"
          description="Tasks assigned to you will appear here"
        />
      ) : (
        <div className="space-y-6">
          {grouped.overdue.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <ExclamationTriangleIcon className="w-3.5 h-3.5" />
                Overdue ({grouped.overdue.length})
              </h3>
              <div className="space-y-2">
                {grouped.overdue.map((task) => (
                  <TaskRow key={task.id} task={task} onStatusChange={handleStatusChange} />
                ))}
              </div>
            </div>
          )}

          {grouped.active.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-3">
                Active ({grouped.active.length})
              </h3>
              <div className="space-y-2">
                {grouped.active.map((task) => (
                  <TaskRow key={task.id} task={task} onStatusChange={handleStatusChange} />
                ))}
              </div>
            </div>
          )}

          {grouped.done.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-brand-500/60 uppercase tracking-wider mb-3">
                Completed ({grouped.done.length})
              </h3>
              <div className="space-y-2 opacity-60">
                {grouped.done.map((task) => (
                  <TaskRow key={task.id} task={task} onStatusChange={handleStatusChange} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
