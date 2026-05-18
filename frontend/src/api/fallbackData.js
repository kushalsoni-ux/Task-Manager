const MODE_KEY = 'teamflow.storageMode';
const STATE_KEY = 'teamflow.fallbackState';
const USER_KEY = 'teamflow.user';
const DEMO_PASSWORD = 'Demo@1234';

const isBrowser = () => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const daysFromNow = (days) => new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

const buildInitialState = () => {
  const users = [
    {
      id: 'user-admin',
      name: 'Alex Morgan',
      email: 'admin@demo.com',
      role: 'ADMIN',
      avatar: 'AM',
      password: DEMO_PASSWORD,
      createdAt: daysFromNow(-60),
      updatedAt: daysFromNow(-2),
    },
    {
      id: 'user-jordan',
      name: 'Jordan Lee',
      email: 'jordan@demo.com',
      role: 'MEMBER',
      avatar: 'JL',
      password: DEMO_PASSWORD,
      createdAt: daysFromNow(-58),
      updatedAt: daysFromNow(-2),
    },
    {
      id: 'user-sam',
      name: 'Sam Rivera',
      email: 'sam@demo.com',
      role: 'MEMBER',
      avatar: 'SR',
      password: DEMO_PASSWORD,
      createdAt: daysFromNow(-56),
      updatedAt: daysFromNow(-1),
    },
    {
      id: 'user-taylor',
      name: 'Taylor Kim',
      email: 'taylor@demo.com',
      role: 'MEMBER',
      avatar: 'TK',
      password: DEMO_PASSWORD,
      createdAt: daysFromNow(-54),
      updatedAt: daysFromNow(-1),
    },
  ];

  const projects = [
    {
      id: 'project-redesign',
      name: 'Product Redesign 2025',
      description: 'Complete overhaul of the product UI/UX with modern design principles.',
      color: '#10b981',
      status: 'ACTIVE',
      dueDate: daysFromNow(30),
      ownerId: 'user-admin',
      createdAt: daysFromNow(-35),
      updatedAt: daysFromNow(-1),
    },
    {
      id: 'project-api',
      name: 'API Integration Suite',
      description: 'Build and integrate third-party APIs for payments and analytics.',
      color: '#6366f1',
      status: 'ACTIVE',
      dueDate: daysFromNow(45),
      ownerId: 'user-admin',
      createdAt: daysFromNow(-30),
      updatedAt: daysFromNow(-2),
    },
    {
      id: 'project-mobile',
      name: 'Mobile App Launch',
      description: 'iOS and Android app development for the Q2 launch milestone.',
      color: '#f59e0b',
      status: 'ACTIVE',
      dueDate: daysFromNow(60),
      ownerId: 'user-jordan',
      createdAt: daysFromNow(-28),
      updatedAt: daysFromNow(-3),
    },
  ];

  const projectMembers = [
    { projectId: 'project-redesign', userId: 'user-admin', role: 'ADMIN', joinedAt: daysFromNow(-35) },
    { projectId: 'project-redesign', userId: 'user-jordan', role: 'MEMBER', joinedAt: daysFromNow(-34) },
    { projectId: 'project-redesign', userId: 'user-sam', role: 'MEMBER', joinedAt: daysFromNow(-34) },
    { projectId: 'project-redesign', userId: 'user-taylor', role: 'MEMBER', joinedAt: daysFromNow(-34) },
    { projectId: 'project-api', userId: 'user-admin', role: 'ADMIN', joinedAt: daysFromNow(-30) },
    { projectId: 'project-api', userId: 'user-jordan', role: 'MEMBER', joinedAt: daysFromNow(-29) },
    { projectId: 'project-api', userId: 'user-taylor', role: 'MEMBER', joinedAt: daysFromNow(-29) },
    { projectId: 'project-mobile', userId: 'user-jordan', role: 'ADMIN', joinedAt: daysFromNow(-28) },
    { projectId: 'project-mobile', userId: 'user-sam', role: 'MEMBER', joinedAt: daysFromNow(-27) },
    { projectId: 'project-mobile', userId: 'user-admin', role: 'MEMBER', joinedAt: daysFromNow(-27) },
  ];

  const tasks = [
    {
      id: 'task-1',
      projectId: 'project-redesign',
      title: 'Design new dashboard wireframes',
      description: 'Create high-fidelity wireframes for the main dashboard.',
      status: 'DONE',
      priority: 'HIGH',
      dueDate: daysFromNow(-5),
      assigneeId: 'user-sam',
      creatorId: 'user-admin',
      tags: ['design', 'ux'],
      createdAt: daysFromNow(-16),
      updatedAt: daysFromNow(-5),
    },
    {
      id: 'task-2',
      projectId: 'project-redesign',
      title: 'Implement component library',
      description: 'Build reusable React components following the new design system.',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      dueDate: daysFromNow(7),
      assigneeId: 'user-jordan',
      creatorId: 'user-admin',
      tags: ['frontend', 'react'],
      createdAt: daysFromNow(-15),
      updatedAt: daysFromNow(-1),
    },
    {
      id: 'task-3',
      projectId: 'project-redesign',
      title: 'User testing sessions',
      description: 'Conduct 5 user testing sessions and document findings.',
      status: 'TODO',
      priority: 'MEDIUM',
      dueDate: daysFromNow(14),
      assigneeId: 'user-taylor',
      creatorId: 'user-admin',
      tags: ['research', 'ux'],
      createdAt: daysFromNow(-14),
      updatedAt: daysFromNow(-3),
    },
    {
      id: 'task-4',
      projectId: 'project-redesign',
      title: 'Accessibility audit',
      description: 'Run WCAG 2.1 AA compliance checks across all new components.',
      status: 'TODO',
      priority: 'MEDIUM',
      dueDate: daysFromNow(20),
      assigneeId: 'user-sam',
      creatorId: 'user-admin',
      tags: ['a11y', 'qa'],
      createdAt: daysFromNow(-13),
      updatedAt: daysFromNow(-2),
    },
    {
      id: 'task-5',
      projectId: 'project-redesign',
      title: 'Dark mode implementation',
      description: 'Implement full dark mode support with system preference detection.',
      status: 'IN_REVIEW',
      priority: 'LOW',
      dueDate: daysFromNow(10),
      assigneeId: 'user-jordan',
      creatorId: 'user-admin',
      tags: ['frontend', 'theming'],
      createdAt: daysFromNow(-12),
      updatedAt: daysFromNow(-2),
    },
    {
      id: 'task-6',
      projectId: 'project-api',
      title: 'Stripe payment integration',
      description: 'Integrate Stripe for subscription billing with webhook handling.',
      status: 'IN_PROGRESS',
      priority: 'URGENT',
      dueDate: daysFromNow(5),
      assigneeId: 'user-admin',
      creatorId: 'user-admin',
      tags: ['payments', 'backend'],
      createdAt: daysFromNow(-11),
      updatedAt: daysFromNow(-1),
    },
    {
      id: 'task-7',
      projectId: 'project-api',
      title: 'SendGrid email service',
      description: 'Set up transactional email templates and delivery pipeline.',
      status: 'DONE',
      priority: 'HIGH',
      dueDate: daysFromNow(-3),
      assigneeId: 'user-jordan',
      creatorId: 'user-admin',
      tags: ['email', 'backend'],
      createdAt: daysFromNow(-10),
      updatedAt: daysFromNow(-3),
    },
    {
      id: 'task-8',
      projectId: 'project-api',
      title: 'Analytics dashboard API',
      description: 'Build REST endpoints for analytics data aggregation.',
      status: 'TODO',
      priority: 'MEDIUM',
      dueDate: daysFromNow(-2),
      assigneeId: 'user-taylor',
      creatorId: 'user-admin',
      tags: ['analytics', 'api'],
      createdAt: daysFromNow(-9),
      updatedAt: daysFromNow(-2),
    },
    {
      id: 'task-9',
      projectId: 'project-mobile',
      title: 'React Native setup & navigation',
      description: 'Initialize RN project with Expo and configure navigation stack.',
      status: 'DONE',
      priority: 'HIGH',
      dueDate: daysFromNow(-10),
      assigneeId: 'user-jordan',
      creatorId: 'user-jordan',
      tags: ['mobile', 'setup'],
      createdAt: daysFromNow(-18),
      updatedAt: daysFromNow(-10),
    },
    {
      id: 'task-10',
      projectId: 'project-mobile',
      title: 'Push notification service',
      description: 'Implement FCM push notifications for iOS and Android.',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      dueDate: daysFromNow(8),
      assigneeId: 'user-sam',
      creatorId: 'user-jordan',
      tags: ['mobile', 'notifications'],
      createdAt: daysFromNow(-8),
      updatedAt: daysFromNow(-1),
    },
    {
      id: 'task-11',
      projectId: 'project-mobile',
      title: 'App Store submission prep',
      description: 'Prepare screenshots, descriptions, and metadata for App Store review.',
      status: 'TODO',
      priority: 'URGENT',
      dueDate: daysFromNow(-1),
      assigneeId: 'user-admin',
      creatorId: 'user-jordan',
      tags: ['launch', 'marketing'],
      createdAt: daysFromNow(-7),
      updatedAt: daysFromNow(-1),
    },
  ];

  const comments = [
    {
      id: 'comment-1',
      taskId: 'task-1',
      authorId: 'user-admin',
      content: 'Wireframes look great! Moving to implementation phase.',
      createdAt: daysFromNow(-5),
    },
    {
      id: 'comment-2',
      taskId: 'task-2',
      authorId: 'user-jordan',
      content: "I'll start with the button and input components first.",
      createdAt: daysFromNow(-4),
    },
    {
      id: 'comment-3',
      taskId: 'task-3',
      authorId: 'user-taylor',
      content: 'Scheduled sessions for next week. Will share the Calendly link.',
      createdAt: daysFromNow(-3),
    },
  ];

  const notifications = [
    {
      id: 'notif-1',
      type: 'TASK_ASSIGNED',
      message: 'You were assigned to "Implement component library"',
      userId: 'user-jordan',
      read: false,
      createdAt: daysFromNow(-1),
    },
    {
      id: 'notif-2',
      type: 'TASK_ASSIGNED',
      message: 'You were assigned to "Push notification service"',
      userId: 'user-sam',
      read: false,
      createdAt: daysFromNow(-1),
    },
    {
      id: 'notif-3',
      type: 'PROJECT_INVITE',
      message: 'You were added to "Product Redesign 2025"',
      userId: 'user-taylor',
      read: true,
      createdAt: daysFromNow(-3),
    },
    {
      id: 'notif-4',
      type: 'TASK_OVERDUE',
      message: '"Analytics dashboard API" is overdue',
      userId: 'user-admin',
      read: false,
      createdAt: daysFromNow(-1),
    },
  ];

  return { users, projects, projectMembers, tasks, comments, notifications };
};

