const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const DEMO_PASSWORD = 'Demo@1234';
const DEMO_HASH = bcrypt.hashSync(DEMO_PASSWORD, 12);

const now = Date.now();
const isoDaysFromNow = (days) => new Date(now + days * 24 * 60 * 60 * 1000).toISOString();

const baseUsers = [
  {
    id: 'user-admin',
    name: 'Alex Morgan',
    email: 'admin@demo.com',
    password: DEMO_HASH,
    role: 'ADMIN',
    avatar: 'AM',
    created_at: isoDaysFromNow(-60),
    updated_at: isoDaysFromNow(-2),
  },
  {
    id: 'user-jordan',
    name: 'Jordan Lee',
    email: 'jordan@demo.com',
    password: DEMO_HASH,
    role: 'MEMBER',
    avatar: 'JL',
    created_at: isoDaysFromNow(-58),
    updated_at: isoDaysFromNow(-2),
  },
  {
    id: 'user-sam',
    name: 'Sam Rivera',
    email: 'sam@demo.com',
    password: DEMO_HASH,
    role: 'MEMBER',
    avatar: 'SR',
    created_at: isoDaysFromNow(-56),
    updated_at: isoDaysFromNow(-1),
  },
  {
    id: 'user-taylor',
    name: 'Taylor Kim',
    email: 'taylor@demo.com',
    password: DEMO_HASH,
    role: 'MEMBER',
    avatar: 'TK',
    created_at: isoDaysFromNow(-54),
    updated_at: isoDaysFromNow(-1),
  },
];

const baseProjects = [
  {
    id: 'project-redesign',
    name: 'Product Redesign 2025',
    description: 'Complete overhaul of the product UI/UX with modern design principles.',
    color: '#10b981',
    status: 'ACTIVE',
    due_date: isoDaysFromNow(30),
    owner_id: 'user-admin',
    created_at: isoDaysFromNow(-35),
    updated_at: isoDaysFromNow(-1),
  },
  {
    id: 'project-api',
    name: 'API Integration Suite',
    description: 'Build and integrate third-party APIs for payments and analytics.',
    color: '#6366f1',
    status: 'ACTIVE',
    due_date: isoDaysFromNow(45),
    owner_id: 'user-admin',
    created_at: isoDaysFromNow(-30),
    updated_at: isoDaysFromNow(-2),
  },
  {
    id: 'project-mobile',
    name: 'Mobile App Launch',
    description: 'iOS and Android app development for the Q2 launch milestone.',
    color: '#f59e0b',
    status: 'ACTIVE',
    due_date: isoDaysFromNow(60),
    owner_id: 'user-jordan',
    created_at: isoDaysFromNow(-28),
    updated_at: isoDaysFromNow(-3),
  },
];

const baseProjectMembers = [
  { project_id: 'project-redesign', user_id: 'user-admin', role: 'ADMIN', joined_at: isoDaysFromNow(-35) },
  { project_id: 'project-redesign', user_id: 'user-jordan', role: 'MEMBER', joined_at: isoDaysFromNow(-34) },
  { project_id: 'project-redesign', user_id: 'user-sam', role: 'MEMBER', joined_at: isoDaysFromNow(-34) },
  { project_id: 'project-redesign', user_id: 'user-taylor', role: 'MEMBER', joined_at: isoDaysFromNow(-34) },
  { project_id: 'project-api', user_id: 'user-admin', role: 'ADMIN', joined_at: isoDaysFromNow(-30) },
  { project_id: 'project-api', user_id: 'user-jordan', role: 'MEMBER', joined_at: isoDaysFromNow(-29) },
  { project_id: 'project-api', user_id: 'user-taylor', role: 'MEMBER', joined_at: isoDaysFromNow(-29) },
  { project_id: 'project-mobile', user_id: 'user-jordan', role: 'ADMIN', joined_at: isoDaysFromNow(-28) },
  { project_id: 'project-mobile', user_id: 'user-sam', role: 'MEMBER', joined_at: isoDaysFromNow(-27) },
  { project_id: 'project-mobile', user_id: 'user-admin', role: 'MEMBER', joined_at: isoDaysFromNow(-27) },
];

