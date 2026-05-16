const statusConfig = {
  TODO: { label: 'To Do', class: 'bg-dark-700 text-dark-300' },
  IN_PROGRESS: { label: 'In Progress', class: 'bg-blue-500/15 text-blue-400' },
  IN_REVIEW: { label: 'In Review', class: 'bg-purple-500/15 text-purple-400' },
  DONE: { label: 'Done', class: 'bg-brand-500/15 text-brand-400' },
};

const priorityConfig = {
  LOW: { label: 'Low', class: 'bg-dark-700 text-dark-400' },
  MEDIUM: { label: 'Medium', class: 'bg-yellow-500/15 text-yellow-400' },
  HIGH: { label: 'High', class: 'bg-orange-500/15 text-orange-400' },
  URGENT: { label: 'Urgent', class: 'bg-red-500/15 text-red-400' },
};

export function StatusBadge({ status }) {
  const config = statusConfig[status] || statusConfig.TODO;
  return (
    <span className={`badge ${config.class}`}>
      {config.label}
    </span>
  );
}

export function PriorityBadge({ priority }) {
  const config = priorityConfig[priority] || priorityConfig.MEDIUM;
  const dots = { LOW: 1, MEDIUM: 2, HIGH: 3, URGENT: 4 };
  return (
    <span className={`badge ${config.class}`}>
      {'●'.repeat(dots[priority] || 2)} {config.label}
    </span>
  );
}

export function RoleBadge({ role }) {
  return (
    <span className={`badge ${role === 'ADMIN' ? 'bg-brand-500/15 text-brand-400' : 'bg-dark-700 text-dark-400'}`}>
      {role}
    </span>
  );
}
