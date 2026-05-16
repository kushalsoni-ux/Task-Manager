import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  PlusIcon, UserPlusIcon, TrashIcon, PencilIcon,
  ChevronLeftIcon, ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { format, isPast } from 'date-fns';
import toast from 'react-hot-toast';
import { projectsAPI } from '../api/projects';
import { tasksAPI } from '../api/tasks';
import { usersAPI } from '../api/users';
import useAuthStore from '../context/authStore';
import Modal from '../components/ui/Modal';
import Avatar from '../components/ui/Avatar';
import { PriorityBadge, RoleBadge } from '../components/ui/Badge';
import { PageSpinner } from '../components/ui/Spinner';

const STATUSES = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'];
const STATUS_LABELS = { TODO: 'To Do', IN_PROGRESS: 'In Progress', IN_REVIEW: 'In Review', DONE: 'Done' };
const STATUS_COLORS = {
  TODO: 'border-dark-700',
  IN_PROGRESS: 'border-blue-500/40',
  IN_REVIEW: 'border-purple-500/40',
  DONE: 'border-brand-500/40',
};

function buildTaskFormState(task) {
  return {
    title: task.title,
    description: task.description || '',
    status: task.status,
    priority: task.priority,
    dueDate: task.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd') : '',
    assigneeId: task.assigneeId || '',
    tags: task.tags?.join(', ') || '',
  };
}