const baseTasks = [
  {
    id: 'task-1',
    project_id: 'project-redesign',
    title: 'Design new dashboard wireframes',
    description: 'Create high-fidelity wireframes for the main dashboard.',
    status: 'DONE',
    priority: 'HIGH',
    due_date: isoDaysFromNow(-5),
    assignee_id: 'user-sam',
    creator_id: 'user-admin',
    tags: ['design', 'ux'],
    created_at: isoDaysFromNow(-16),
    updated_at: isoDaysFromNow(-5),
  },
  {
    id: 'task-2',
    project_id: 'project-redesign',
    title: 'Implement component library',
    description: 'Build reusable React components following the new design system.',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    due_date: isoDaysFromNow(7),
    assignee_id: 'user-jordan',
    creator_id: 'user-admin',
    tags: ['frontend', 'react'],
    created_at: isoDaysFromNow(-15),
    updated_at: isoDaysFromNow(-1),
  },
  {
    id: 'task-3',
    project_id: 'project-redesign',
    title: 'User testing sessions',
    description: 'Conduct 5 user testing sessions and document findings.',
    status: 'TODO',
    priority: 'MEDIUM',
    due_date: isoDaysFromNow(14),
    assignee_id: 'user-taylor',
    creator_id: 'user-admin',
    tags: ['research', 'ux'],
    created_at: isoDaysFromNow(-14),
    updated_at: isoDaysFromNow(-3),
  },
  {
    id: 'task-4',
    project_id: 'project-redesign',
    title: 'Accessibility audit',
    description: 'Run WCAG 2.1 AA compliance checks across all new components.',
    status: 'TODO',
    priority: 'MEDIUM',
    due_date: isoDaysFromNow(20),
    assignee_id: 'user-sam',
    creator_id: 'user-admin',
    tags: ['a11y', 'qa'],
    created_at: isoDaysFromNow(-13),
    updated_at: isoDaysFromNow(-2),
  },
  {
    id: 'task-5',
    project_id: 'project-redesign',
    title: 'Dark mode implementation',
    description: 'Implement full dark mode support with system preference detection.',
    status: 'IN_REVIEW',
    priority: 'LOW',
    due_date: isoDaysFromNow(10),
    assignee_id: 'user-jordan',
    creator_id: 'user-admin',
    tags: ['frontend', 'theming'],
    created_at: isoDaysFromNow(-12),
    updated_at: isoDaysFromNow(-2),
  },
  {
    id: 'task-6',
    project_id: 'project-api',
    title: 'Stripe payment integration',
    description: 'Integrate Stripe for subscription billing with webhook handling.',
    status: 'IN_PROGRESS',
    priority: 'URGENT',
    due_date: isoDaysFromNow(5),
    assignee_id: 'user-admin',
    creator_id: 'user-admin',
    tags: ['payments', 'backend'],
    created_at: isoDaysFromNow(-11),
    updated_at: isoDaysFromNow(-1),
  },
  {
    id: 'task-7',
    project_id: 'project-api',
    title: 'SendGrid email service',
    description: 'Set up transactional email templates and delivery pipeline.',
    status: 'DONE',
    priority: 'HIGH',
    due_date: isoDaysFromNow(-3),
    assignee_id: 'user-jordan',
    creator_id: 'user-admin',
    tags: ['email', 'backend'],
    created_at: isoDaysFromNow(-10),
    updated_at: isoDaysFromNow(-3),
  },
  {
    id: 'task-8',
    project_id: 'project-api',
    title: 'Analytics dashboard API',
    description: 'Build REST endpoints for analytics data aggregation.',
    status: 'TODO',
    priority: 'MEDIUM',
    due_date: isoDaysFromNow(-2),
    assignee_id: 'user-taylor',
    creator_id: 'user-admin',
    tags: ['analytics', 'api'],
    created_at: isoDaysFromNow(-9),
    updated_at: isoDaysFromNow(-2),
  },
  {
    id: 'task-9',
    project_id: 'project-mobile',
    title: 'React Native setup & navigation',
    description: 'Initialize RN project with Expo and configure navigation stack.',
    status: 'DONE',
    priority: 'HIGH',
    due_date: isoDaysFromNow(-10),
    assignee_id: 'user-jordan',
    creator_id: 'user-jordan',
    tags: ['mobile', 'setup'],
    created_at: isoDaysFromNow(-18),
    updated_at: isoDaysFromNow(-10),
  },
  {
    id: 'task-10',
    project_id: 'project-mobile',
    title: 'Push notification service',
    description: 'Implement FCM push notifications for iOS and Android.',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    due_date: isoDaysFromNow(8),
    assignee_id: 'user-sam',
    creator_id: 'user-jordan',
    tags: ['mobile', 'notifications'],
    created_at: isoDaysFromNow(-8),
    updated_at: isoDaysFromNow(-1),
  },
  {
    id: 'task-11',
    project_id: 'project-mobile',
    title: 'App Store submission prep',
    description: 'Prepare screenshots, descriptions, and metadata for App Store review.',
    status: 'TODO',
    priority: 'URGENT',
    due_date: isoDaysFromNow(-1),
    assignee_id: 'user-admin',
    creator_id: 'user-jordan',
    tags: ['launch', 'marketing'],
    created_at: isoDaysFromNow(-7),
    updated_at: isoDaysFromNow(-1),
  },
];

