import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowPathIcon,
  BoltIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  FolderIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { format, formatDistanceToNow, isPast, isToday } from 'date-fns';
import { dashboardAPI } from '../api/dashboard';
import useAuthStore from '../context/authStore';
import { StatusBadge, PriorityBadge } from '../components/ui/Badge';
import Avatar from '../components/ui/Avatar';
import EmptyState from '../components/ui/EmptyState';
import { PageSpinner } from '../components/ui/Spinner';

const STATUS_META = {
  TODO: { label: 'To Do', color: '#475569' },
  IN_PROGRESS: { label: 'In Progress', color: '#3b82f6' },
  IN_REVIEW: { label: 'In Review', color: '#14b8a6' },
  DONE: { label: 'Done', color: '#2563eb' },
};

const STATUS_ORDER = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'];

function SectionHeading({ eyebrow, title, subtitle, action }) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-400/85">
            {eyebrow}
          </p>
        )}
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {subtitle && <p className="mt-1 text-sm text-dark-400">{subtitle}</p>}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

function HeroMetric({ label, value, note }) {
  return (
    <div className="flex h-full min-h-[112px] flex-col justify-between rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-3">
      <div>
        <p className="text-2xl font-semibold text-white">{value}</p>
        <p className="mt-1 text-xs font-medium uppercase tracking-[0.16em] text-dark-500">{label}</p>
      </div>
      <p className="mt-3 text-xs text-dark-400">{note}</p>
    </div>
  );
}