const readJson = (key, fallback) => {
  if (!isBrowser()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const writeJson = (key, value) => {
  if (!isBrowser()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
};

const getInitialState = () => {
  const initial = buildInitialState();
  writeJson(STATE_KEY, initial);
  return initial;
};

const decodeAccessTokenUser = () => {
  if (!isBrowser()) return null;
  const token = window.localStorage.getItem('accessToken');
  if (!token) return null;

  try {
    const [, payload] = token.split('.');
    if (!payload) return null;
    const parsed = JSON.parse(window.atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    if (!parsed?.id || !parsed?.email) return null;

    return {
      id: parsed.id,
      name: parsed.name || 'TeamFlow User',
      email: parsed.email,
      role: parsed.role || 'MEMBER',
      avatar: parsed.avatar || getInitials(parsed.name || parsed.email),
      createdAt: parsed.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  } catch {
    return null;
  }
};

const getStoredUser = () => readJson(USER_KEY, null) || decodeAccessTokenUser();

const getInitials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'TF';

const toPublicUser = (user) => {
  if (!user) return null;
  const { password, ...safeUser } = user;
  return safeUser;
};

const ensureCurrentUserInState = (state) => {
  const user = getStoredUser();
  if (!user) return state;

  const existing = state.users.find((entry) => entry.id === user.id);
  if (existing) {
    Object.assign(existing, { ...existing, ...user, updatedAt: new Date().toISOString() });
  } else {
    state.users.push({
      ...user,
      avatar: user.avatar || getInitials(user.name),
      password: DEMO_PASSWORD,
      updatedAt: new Date().toISOString(),
    });
  }

  return state;
};

const loadState = () => {
  if (!isBrowser()) return buildInitialState();
  const state = readJson(STATE_KEY, null) || getInitialState();
  ensureCurrentUserInState(state);
  writeJson(STATE_KEY, state);
  return state;
};

const saveState = (state) => {
  if (!isBrowser()) return;
  writeJson(STATE_KEY, state);
};

const getCurrentUser = () => {
  const user = getStoredUser();
  if (!user) throw createApiError('Authentication required', 401);
  return user;
};

const setStoredUser = (user, options = {}) => {
  if (!isBrowser()) return;
  const nextUser = {
    ...user,
    avatar: user.avatar || getInitials(user.name),
    updatedAt: new Date().toISOString(),
  };
  writeJson(USER_KEY, nextUser);

  const state = loadState();
  const existing = state.users.find((entry) => entry.id === nextUser.id);
  const password = options.password || existing?.password || DEMO_PASSWORD;
  if (existing) {
    Object.assign(existing, { ...existing, ...nextUser, password });
  } else {
    state.users.push({ ...nextUser, password });
  }
  saveState(state);
};

export const clearStoredUser = () => {
  if (!isBrowser()) return;
  window.localStorage.removeItem(USER_KEY);
};

export const getStorageMode = () => {
  if (!isBrowser()) return 'api';
  return window.localStorage.getItem(MODE_KEY) || 'api';
};

export const isFallbackMode = () => getStorageMode() === 'fallback';

export const setStorageMode = (mode) => {
  if (!isBrowser()) return;
  if (mode === 'fallback') {
    window.localStorage.setItem(MODE_KEY, mode);
    loadState();
  } else {
    window.localStorage.removeItem(MODE_KEY);
  }
};

export const persistSessionUser = (user, options = {}) => {
  setStoredUser(user, options);
};

export const createApiResponse = (data) => Promise.resolve({ data });

export const createApiError = (message, status = 400) => ({
  response: { status, data: { error: message } },
});

export const isDbUnavailableError = (error) =>
  error?.response?.data?.error?.includes('Database connection env is not set');

export const runWithFallback = async (apiCall, fallbackCall) => {
  if (isFallbackMode()) return createApiResponse(fallbackCall());

  try {
    return await apiCall();
  } catch (error) {
    if (!isDbUnavailableError(error)) throw error;
    setStorageMode('fallback');
    return createApiResponse(fallbackCall());
  }
};

const byPriority = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };

const getUserById = (state, userId) => state.users.find((user) => user.id === userId);

const getProjectByIdFromState = (state, projectId) => state.projects.find((project) => project.id === projectId);

const getTaskByIdFromState = (state, taskId) => state.tasks.find((task) => task.id === taskId);

const getProjectMemberEntries = (state, projectId) =>
  state.projectMembers.filter((member) => member.projectId === projectId);

const getTaskComments = (state, taskId) =>
  state.comments
    .filter((comment) => comment.taskId === taskId)
    .sort((left, right) => new Date(left.createdAt) - new Date(right.createdAt))
    .map((comment) => ({
      ...comment,
      author: toPublicUser(getUserById(state, comment.authorId)),
    }));

const decorateTask = (state, task, options = {}) => ({
  ...task,
  assignee: task.assigneeId ? toPublicUser(getUserById(state, task.assigneeId)) : null,
  creator: toPublicUser(getUserById(state, task.creatorId)),
  project: (() => {
    const project = getProjectByIdFromState(state, task.projectId);
    return project ? { id: project.id, name: project.name, color: project.color } : null;
  })(),
  commentCount: state.comments.filter((comment) => comment.taskId === task.id).length,
  ...(options.includeComments && { comments: getTaskComments(state, task.id) }),
});

const decorateProject = (state, project, options = {}) => {
  const projectTasks = state.tasks.filter((task) => task.projectId === project.id);
  const taskStats = { TODO: 0, IN_PROGRESS: 0, IN_REVIEW: 0, DONE: 0 };
  projectTasks.forEach((task) => {
    taskStats[task.status] = (taskStats[task.status] || 0) + 1;
  });
  const totalTasks = projectTasks.length;
  const progress = totalTasks > 0 ? Math.round((taskStats.DONE / totalTasks) * 100) : 0;

  return {
    ...project,
    owner: toPublicUser(getUserById(state, project.ownerId)),
    members: getProjectMemberEntries(state, project.id).map((member) => ({
      userId: member.userId,
      role: member.role,
      joinedAt: member.joinedAt,
      user: toPublicUser(getUserById(state, member.userId)),
    })),
    taskStats,
    progress,
    _count: { tasks: totalTasks },
    ...(options.includeTasks && {
      tasks: projectTasks
        .slice()
        .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt))
        .map((task) => decorateTask(state, task)),
    }),
  };
};

const getAccessibleProjectIds = (state, user) => {
  if (user.role === 'ADMIN') return new Set(state.projects.map((project) => project.id));

  return new Set(
    state.projectMembers
      .filter((member) => member.userId === user.id)
      .map((member) => member.projectId)
      .concat(state.projects.filter((project) => project.ownerId === user.id).map((project) => project.id))
  );
};

const getAccessibleProjects = (state, user) => {
  const projectIds = getAccessibleProjectIds(state, user);
  return state.projects.filter((project) => projectIds.has(project.id));
};

const getAccessibleTasks = (state, user) => {
  const projectIds = getAccessibleProjectIds(state, user);
  return state.tasks.filter((task) => projectIds.has(task.projectId));
};

const addNotification = (state, notification) => {
  state.notifications.unshift({
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    read: false,
    ...notification,
  });
};

const syncStoredUserFromState = (state) => {
  const stored = getStoredUser();
  if (!stored) return;
  const user = getUserById(state, stored.id);
  if (user) setStoredUser(toPublicUser(user), { password: user.password });
};

export const getFallbackDashboardData = () => {
  const state = loadState();
  const user = getCurrentUser();
  const projects = getAccessibleProjects(state, user);
  const tasks = getAccessibleTasks(state, user);
  const now = Date.now();
  const tasksByStatus = { TODO: 0, IN_PROGRESS: 0, IN_REVIEW: 0, DONE: 0 };
  tasks.forEach((task) => {
    tasksByStatus[task.status] = (tasksByStatus[task.status] || 0) + 1;
  });

  return {
    storageMode: 'fallback',
    stats: {
      totalProjects: projects.length,
      activeProjects: projects.filter((project) => project.status === 'ACTIVE').length,
      totalTasks: tasks.length,
      completedTasks: tasksByStatus.DONE,
      overdueTasks: tasks.filter((task) => task.status !== 'DONE' && task.dueDate && new Date(task.dueDate).getTime() < now).length,
      tasksByStatus,
    },
    myTasks: tasks
      .filter((task) => task.assigneeId === user.id && task.status !== 'DONE')
      .sort((left, right) => {
        const priorityDelta = (byPriority[left.priority] ?? 9) - (byPriority[right.priority] ?? 9);
        if (priorityDelta !== 0) return priorityDelta;
        return new Date(left.dueDate || 0) - new Date(right.dueDate || 0);
      })
      .slice(0, 5)
      .map((task) => decorateTask(state, task)),
    recentTasks: tasks
      .slice()
      .sort((left, right) => new Date(right.updatedAt) - new Date(left.updatedAt))
      .slice(0, 8)
      .map((task) => decorateTask(state, task)),
    upcomingTasks: tasks
      .filter((task) => task.status !== 'DONE' && task.dueDate)
      .filter((task) => {
        const due = new Date(task.dueDate).getTime();
        return due >= now && due <= now + 7 * 24 * 60 * 60 * 1000;
      })
      .sort((left, right) => new Date(left.dueDate) - new Date(right.dueDate))
      .slice(0, 5)
      .map((task) => decorateTask(state, task)),
    topProjects: projects
      .filter((project) => project.status === 'ACTIVE')
      .slice()
      .sort((left, right) => new Date(right.updatedAt) - new Date(left.updatedAt))
      .slice(0, 4)
      .map((project) => decorateProject(state, project)),
  };
};

export const getFallbackNotificationsData = () => {
  const state = loadState();
  const user = getCurrentUser();
  const notifications = state.notifications
    .filter((notification) => notification.userId === user.id)
    .slice()
    .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt));

  return {
    storageMode: 'fallback',
    notifications,
    unreadCount: notifications.filter((notification) => !notification.read).length,
  };
};