const baseNotifications = [
  {
    id: 'notif-1',
    type: 'TASK_ASSIGNED',
    message: 'You were assigned to "Implement component library"',
    user_id: 'user-jordan',
    read: false,
    created_at: isoDaysFromNow(-1),
  },
  {
    id: 'notif-2',
    type: 'TASK_ASSIGNED',
    message: 'You were assigned to "Push notification service"',
    user_id: 'user-sam',
    read: false,
    created_at: isoDaysFromNow(-1),
  },
  {
    id: 'notif-3',
    type: 'PROJECT_INVITE',
    message: 'You were added to "Product Redesign 2025"',
    user_id: 'user-taylor',
    read: true,
    created_at: isoDaysFromNow(-3),
  },
  {
    id: 'notif-4',
    type: 'TASK_OVERDUE',
    message: '"Analytics dashboard API" is overdue',
    user_id: 'user-admin',
    read: false,
    created_at: isoDaysFromNow(-1),
  },
];

const store = {
  users: new Map(baseUsers.map((user) => [user.id, { ...user }])),
  projects: baseProjects.map((project) => ({ ...project })),
  projectMembers: baseProjectMembers.map((member) => ({ ...member })),
  tasks: baseTasks.map((task) => ({ ...task })),
  notifications: baseNotifications.map((notification) => ({ ...notification })),
};

const PRIORITY_ORDER = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };

const getInitials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'TF';

const clone = (value) => JSON.parse(JSON.stringify(value));

const getSafeUser = (user) => {
  if (!user) return null;
  const { password, ...safeUser } = user;
  return clone(safeUser);
};

const getFallbackUserByEmail = (email) => {
  const normalizedEmail = email?.trim().toLowerCase();
  return Array.from(store.users.values()).find((user) => user.email.toLowerCase() === normalizedEmail) || null;
};

const getFallbackUserById = (userId) => store.users.get(userId) || null;