function DashboardStatCard({ icon: Icon, label, value, note, tone }) {
  const tones = {
    blue: 'bg-blue-500/12 text-blue-300',
    teal: 'bg-teal-500/12 text-teal-300',
    brand: 'bg-brand-500/12 text-brand-300',
    red: 'bg-red-500/12 text-red-300',
  };

  return (
    <div className="card flex h-full flex-col p-5">
      <div className="flex items-start justify-between gap-3">
        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${tones[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
        <SparklesIcon className="h-4 w-4 text-dark-700" />
      </div>
      <p className="mt-5 text-3xl font-semibold text-white">{value}</p>
      <p className="mt-1 text-sm font-medium text-dark-200">{label}</p>
      <p className="mt-2 text-xs text-dark-500">{note}</p>
    </div>
  );
}

function DueDateLabel({ date }) {
  if (!date) return <span className="text-xs text-dark-600">No deadline</span>;

  const parsedDate = new Date(date);
  if (isPast(parsedDate) && !isToday(parsedDate)) {
    return <span className="text-xs font-medium text-red-300">Overdue</span>;
  }
  if (isToday(parsedDate)) {
    return <span className="text-xs font-medium text-amber-300">Due today</span>;
  }
  return <span className="text-xs text-dark-500">{format(parsedDate, 'MMM d')}</span>;
}

function InsightMeter({ label, value, total, tone }) {
  const safeTotal = Math.max(total, 1);
  const width = value === 0 ? 0 : Math.max(10, Math.round((value / safeTotal) * 100));
  const tones = {
    slate: 'bg-slate-400',
    blue: 'bg-blue-400',
    teal: 'bg-teal-400',
    brand: 'bg-brand-400',
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs">
        <span className="text-dark-400">{label}</span>
        <span className="font-medium text-dark-200">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-dark-800">
        <div className={`h-full rounded-full ${tones[tone]}`} style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

function DashboardEmptyState({ icon, title, description, action }) {
  return (
    <EmptyState
      icon={icon}
      title={title}
      description={description}
      action={action}
      className="flex-1 py-12"
    />
  );
}

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const { user } = useAuthStore();

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError('');

    dashboardAPI.get()
      .then(({ data: response }) => {
        if (!active) return;
        setData(response);
      })
      .catch(() => {
        if (!active) return;
        setData(null);
        setError('Unable to load dashboard data right now.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [reloadKey]);

  if (loading) return <PageSpinner />;

  if (error) {
    return (
      <section className="card p-6">
        <DashboardEmptyState
          icon={ExclamationTriangleIcon}
          title="Dashboard unavailable"
          description={error}
          action={(
            <button onClick={() => setReloadKey((value) => value + 1)} className="btn-secondary">
              <ArrowPathIcon className="h-4 w-4" />
              Retry
            </button>
          )}
        />
      </section>
    );
  }

  if (!data) return null;

  const { stats, myTasks, recentTasks, upcomingTasks, topProjects } = data;
  const isAdmin = user?.role === 'ADMIN';
  const pieData = STATUS_ORDER
    .map((status) => ({
      key: status,
      name: STATUS_META[status].label,
      value: stats.tasksByStatus[status],
    }))
    .filter((entry) => entry.value > 0);

  const completionRate = stats.totalTasks > 0
    ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
    : 0;
  const dueSoonCount = upcomingTasks.length;
  const openTasks = stats.totalTasks - stats.completedTasks;
  const greetingName = user?.name?.split(' ')[0] || 'there';
  const dashboardLabel = isAdmin ? 'Admin Dashboard' : 'Tasker Dashboard';
  const dashboardTitle = isAdmin
    ? 'Keep the team portfolio aligned across projects, workload, and delivery risk.'
    : 'Stay focused on assigned work, deadlines, and the projects you contribute to.';
  const focusSummary = isAdmin
    ? (stats.overdueTasks > 0
      ? `${stats.overdueTasks} overdue item${stats.overdueTasks === 1 ? '' : 's'} need attention across active work.`
      : `${stats.activeProjects} active project${stats.activeProjects === 1 ? '' : 's'} are currently on track.`)
    : (myTasks.length > 0
      ? `${myTasks.length} active task${myTasks.length === 1 ? '' : 's'} are assigned to you right now.`
      : 'Your queue is clear right now. New assignments will appear here automatically.');

  const heroMetrics = isAdmin
    ? [
      {
        label: 'Active Projects',
        value: stats.activeProjects,
        note: `${stats.totalProjects} total visible projects`,
      },
      {
        label: 'Open Tasks',
        value: openTasks,
        note: stats.overdueTasks > 0
          ? `${stats.overdueTasks} overdue across the workspace`
          : 'No overdue items right now',
      },
      {
        label: 'Due This Week',
        value: dueSoonCount,
        note: dueSoonCount > 0 ? 'Upcoming deadlines to review' : 'No upcoming deadlines',
      },
    ]
    : [
      {
        label: 'Assigned To You',
        value: myTasks.length,
        note: myTasks.length > 0 ? 'Tasks currently on your list' : 'No active assignments right now',
      },
      {
        label: 'Due This Week',
        value: dueSoonCount,
        note: dueSoonCount > 0 ? 'Deadlines on your queue' : 'Nothing due this week',
      },
      {
        label: 'Projects Involved',
        value: stats.activeProjects,
        note: `${stats.totalProjects} accessible project${stats.totalProjects === 1 ? '' : 's'}`,
      },
    ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        <section className="relative overflow-hidden rounded-[28px] border border-brand-500/15 bg-gradient-to-br from-dark-900 via-dark-900 to-dark-950 px-5 py-5 shadow-[0_30px_80px_-40px_rgba(59,130,246,0.35)] sm:px-6 sm:py-6">
          <div className="absolute -right-20 -top-24 h-52 w-52 rounded-full bg-brand-500/12 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-40 w-40 rounded-full bg-blue-600/10 blur-3xl" />

          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-dark-300">
              <BoltIcon className="h-3.5 w-3.5 text-brand-300" />
              {dashboardLabel}
            </div>

            <div className="mt-5 flex flex-col gap-6 2xl:flex-row 2xl:items-start 2xl:justify-between">
              <div className="max-w-2xl min-w-0">
                <p className="text-sm text-dark-400">
                  Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
                  <span className="font-medium text-brand-300">{greetingName}</span>
                </p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl xl:text-4xl">
                  {dashboardTitle}
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-6 text-dark-300">
                  {focusSummary}
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Link to="/projects" className="btn-primary">
                    Review projects
                    <ChevronRightIcon className="h-4 w-4" />
                  </Link>
                  <Link to="/tasks" className="btn-secondary">
                    Check my tasks
                    <ChevronRightIcon className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 2xl:max-w-[360px] 2xl:grid-cols-1 2xl:justify-self-end 3xl:max-w-none 3xl:grid-cols-3">
                {heroMetrics.map((metric) => (
                  <HeroMetric
                    key={metric.label}
                    label={metric.label}
                    value={metric.value}
                    note={metric.note}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="card flex h-full flex-col p-5">
          <SectionHeading
            eyebrow="Status Mix"
            title={isAdmin ? 'Workspace workload' : 'My workload'}
            subtitle="A quick read on the current task distribution."
          />

          {pieData.length > 0 ? (
            <>
              <div className="relative h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={52}
                      outerRadius={78}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieData.map((entry) => (
                        <Cell key={entry.key} fill={STATUS_META[entry.key].color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: '#111a2d',
                        border: '1px solid rgba(148, 163, 184, 0.18)',
                        borderRadius: '16px',
                        fontSize: '12px',
                      }}
                      labelStyle={{ color: '#f1f5f9' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-semibold text-white">{completionRate}%</span>
                  <span className="text-xs uppercase tracking-[0.16em] text-dark-500">Completed</span>
                </div>
              </div>

              <div className="mt-2 space-y-4">
                {STATUS_ORDER.map((status) => (
                  <InsightMeter
                    key={status}
                    label={STATUS_META[status].label}
                    value={stats.tasksByStatus[status]}
                    total={stats.totalTasks}
                    tone={
                      status === 'TODO' ? 'slate' :
                      status === 'IN_PROGRESS' ? 'blue' :
                      status === 'IN_REVIEW' ? 'teal' : 'brand'
                    }
                  />
                ))}
              </div>
            </>
          ) : (
            <DashboardEmptyState
              icon={ClipboardDocumentListIcon}
              title="No task data yet"
              description="Task distribution will appear here once your workspace has active items."
            />
          )}
        </section>
      </div>

      <div className="grid auto-rows-fr gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DashboardStatCard
          icon={FolderIcon}
          label="Projects in motion"
          value={stats.activeProjects}
          note={`${stats.totalProjects} total visible projects`}
          tone="blue"
        />
        <DashboardStatCard
          icon={ClipboardDocumentListIcon}
          label="Open workload"
          value={openTasks}
          note={`${stats.totalTasks} tasks tracked overall`}
          tone="teal"
        />
        <DashboardStatCard
          icon={CheckCircleIcon}
          label="Completed tasks"
          value={stats.completedTasks}
          note={`${completionRate}% of tracked work is finished`}
          tone="brand"
        />
        <DashboardStatCard
          icon={ExclamationTriangleIcon}
          label="Needs attention"
          value={stats.overdueTasks}
          note={stats.overdueTasks === 0 ? 'No overdue tasks right now' : 'Past-due items to triage'}
          tone="red"
        />
      </div>

      <div className="grid items-stretch gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <section className="card flex h-full flex-col p-5">
          <SectionHeading
            eyebrow="Focus Queue"
            title={isAdmin ? 'Tasks assigned to you' : 'My tasks'}
            subtitle={isAdmin
              ? 'Your personal queue across the broader team workload.'
              : 'Your current work, ordered by urgency and due date.'}
            action={(
              <Link to="/tasks" className="text-sm font-medium text-brand-400 hover:text-brand-300">
                View all
              </Link>
            )}
          />

          {myTasks.length === 0 ? (
            <DashboardEmptyState
              icon={ClipboardDocumentListIcon}
              title="No active tasks"
              description={isAdmin
                ? 'Tasks assigned directly to you will appear here.'
                : 'New assignments will show up here as soon as they are available.'}
            />
          ) : (
            <div className="space-y-3">
              {myTasks.map((task) => (
                <div key={task.id} className="rounded-2xl border border-dark-800 bg-dark-900/55 px-4 py-4 transition-colors hover:border-dark-700">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-white">{task.title}</p>
                        <StatusBadge status={task.status} />
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
                        <span className="font-medium" style={{ color: task.project?.color }}>
                          {task.project?.name}
                        </span>
                        <DueDateLabel date={task.dueDate} />
                        {task.tags?.length > 0 ? (
                          <span className="break-words text-dark-500">{task.tags.slice(0, 2).join(' • ')}</span>
                        ) : null}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-start">
                      <PriorityBadge priority={task.priority} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="card flex h-full flex-col p-5">
          <SectionHeading
            eyebrow="Deadlines"
            title="Due this week"
            subtitle="Keep the next few deadlines visible and easy to scan."
          />

          {upcomingTasks.length === 0 ? (
            <DashboardEmptyState
              icon={CalendarDaysIcon}
              title="No upcoming deadlines"
              description="Nothing is due in the next seven days."
            />
          ) : (
            <div className="space-y-3">
              {upcomingTasks.map((task) => (
                <div key={task.id} className="rounded-2xl border border-dark-800 bg-dark-900/55 px-4 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white">{task.title}</p>
                      <p className="mt-1 text-xs text-dark-500">{task.project?.name}</p>
                    </div>
                    {task.assignee ? <Avatar name={task.assignee.name} size="xs" /> : null}
                  </div>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 text-dark-400">
                      <CalendarDaysIcon className="h-3.5 w-3.5" />
                      <span>{format(new Date(task.dueDate), 'EEE, MMM d')}</span>
                    </div>
                    <DueDateLabel date={task.dueDate} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <section className="card p-5">
        <SectionHeading
          eyebrow="Portfolio"
          title={isAdmin ? 'Active projects' : 'Projects you are involved in'}
          subtitle="A consistent view of progress, ownership, and current execution status."
          action={(
            <Link to="/projects" className="text-sm font-medium text-brand-400 hover:text-brand-300">
              See all projects
            </Link>
          )}
        />

        {topProjects.length === 0 ? (
          <DashboardEmptyState
            icon={FolderIcon}
            title="No active projects"
            description={isAdmin
              ? 'Projects with recent activity will appear here.'
              : 'Projects you are part of will appear here once they have activity.'}
          />
        ) : (
          <div className="grid auto-rows-fr gap-4 md:grid-cols-2 xl:grid-cols-4">
            {topProjects.map((project) => (
              <Link key={project.id} to={`/projects/${project.id}`} className="card-hover flex h-full flex-col p-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <div className="h-3 w-3 flex-shrink-0 rounded-full" style={{ background: project.color }} />
                    <h4 className="truncate text-sm font-semibold text-white">{project.name}</h4>
                  </div>
                  <span className="text-xs text-dark-500">{project.progress}%</span>
                </div>

                <p className="mt-3 line-clamp-2 text-xs text-dark-500">
                  {project.description || 'Project progress and team alignment will appear here as work moves forward.'}
                </p>

                <div className="mt-4">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${project.progress}%` }} />
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-xl bg-dark-800/70 px-3 py-2">
                    <p className="text-dark-500">Open tasks</p>
                    <p className="mt-1 text-sm font-semibold text-white">
                      {(project.taskStats?.TODO || 0) + (project.taskStats?.IN_PROGRESS || 0) + (project.taskStats?.IN_REVIEW || 0)}
                    </p>
                  </div>
                  <div className="rounded-xl bg-dark-800/70 px-3 py-2">
                    <p className="text-dark-500">Completed</p>
                    <p className="mt-1 text-sm font-semibold text-white">{project.taskStats?.DONE || 0}</p>
                  </div>
                </div>

                <div className="mt-auto flex items-center justify-between pt-4">
                  <div className="flex -space-x-1.5">
                    {project.members.slice(0, 4).map((member) => (
                      <Avatar
                        key={member.userId}
                        name={member.user.name}
                        size="xs"
                        className="ring-2 ring-dark-900"
                      />
                    ))}
                  </div>
                  <span className="text-xs text-dark-500">
                    {project.members.length} member{project.members.length === 1 ? '' : 's'}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="card p-5">
        <SectionHeading
          eyebrow="Recent Activity"
          title={isAdmin ? 'Latest task changes' : 'Recent project activity'}
          subtitle="A quick pulse on the work that changed most recently."
        />

        {recentTasks.length === 0 ? (
          <DashboardEmptyState
            icon={ClockIcon}
            title="No recent activity"
            description="Recent task updates will appear here once work starts moving."
          />
        ) : (
          <div className="space-y-4">
            {recentTasks.slice(0, 6).map((task) => (
              <div key={task.id} className="flex items-start gap-3">
                <Avatar name={task.creator?.name || task.assignee?.name} size="sm" className="mt-0.5" />
                <div className="min-w-0 flex-1 border-b border-dark-800/80 pb-4 last:border-b-0 last:pb-0">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <p className="text-sm text-dark-200">
                        <span className="font-medium text-white">{task.creator?.name}</span>{' '}
                        updated{' '}
                        <span className="font-medium text-brand-300">{task.title}</span>
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-dark-500">
                        <span>{task.project?.name}</span>
                        {task.updatedAt ? (
                          <span className="inline-flex items-center gap-1">
                            <ClockIcon className="h-3.5 w-3.5" />
                            {formatDistanceToNow(new Date(task.updatedAt), { addSuffix: true })}
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <PriorityBadge priority={task.priority} />
                      <StatusBadge status={task.status} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