export const markAllFallbackNotificationsAsRead = () => {
  const state = loadState();
  const user = getCurrentUser();
  state.notifications.forEach((notification) => {
    if (notification.userId === user.id) notification.read = true;
  });
  saveState(state);
  return { message: 'All notifications marked as read' };
};

export const markFallbackNotificationAsRead = (notificationId) => {
  const state = loadState();
  const user = getCurrentUser();
  const notification = state.notifications.find((entry) => entry.id === notificationId && entry.userId === user.id);
  if (notification) notification.read = true;
  saveState(state);
  return { message: 'Marked as read' };
};

export const deleteFallbackNotification = (notificationId) => {
  const state = loadState();
  const user = getCurrentUser();
  state.notifications = state.notifications.filter((entry) => !(entry.id === notificationId && entry.userId === user.id));
  saveState(state);
  return { message: 'Notification deleted' };
};

export const getFallbackUsers = () => {
  const state = loadState();
  return { users: state.users.map(toPublicUser).sort((left, right) => left.name.localeCompare(right.name)) };
};

export const updateFallbackProfile = ({ name }) => {
  const state = loadState();
  const user = getCurrentUser();
  const current = getUserById(state, user.id);
  if (!current) throw createApiError('User not found', 404);

  current.name = name;
  current.avatar = getInitials(name);
  current.updatedAt = new Date().toISOString();
  saveState(state);
  syncStoredUserFromState(state);
  return { message: 'Profile updated', user: toPublicUser(current) };
};

