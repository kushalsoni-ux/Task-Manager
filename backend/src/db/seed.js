require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const bcrypt = require('bcryptjs');
const { Client } = require('pg');

const rawUrl = process.env.DATABASE_URL || '';
const connectionString = rawUrl.replace(/[?&]sslmode=[^&]*/g, '').replace(/\?$/, '');
const useSSL = rawUrl.includes('neon.tech') || rawUrl.includes('amazonaws.com') || rawUrl.includes('sslmode=require');

async function seed() {
  const client = new Client({
    connectionString,
    ssl: useSSL ? { rejectUnauthorized: false } : false,
    connectionTimeoutMillis: 20000,
  });

  await client.connect();
  console.log('🌱 Seeding database...');

  const q = (text, params) => client.query(text, params);

  // Clean existing data
  await q('DELETE FROM notifications');
  await q('DELETE FROM comments');
  await q('DELETE FROM tasks');
  await q('DELETE FROM project_members');
  await q('DELETE FROM projects');
  await q('DELETE FROM users');

  const hash = await bcrypt.hash('Demo@1234', 12);

  // Users
  const { rows: [admin] } = await q(
    `INSERT INTO users (name, email, password, role, avatar) VALUES ($1,$2,$3,'ADMIN',$4) RETURNING *`,
    ['Alex Morgan', 'admin@demo.com', hash, 'AM']
  );
  const { rows: [jordan] } = await q(
    `INSERT INTO users (name, email, password, role, avatar) VALUES ($1,$2,$3,'MEMBER',$4) RETURNING *`,
    ['Jordan Lee', 'jordan@demo.com', hash, 'JL']
  );
  const { rows: [sam] } = await q(
    `INSERT INTO users (name, email, password, role, avatar) VALUES ($1,$2,$3,'MEMBER',$4) RETURNING *`,
    ['Sam Rivera', 'sam@demo.com', hash, 'SR']
  );
  const { rows: [taylor] } = await q(
    `INSERT INTO users (name, email, password, role, avatar) VALUES ($1,$2,$3,'MEMBER',$4) RETURNING *`,
    ['Taylor Kim', 'taylor@demo.com', hash, 'TK']
  );

  // Projects
  const { rows: [p1] } = await q(
    `INSERT INTO projects (name, description, color, status, due_date, owner_id)
     VALUES ($1,$2,$3,'ACTIVE',$4,$5) RETURNING *`,
    ['Product Redesign 2025', 'Complete overhaul of the product UI/UX with modern design principles.', '#10b981',
     new Date(Date.now() + 30 * 86400000), admin.id]
  );
  const { rows: [p2] } = await q(
    `INSERT INTO projects (name, description, color, status, due_date, owner_id)
     VALUES ($1,$2,$3,'ACTIVE',$4,$5) RETURNING *`,
    ['API Integration Suite', 'Build and integrate third-party APIs for payments and analytics.', '#6366f1',
     new Date(Date.now() + 45 * 86400000), admin.id]
  );
  const { rows: [p3] } = await q(
    `INSERT INTO projects (name, description, color, status, due_date, owner_id)
     VALUES ($1,$2,$3,'ACTIVE',$4,$5) RETURNING *`,
    ['Mobile App Launch', 'iOS and Android app development for the Q2 launch milestone.', '#f59e0b',
     new Date(Date.now() + 60 * 86400000), jordan.id]
  );

  // Members
  const members = [
    [p1.id, admin.id, 'ADMIN'], [p1.id, jordan.id, 'MEMBER'], [p1.id, sam.id, 'MEMBER'], [p1.id, taylor.id, 'MEMBER'],
    [p2.id, admin.id, 'ADMIN'], [p2.id, jordan.id, 'MEMBER'], [p2.id, taylor.id, 'MEMBER'],
    [p3.id, jordan.id, 'ADMIN'], [p3.id, sam.id, 'MEMBER'], [p3.id, admin.id, 'MEMBER'],
  ];
  for (const [pid, uid, role] of members) {
    await q(`INSERT INTO project_members (project_id, user_id, role) VALUES ($1,$2,$3)`, [pid, uid, role]);
  }

  // Tasks
  const tasks = [
    [p1.id, 'Design new dashboard wireframes', 'Create high-fidelity wireframes for the main dashboard.', 'DONE', 'HIGH', new Date(Date.now() - 5 * 86400000), sam.id, admin.id, ['design','ux']],
    [p1.id, 'Implement component library', 'Build reusable React components following the new design system.', 'IN_PROGRESS', 'HIGH', new Date(Date.now() + 7 * 86400000), jordan.id, admin.id, ['frontend','react']],
    [p1.id, 'User testing sessions', 'Conduct 5 user testing sessions and document findings.', 'TODO', 'MEDIUM', new Date(Date.now() + 14 * 86400000), taylor.id, admin.id, ['research','ux']],
    [p1.id, 'Accessibility audit', 'Run WCAG 2.1 AA compliance checks across all new components.', 'TODO', 'MEDIUM', new Date(Date.now() + 20 * 86400000), sam.id, admin.id, ['a11y','qa']],
    [p1.id, 'Dark mode implementation', 'Implement full dark mode support with system preference detection.', 'IN_REVIEW', 'LOW', new Date(Date.now() + 10 * 86400000), jordan.id, admin.id, ['frontend','theming']],
    [p2.id, 'Stripe payment integration', 'Integrate Stripe for subscription billing with webhook handling.', 'IN_PROGRESS', 'URGENT', new Date(Date.now() + 5 * 86400000), admin.id, admin.id, ['payments','backend']],
    [p2.id, 'SendGrid email service', 'Set up transactional email templates and delivery pipeline.', 'DONE', 'HIGH', new Date(Date.now() - 3 * 86400000), jordan.id, admin.id, ['email','backend']],
    [p2.id, 'Analytics dashboard API', 'Build REST endpoints for analytics data aggregation.', 'TODO', 'MEDIUM', new Date(Date.now() - 2 * 86400000), taylor.id, admin.id, ['analytics','api']],
    [p3.id, 'React Native setup & navigation', 'Initialize RN project with Expo and configure navigation stack.', 'DONE', 'HIGH', new Date(Date.now() - 10 * 86400000), jordan.id, jordan.id, ['mobile','setup']],
    [p3.id, 'Push notification service', 'Implement FCM push notifications for iOS and Android.', 'IN_PROGRESS', 'HIGH', new Date(Date.now() + 8 * 86400000), sam.id, jordan.id, ['mobile','notifications']],
    [p3.id, 'App Store submission prep', 'Prepare screenshots, descriptions, and metadata for App Store review.', 'TODO', 'URGENT', new Date(Date.now() - 1 * 86400000), admin.id, jordan.id, ['launch','marketing']],
  ];

  const taskRows = [];
  for (const [pid, title, desc, status, priority, due, assignee, creator, tags] of tasks) {
    const { rows: [t] } = await q(
      `INSERT INTO tasks (project_id, title, description, status, priority, due_date, assignee_id, creator_id, tags)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [pid, title, desc, status, priority, due, assignee, creator, tags]
    );
    taskRows.push(t);
  }

  // Comments
  await q(`INSERT INTO comments (content, task_id, author_id) VALUES ($1,$2,$3)`,
    ['Wireframes look great! Moving to implementation phase.', taskRows[0].id, admin.id]);
  await q(`INSERT INTO comments (content, task_id, author_id) VALUES ($1,$2,$3)`,
    ["I'll start with the button and input components first.", taskRows[1].id, jordan.id]);
  await q(`INSERT INTO comments (content, task_id, author_id) VALUES ($1,$2,$3)`,
    ['Scheduled sessions for next week. Will share the Calendly link.', taskRows[2].id, taylor.id]);

  // Notifications
  const notifs = [
    ['TASK_ASSIGNED', 'You were assigned to "Implement component library"', jordan.id, false],
    ['TASK_ASSIGNED', 'You were assigned to "Push notification service"', sam.id, false],
    ['PROJECT_INVITE', 'You were added to "Product Redesign 2025"', taylor.id, true],
    ['TASK_OVERDUE', '"Analytics dashboard API" is overdue', admin.id, false],
  ];
  for (const [type, message, uid, read] of notifs) {
    await q(`INSERT INTO notifications (type, message, user_id, read) VALUES ($1,$2,$3,$4)`, [type, message, uid, read]);
  }

  await client.end();

  console.log('✅ Seed complete!');
  console.log('');
  console.log('📧 Demo Accounts:');
  console.log('   Admin  → admin@demo.com  / Demo@1234');
  console.log('   Member → jordan@demo.com / Demo@1234');
  console.log('   Member → sam@demo.com    / Demo@1234');
  console.log('   Member → taylor@demo.com / Demo@1234');
}

seed().catch((e) => {
  console.error('❌ Seed failed:', e.message);
  process.exit(1);
});