function TaskCard({ task, onUpdate, onDelete, members }) {
  const [editing, setEditing] = useState(false);
  const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && task.status !== 'DONE';

  const handleStatusChange = async (status) => {
    try {
      const { data } = await tasksAPI.updateStatus(task.id, status);
      onUpdate(data.task);
    } catch {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className={`bg-dark-800 border border-dark-700 rounded-xl p-4 hover:border-dark-600 transition-all group ${isOverdue ? 'border-red-500/30' : ''}`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-sm font-medium text-dark-100 leading-snug flex-1">{task.title}</p>
        <button
          onClick={() => setEditing(true)}
          className="opacity-0 group-hover:opacity-100 text-dark-500 hover:text-dark-300 transition-all p-0.5"
        >
          <PencilIcon className="w-3.5 h-3.5" />
        </button>
      </div>

      {task.description && (
        <p className="text-xs text-dark-500 mb-3 line-clamp-2">{task.description}</p>
      )}

      <div className="flex flex-wrap gap-1.5 mb-3">
        <PriorityBadge priority={task.priority} />
        {task.tags?.map((tag) => (
          <span key={tag} className="badge bg-dark-700 text-dark-400">{tag}</span>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {task.assignee ? (
            <div className="flex items-center gap-1.5">
              <Avatar name={task.assignee.name} size="xs" />
              <span className="text-xs text-dark-500">{task.assignee.name.split(' ')[0]}</span>
            </div>
          ) : (
            <span className="text-xs text-dark-600">Unassigned</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {task.dueDate && (
            <span className={`text-xs ${isOverdue ? 'text-red-400' : 'text-dark-500'}`}>
              {isOverdue && <ExclamationTriangleIcon className="inline w-3 h-3 mr-0.5" />}
              {format(new Date(task.dueDate), 'MMM d')}
            </span>
          )}
          {task.commentCount > 0 && (
            <span className="text-xs text-dark-600">{task.commentCount} comment{task.commentCount !== 1 ? 's' : ''}</span>
          )}
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-dark-700">
        <select
          value={task.status}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="w-full bg-dark-900 border border-dark-700 rounded-lg px-2 py-1.5 text-xs text-dark-300 focus:outline-none focus:border-brand-500/50"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </select>
      </div>

      {editing && (
        <EditTaskModal
          task={task}
          members={members}
          onClose={() => setEditing(false)}
          onSync={onUpdate}
          onUpdated={(t) => { onUpdate(t); setEditing(false); }}
          onDeleted={() => { onDelete(task.id); setEditing(false); }}
        />
      )}
    </div>
  );
}

function EditTaskModal({ task, members, onClose, onSync, onUpdated, onDeleted }) {
  const [taskDetails, setTaskDetails] = useState(task);
  const [form, setForm] = useState(buildTaskFormState(task));
  const [loading, setLoading] = useState(false);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState(task.comments || []);
  const [commentsLoading, setCommentsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    setCommentsLoading(true);
    tasksAPI.getById(task.id)
      .then(({ data }) => {
        if (!active) return;
        setTaskDetails(data.task);
        setForm(buildTaskFormState(data.task));
        setComments(data.task.comments || []);
        onSync(data.task);
      })
      .catch(() => {
        if (active) toast.error('Failed to load task details');
      })
      .finally(() => {
        if (active) setCommentsLoading(false);
      });

    return () => { active = false; };
  }, [task.id]);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await tasksAPI.update(task.id, {
        ...form,
        tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        assigneeId: form.assigneeId || null,
        dueDate: form.dueDate || null,
      });
      setTaskDetails(data.task);
      toast.success('Task updated');
      onUpdated(data.task);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this task?')) return;
    try {
      await tasksAPI.delete(task.id);
      toast.success('Task deleted');
      onDeleted();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    try {
      const { data } = await tasksAPI.addComment(task.id, comment);
      const nextComments = [...comments, data.comment];
      const nextTask = { ...taskDetails, comments: nextComments, commentCount: nextComments.length };
      setTaskDetails(nextTask);
      setComments(nextComments);
      onSync(nextTask);
      setComment('');
    } catch {
      toast.error('Failed to add comment');
    }
  };

  return (
    <Modal isOpen onClose={onClose} title="Edit Task" size="lg">
      <div className="grid lg:grid-cols-2 gap-6">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="label">Title *</label>
            <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input resize-none" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Status</label>
              <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Priority</label>
              <select className="input" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                {['LOW', 'MEDIUM', 'HIGH', 'URGENT'].map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Assignee</label>
            <select className="input" value={form.assigneeId} onChange={(e) => setForm({ ...form, assigneeId: e.target.value })}>
              <option value="">Unassigned</option>
              {members.map((m) => (
                <option key={m.userId} value={m.userId}>{m.user?.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Due date</label>
            <input type="date" className="input" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
          </div>
          <div>
            <label className="label">Tags (comma separated)</label>
            <input className="input" placeholder="frontend, bug, urgent" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={handleDelete} className="btn-danger">
              <TrashIcon className="w-4 h-4" />
            </button>
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
              {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              Save
            </button>
          </div>
        </form>

        <div className="flex flex-col">
          <h4 className="text-sm font-semibold text-dark-300 mb-3">Comments ({comments.length})</h4>
          <div className="flex-1 space-y-3 max-h-64 overflow-y-auto mb-4">
            {commentsLoading ? (
              <div className="flex items-center justify-center py-6">
                <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : comments.length === 0 ? (
              <p className="text-xs text-dark-600 text-center py-4">No comments yet</p>
            ) : (
              comments.map((c) => (
                <div key={c.id} className="flex gap-2.5">
                  <Avatar name={c.author?.name} size="xs" className="mt-0.5 flex-shrink-0" />
                  <div className="flex-1 bg-dark-800 rounded-lg p-2.5">
                    <p className="text-xs font-medium text-dark-300 mb-1">{c.author?.name}</p>
                    <p className="text-xs text-dark-400">{c.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>
          <form onSubmit={handleComment} className="flex gap-2">
            <input
              className="input flex-1 text-xs"
              placeholder="Add a comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <button type="submit" className="btn-primary px-3 py-2">
              <PlusIcon className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </Modal>
  );
}

function CreateTaskModal({ isOpen, onClose, projectId, members, onCreated }) {
  const [form, setForm] = useState({
    title: '', description: '', priority: 'MEDIUM', dueDate: '', assigneeId: '', tags: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await tasksAPI.create({
        ...form,
        projectId,
        tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        assigneeId: form.assigneeId || null,
        dueDate: form.dueDate || null,
      });
      toast.success('Task created!');
      onCreated(data.task);
      onClose();
      setForm({ title: '', description: '', priority: 'MEDIUM', dueDate: '', assigneeId: '', tags: '' });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Task">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Title *</label>
          <input className="input" placeholder="What needs to be done?" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        </div>
        <div>
          <label className="label">Description</label>
          <textarea className="input resize-none" rows={3} placeholder="Add details..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Priority</label>
            <select className="input" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
              {['LOW', 'MEDIUM', 'HIGH', 'URGENT'].map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Assignee</label>
            <select className="input" value={form.assigneeId} onChange={(e) => setForm({ ...form, assigneeId: e.target.value })}>
              <option value="">Unassigned</option>
              {members.map((m) => (
                <option key={m.userId} value={m.userId}>{m.user?.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="label">Due date</label>
          <input type="date" className="input" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
        </div>
        <div>
          <label className="label">Tags</label>
          <input className="input" placeholder="frontend, bug, design" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
        </div>
        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
            {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            Create Task
          </button>
        </div>
      </form>
    </Modal>
  );
}

function AddMemberModal({ isOpen, onClose, projectId, existingMembers, onAdded }) {
  const [users, setUsers] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      usersAPI.getAll().then(({ data }) => {
        const existingIds = existingMembers.map((m) => m.userId);
        setUsers(data.users.filter((u) => !existingIds.includes(u.id)));
      });
    }
  }, [isOpen, existingMembers]);

  const handleAdd = async () => {
    if (!selectedId) return;
    setLoading(true);
    try {
      const { data } = await projectsAPI.addMember(projectId, { userId: selectedId });
      toast.success('Member added!');
      onAdded(data.member);
      onClose();
      setSelectedId('');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add member');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Member" size="sm">
      <div className="space-y-4">
        <div>
          <label className="label">Select user</label>
          <select className="input" value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
            <option value="">Choose a user...</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
            ))}
          </select>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
          <button onClick={handleAdd} disabled={!selectedId || loading} className="btn-primary flex-1 justify-center">
            {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            Add Member
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('board');

  const fetchProject = () => {
    projectsAPI.getById(id)
      .then(({ data }) => setProject(data.project))
      .catch(() => navigate('/projects'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProject(); }, [id]);

  if (loading) return <PageSpinner />;
  if (!project) return null;

  const isAdmin = user?.role === 'ADMIN' || project.owner?.id === user?.id ||
    project.members?.find((m) => m.userId === user?.id)?.role === 'ADMIN';

  const tasksByStatus = STATUSES.reduce((acc, s) => {
    acc[s] = project.tasks?.filter((t) => t.status === s) || [];
    return acc;
  }, {});

  const handleTaskUpdate = (updated) => {
    setProject((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => t.id === updated.id ? updated : t),
    }));
  };

  const handleTaskDelete = (taskId) => {
    setProject((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => t.id !== taskId),
    }));
  };

  const handleTaskCreated = (task) => {
    setProject((prev) => ({ ...prev, tasks: [task, ...prev.tasks] }));
  };

  const handleMemberAdded = (member) => {
    setProject((prev) => ({ ...prev, members: [...prev.members, member] }));
  };

  const handleRemoveMember = async (userId) => {
    if (!confirm('Remove this member?')) return;
    try {
      await projectsAPI.removeMember(id, userId);
      setProject((prev) => ({ ...prev, members: prev.members.filter((m) => m.userId !== userId) }));
      toast.success('Member removed');
    } catch {
      toast.error('Failed to remove member');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <button
          onClick={() => navigate('/projects')}
          className="flex items-center gap-1.5 text-dark-400 hover:text-white text-sm mb-4 transition-colors"
        >
          <ChevronLeftIcon className="w-4 h-4" />
          Projects
        </button>

        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full flex-shrink-0" style={{ background: project.color }} />
            <div>
              <h2 className="text-xl font-bold text-white">{project.name}</h2>
              {project.description && (
                <p className="text-dark-400 text-sm mt-0.5">{project.description}</p>
              )}
            </div>
          </div>
          {isAdmin && (
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={() => setAddMemberOpen(true)} className="btn-secondary text-sm">
                <UserPlusIcon className="w-4 h-4" />
                Add Member
              </button>
              <button onClick={() => setCreateTaskOpen(true)} className="btn-primary text-sm">
                <PlusIcon className="w-4 h-4" />
                New Task
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-6 mt-4">
          <div className="progress-bar flex-1 max-w-xs">
            <div className="progress-fill" style={{ width: `${project.progress}%` }} />
          </div>
          <span className="text-sm text-dark-400">{project.progress}% complete</span>
          <span className="text-sm text-dark-500">{project.tasks?.length || 0} tasks</span>
          {project.dueDate && (
            <span className="text-sm text-dark-500">Due {format(new Date(project.dueDate), 'MMM d, yyyy')}</span>
          )}
        </div>
      </div>

      <div className="flex gap-1 border-b border-dark-800">
        {['board', 'members'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium capitalize transition-all border-b-2 -mb-px ${
              activeTab === tab
                ? 'text-brand-400 border-brand-400'
                : 'text-dark-400 border-transparent hover:text-dark-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'board' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {STATUSES.map((status) => (
            <div key={status} className={`bg-dark-900/50 border ${STATUS_COLORS[status]} rounded-xl p-3`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold text-dark-400 uppercase tracking-wider">
                  {STATUS_LABELS[status]}
                </h3>
                <span className="text-xs text-dark-600 bg-dark-800 px-2 py-0.5 rounded-full">
                  {tasksByStatus[status].length}
                </span>
              </div>
              <div className="space-y-3">
                {tasksByStatus[status].length === 0 ? (
                  <div className="text-center py-6 text-dark-700 text-xs">No tasks</div>
                ) : (
                  tasksByStatus[status].map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      members={project.members}
                      onUpdate={handleTaskUpdate}
                      onDelete={handleTaskDelete}
                    />
                  ))
                )}
              </div>
              {isAdmin && status === 'TODO' && (
                <button
                  onClick={() => setCreateTaskOpen(true)}
                  className="w-full mt-3 py-2 text-xs text-dark-600 hover:text-dark-400 border border-dashed border-dark-800 hover:border-dark-700 rounded-lg transition-all flex items-center justify-center gap-1"
                >
                  <PlusIcon className="w-3.5 h-3.5" />
                  Add task
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'members' && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-dark-300">{project.members?.length} Members</h3>
            {isAdmin && (
              <button onClick={() => setAddMemberOpen(true)} className="btn-secondary text-xs">
                <UserPlusIcon className="w-3.5 h-3.5" />
                Add Member
              </button>
            )}
          </div>
          <div className="space-y-3">
            {project.members?.map((member) => (
              <div key={member.userId} className="flex items-center justify-between p-3 bg-dark-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Avatar name={member.user?.name} size="md" />
                  <div>
                    <p className="text-sm font-medium text-dark-100">{member.user?.name}</p>
                    <p className="text-xs text-dark-500">{member.user?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <RoleBadge role={member.role} />
                  {isAdmin && member.userId !== project.owner?.id && member.userId !== user?.id && (
                    <button
                      onClick={() => handleRemoveMember(member.userId)}
                      className="text-dark-600 hover:text-red-400 transition-colors"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <CreateTaskModal
        isOpen={createTaskOpen}
        onClose={() => setCreateTaskOpen(false)}
        projectId={id}
        members={project.members || []}
        onCreated={handleTaskCreated}
      />

      <AddMemberModal
        isOpen={addMemberOpen}
        onClose={() => setAddMemberOpen(false)}
        projectId={id}
        existingMembers={project.members || []}
        onAdded={handleMemberAdded}
      />
    </div>
  );
}