export const changeFallbackPassword = ({ currentPassword, newPassword }) => {
  const state = loadState();
  const user = getCurrentUser();
  const current = getUserById(state, user.id);
  if (!current) throw createApiError('User not found', 404);
  if (current.password && current.password !== currentPassword) {
    throw createApiError('Current password is incorrect', 400);
  }
  current.password = newPassword;
  current.updatedAt = new Date().toISOString();
  saveState(state);
  return { message: 'Password changed successfully' };
};

export const updateFallbackUserRole = (userId, role) => {
  const state = loadState();
  const currentUser = getCurrentUser();
  if (currentUser.role !== 'ADMIN') throw createApiError('Admin access required', 403);
  if (currentUser.id === userId) throw createApiError('Cannot change your own role', 400);

  const user = getUserById(state, userId);
  if (!user) throw createApiError('User not found', 404);

  user.role = role;
  user.updatedAt = new Date().toISOString();
  saveState(state);
  return { message: 'Role updated', user: toPublicUser(user) };
};

export const getFallbackProjects = () => {
  const state = loadState();
  const user = getCurrentUser();
  return {
    projects: getAccessibleProjects(state, user)
      .slice()
      .sort((left, right) => new Date(right.updatedAt) - new Date(left.updatedAt))
      .map((project) => decorateProject(state, project)),
  };
};