const createFallbackUser = async ({ name, email, password }) => {
  const normalizedEmail = email.trim().toLowerCase();
  const existing = getFallbackUserByEmail(normalizedEmail);
  if (existing) return null;

  const user = {
    id: crypto.randomUUID(),
    name: name.trim(),
    email: normalizedEmail,
    password: await bcrypt.hash(password, 12),
    role: 'MEMBER',
    avatar: getInitials(name),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  store.users.set(user.id, user);
  return getSafeUser(user);
};

const verifyFallbackPassword = async (user, password) => {
  if (!user?.password) return false;
  return bcrypt.compare(password, user.password);
};

const ensureTokenUser = (decoded) => ({
  id: decoded.id,
  name: decoded.name || 'TeamFlow User',
  email: decoded.email,
  role: decoded.role || 'MEMBER',
  avatar: decoded.avatar || getInitials(decoded.name || decoded.email || 'TF'),
  created_at: decoded.createdAt || new Date().toISOString(),
  updated_at: new Date().toISOString(),
});

const getUserWithFallback = (decoded) => getSafeUser(getFallbackUserById(decoded.id)) || ensureTokenUser(decoded);

const getAccessibleProjects = (user) => {
  if (user.role === 'ADMIN') return store.projects.map(clone);

  const memberProjectIds = new Set(
    store.projectMembers
      .filter((member) => member.user_id === user.id)
      .map((member) => member.project_id)
  );

  return store.projects
    .filter((project) => project.owner_id === user.id || memberProjectIds.has(project.id))
    .map(clone);
};

const getAccessibleTasks = (user, projects) => {
  const projectIds = new Set(projects.map((project) => project.id));
  return store.tasks
    .filter((task) => projectIds.has(task.project_id))
    .map(clone);
};

const attachProject = (task, projectsById) => ({
  ...task,
  project: projectsById[task.project_id]
    ? {
        id: projectsById[task.project_id].id,
        name: projectsById[task.project_id].name,
        color: projectsById[task.project_id].color,
      }
    : null,
});

const attachUsers = (task, usersById) => ({
  ...task,
  assignee: task.assignee_id ? getSafeUser(usersById[task.assignee_id]) : null,
  creator: getSafeUser(usersById[task.creator_id]),
});

const getProjectMembers = (projectId) =>
  store.projectMembers
    .filter((member) => member.project_id === projectId)
    .map((member) => ({
      user_id: member.user_id,
      role: member.role,
      joined_at: member.joined_at,
      user: getSafeUser(store.users.get(member.user_id)),
    }));

const getFallbackDashboard = (user) => {
  const nowDate = Date.now();
  const projects = getAccessibleProjects(user);
  const projectsById = Object.fromEntries(projects.map((project) => [project.id, project]));
  const usersById = Object.fromEntries(Array.from(store.users.values()).map((entry) => [entry.id, entry]));
  const tasks = getAccessibleTasks(user, projects);

  const statusMap = { TODO: 0, IN_PROGRESS: 0, IN_REVIEW: 0, DONE: 0 };
  tasks.forEach((task) => {
    statusMap[task.status] = (statusMap[task.status] || 0) + 1;
  });

  const overdueTasks = tasks.filter(
    (task) => task.status !== 'DONE' && task.due_date && new Date(task.due_date).getTime() < nowDate
  ).length;

  const myTasks = tasks
    .filter((task) => task.assignee_id === user.id && task.status !== 'DONE')
    .sort((left, right) => {
      const priorityCompare = (PRIORITY_ORDER[left.priority] ?? 99) - (PRIORITY_ORDER[right.priority] ?? 99);
      if (priorityCompare !== 0) return priorityCompare;
      return new Date(left.due_date || 0).getTime() - new Date(right.due_date || 0).getTime();
    })
    .slice(0, 5)
    .map((task) => attachProject(task, projectsById));

  const recentTasks = tasks
    .slice()
    .sort((left, right) => new Date(right.updated_at).getTime() - new Date(left.updated_at).getTime())
    .slice(0, 8)
    .map((task) => attachUsers(attachProject(task, projectsById), usersById));

  const upcomingTasks = tasks
    .filter((task) => {
      if (!task.due_date || task.status === 'DONE') return false;
      const time = new Date(task.due_date).getTime();
      return time >= nowDate && time <= nowDate + 7 * 24 * 60 * 60 * 1000;
    })
    .sort((left, right) => new Date(left.due_date).getTime() - new Date(right.due_date).getTime())
    .slice(0, 5)
    .map((task) => attachUsers(attachProject(task, projectsById), usersById));

  const topProjects = projects
    .filter((project) => project.status === 'ACTIVE')
    .slice()
    .sort((left, right) => new Date(right.updated_at).getTime() - new Date(left.updated_at).getTime())
    .slice(0, 4)
    .map((project) => {
      const projectTasks = tasks.filter((task) => task.project_id === project.id);
      const taskStats = { TODO: 0, IN_PROGRESS: 0, IN_REVIEW: 0, DONE: 0 };
      projectTasks.forEach((task) => {
        taskStats[task.status] = (taskStats[task.status] || 0) + 1;
      });
      const total = Object.values(taskStats).reduce((sum, value) => sum + value, 0);
      const members = getProjectMembers(project.id)
        .slice(0, 4)
        .map((member) => ({ userId: member.user_id, user: member.user }));

      return {
        ...project,
        owner: getSafeUser(store.users.get(project.owner_id)),
        members,
        taskStats,
        progress: total > 0 ? Math.round((taskStats.DONE / total) * 100) : 0,
        _count: { tasks: total },
      };
    });

  return {
    stats: {
      totalProjects: projects.length,
      activeProjects: projects.filter((project) => project.status === 'ACTIVE').length,
      totalTasks: tasks.length,
      completedTasks: statusMap.DONE,
      overdueTasks,
      tasksByStatus: statusMap,
    },
    myTasks,
    recentTasks,
    upcomingTasks,
    topProjects,
  };
};

const getFallbackNotifications = (userId) => {
  const notifications = store.notifications
    .filter((notification) => notification.user_id === userId)
    .slice()
    .sort((left, right) => new Date(right.created_at).getTime() - new Date(left.created_at).getTime())
    .map(clone);

  return {
    notifications,
    unreadCount: notifications.filter((notification) => !notification.read).length,
  };
};

const markAllFallbackNotificationsAsRead = (userId) => {
  store.notifications.forEach((notification) => {
    if (notification.user_id === userId) notification.read = true;
  });
};

const markFallbackNotificationAsRead = (notificationId, userId) => {
  const notification = store.notifications.find((entry) => entry.id === notificationId && entry.user_id === userId);
  if (notification) notification.read = true;
};

const deleteFallbackNotification = (notificationId, userId) => {
  const index = store.notifications.findIndex((entry) => entry.id === notificationId && entry.user_id === userId);
  if (index >= 0) store.notifications.splice(index, 1);
};

module.exports = {
  createFallbackUser,
  deleteFallbackNotification,
  getFallbackDashboard,
  getFallbackNotifications,
  getFallbackUserByEmail,
  getFallbackUserById,
  getSafeUser,
  getUserWithFallback,
  markAllFallbackNotificationsAsRead,
  markFallbackNotificationAsRead,
  verifyFallbackPassword,
};