export const getFallbackProjectById = (projectId) => {
  const state = loadState();
  const user = getCurrentUser();
  const project = getProjectByIdFromState(state, projectId);
  if (!project) throw createApiError('Project not found', 404);
  if (!getAccessibleProjectIds(state, user).has(projectId)) throw createApiError('Access denied to this project', 403);
  return { project: decorateProject(state, project, { includeTasks: true }) };
};

export const createFallbackProject = ({ name, description, color, dueDate }) => {
  const state = loadState();
  const user = getCurrentUser();
  const project = {
    id: crypto.randomUUID(),
    name,
    description: description || '',
    color: color || '#10b981',
    status: 'ACTIVE',
    dueDate: dueDate || null,
    ownerId: user.id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  state.projects.unshift(project);
  state.projectMembers.push({
    projectId: project.id,
    userId: user.id,
    role: 'ADMIN',
    joinedAt: new Date().toISOString(),
  });
  saveState(state);
  return { message: 'Project created', project: decorateProject(state, project) };
};

export const updateFallbackProject = (projectId, data) => {
  const state = loadState();
  const user = getCurrentUser();
  const project = getProjectByIdFromState(state, projectId);
  if (!project) throw createApiError('Project not found', 404);
  if (!getAccessibleProjectIds(state, user).has(projectId)) throw createApiError('Access denied to this project', 403);

  Object.assign(project, {
    name: data.name ?? project.name,
    description: data.description ?? project.description,
    color: data.color ?? project.color,
    status: data.status ?? project.status,
    dueDate: data.dueDate ?? project.dueDate,
    updatedAt: new Date().toISOString(),
  });
  saveState(state);
  return { message: 'Project updated', project: decorateProject(state, project) };
};

export const deleteFallbackProject = (projectId) => {
  const state = loadState();
  const user = getCurrentUser();
  const project = getProjectByIdFromState(state, projectId);
  if (!project) throw createApiError('Project not found', 404);
  if (project.ownerId !== user.id && user.role !== 'ADMIN') throw createApiError('Not authorized to delete this project', 403);

  const taskIds = state.tasks.filter((task) => task.projectId === projectId).map((task) => task.id);
  state.projects = state.projects.filter((entry) => entry.id !== projectId);
  state.projectMembers = state.projectMembers.filter((entry) => entry.projectId !== projectId);
  state.tasks = state.tasks.filter((task) => task.projectId !== projectId);
  state.comments = state.comments.filter((comment) => !taskIds.includes(comment.taskId));
  saveState(state);
  return { message: 'Project deleted' };
};

export const addFallbackProjectMember = (projectId, { userId, role = 'MEMBER' }) => {
  const state = loadState();
  const currentUser = getCurrentUser();
  const project = getProjectByIdFromState(state, projectId);
  if (!project) throw createApiError('Project not found', 404);
  if (project.ownerId !== currentUser.id && currentUser.role !== 'ADMIN') throw createApiError('Project admin access required', 403);

  const user = getUserById(state, userId);
  if (!user) throw createApiError('User not found', 404);
  if (state.projectMembers.some((entry) => entry.projectId === projectId && entry.userId === userId)) {
    throw createApiError('User is already a member', 409);
  }

  const member = { projectId, userId, role, joinedAt: new Date().toISOString() };
  state.projectMembers.push(member);
  addNotification(state, {
    type: 'PROJECT_INVITE',
    message: `You were added to "${project.name}"`,
    userId,
  });
  saveState(state);
  return {
    message: 'Member added',
    member: {
      userId: member.userId,
      role: member.role,
      joinedAt: member.joinedAt,
      user: toPublicUser(user),
    },
  };
};

export const removeFallbackProjectMember = (projectId, userId) => {
  const state = loadState();
  const currentUser = getCurrentUser();
  const project = getProjectByIdFromState(state, projectId);
  if (!project) throw createApiError('Project not found', 404);
  if (project.ownerId === userId) throw createApiError('Cannot remove project owner', 400);
  if (project.ownerId !== currentUser.id && currentUser.role !== 'ADMIN') throw createApiError('Project admin access required', 403);

  state.projectMembers = state.projectMembers.filter((entry) => !(entry.projectId === projectId && entry.userId === userId));
  saveState(state);
  return { message: 'Member removed' };
};

export const updateFallbackProjectMemberRole = (projectId, userId, role) => {
  const state = loadState();
  const currentUser = getCurrentUser();
  const project = getProjectByIdFromState(state, projectId);
  if (!project) throw createApiError('Project not found', 404);
  if (project.ownerId !== currentUser.id && currentUser.role !== 'ADMIN') throw createApiError('Project admin access required', 403);

  const member = state.projectMembers.find((entry) => entry.projectId === projectId && entry.userId === userId);
  if (!member) throw createApiError('Member not found', 404);
  member.role = role;
  saveState(state);
  return { message: 'Member role updated' };
};

export const getFallbackTasks = (params = {}) => {
  const state = loadState();
  const user = getCurrentUser();
  const tasks = getAccessibleTasks(state, user)
    .filter((task) => !params.projectId || task.projectId === params.projectId)
    .filter((task) => !params.status || task.status === params.status)
    .filter((task) => !params.priority || task.priority === params.priority)
    .filter((task) => !params.assigneeId || task.assigneeId === params.assigneeId)
    .filter((task) => !params.overdue || (task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE'))
    .filter((task) => !params.search || task.title.toLowerCase().includes(params.search.toLowerCase()) || (task.description || '').toLowerCase().includes(params.search.toLowerCase()))
    .sort((left, right) => {
      const priorityDelta = (byPriority[left.priority] ?? 9) - (byPriority[right.priority] ?? 9);
      if (priorityDelta !== 0) return priorityDelta;
      return new Date(right.createdAt) - new Date(left.createdAt);
    })
    .map((task) => decorateTask(state, task));

  return { tasks };
};

export const getFallbackTaskById = (taskId) => {
  const state = loadState();
  const user = getCurrentUser();
  const task = getTaskByIdFromState(state, taskId);
  if (!task) throw createApiError('Task not found', 404);
  if (!getAccessibleProjectIds(state, user).has(task.projectId)) throw createApiError('Access denied to this task', 403);
  return { task: decorateTask(state, task, { includeComments: true }) };
};

export const createFallbackTask = (data) => {
  const state = loadState();
  const user = getCurrentUser();
  const project = getProjectByIdFromState(state, data.projectId);
  if (!project) throw createApiError('Project not found', 404);
  if (!getAccessibleProjectIds(state, user).has(project.id)) throw createApiError('Access denied', 403);

  const task = {
    id: crypto.randomUUID(),
    title: data.title,
    description: data.description || '',
    status: data.status || 'TODO',
    priority: data.priority || 'MEDIUM',
    dueDate: data.dueDate || null,
    assigneeId: data.assigneeId || null,
    projectId: data.projectId,
    creatorId: user.id,
    tags: data.tags || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  state.tasks.unshift(task);
  project.updatedAt = new Date().toISOString();
  if (task.assigneeId && task.assigneeId !== user.id) {
    addNotification(state, {
      type: 'TASK_ASSIGNED',
      message: `You were assigned to "${task.title}"`,
      userId: task.assigneeId,
    });
  }
  saveState(state);
  return { message: 'Task created', task: decorateTask(state, task) };
};

export const updateFallbackTask = (taskId, data) => {
  const state = loadState();
  const user = getCurrentUser();
  const task = getTaskByIdFromState(state, taskId);
  if (!task) throw createApiError('Task not found', 404);
  if (!getAccessibleProjectIds(state, user).has(task.projectId)) throw createApiError('Access denied to this task', 403);

  const previousAssignee = task.assigneeId;
  Object.assign(task, {
    title: data.title ?? task.title,
    description: data.description ?? task.description,
    status: data.status ?? task.status,
    priority: data.priority ?? task.priority,
    dueDate: Object.prototype.hasOwnProperty.call(data, 'dueDate') ? data.dueDate : task.dueDate,
    assigneeId: Object.prototype.hasOwnProperty.call(data, 'assigneeId') ? data.assigneeId : task.assigneeId,
    tags: Object.prototype.hasOwnProperty.call(data, 'tags') ? data.tags : task.tags,
    updatedAt: new Date().toISOString(),
  });

  if (task.assigneeId && task.assigneeId !== previousAssignee && task.assigneeId !== user.id) {
    addNotification(state, {
      type: 'TASK_ASSIGNED',
      message: `You were assigned to "${task.title}"`,
      userId: task.assigneeId,
    });
  }
  saveState(state);
  return { message: 'Task updated', task: decorateTask(state, task) };
};

export const updateFallbackTaskStatus = (taskId, status) => {
  return updateFallbackTask(taskId, { status });
};

export const deleteFallbackTask = (taskId) => {
  const state = loadState();
  const user = getCurrentUser();
  const task = getTaskByIdFromState(state, taskId);
  if (!task) throw createApiError('Task not found', 404);

  const project = getProjectByIdFromState(state, task.projectId);
  if (task.creatorId !== user.id && project?.ownerId !== user.id && user.role !== 'ADMIN') {
    throw createApiError('Not authorized to delete this task', 403);
  }

  state.tasks = state.tasks.filter((entry) => entry.id !== taskId);
  state.comments = state.comments.filter((comment) => comment.taskId !== taskId);
  saveState(state);
  return { message: 'Task deleted' };
};

export const addFallbackTaskComment = (taskId, content) => {
  const state = loadState();
  const user = getCurrentUser();
  const task = getTaskByIdFromState(state, taskId);
  if (!task) throw createApiError('Task not found', 404);
  if (!getAccessibleProjectIds(state, user).has(task.projectId)) throw createApiError('Access denied to this task', 403);

  const comment = {
    id: crypto.randomUUID(),
    taskId,
    authorId: user.id,
    content,
    createdAt: new Date().toISOString(),
  };
  state.comments.push(comment);
  task.updatedAt = new Date().toISOString();
  saveState(state);
  return {
    message: 'Comment added',
    comment: {
      ...comment,
      author: toPublicUser(getUserById(state, user.id)),
    },
  };
};

export const deleteFallbackTaskComment = (taskId, commentId) => {
  const state = loadState();
  const user = getCurrentUser();
  const comment = state.comments.find((entry) => entry.id === commentId && entry.taskId === taskId);
  if (!comment) throw createApiError('Comment not found', 404);
  if (comment.authorId !== user.id && user.role !== 'ADMIN') throw createApiError('Not authorized', 403);

  state.comments = state.comments.filter((entry) => entry.id !== commentId);
  saveState(state);
  return { message: 'Comment deleted' };
};
