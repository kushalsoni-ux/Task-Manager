/**
 * Standalone migration runner — uses absolute paths, single Client.
 */
const path = require('path');
const dotenv = require(path.join(__dirname, 'node_modules/dotenv'));
dotenv.config({ path: path.join(__dirname, '.env') });

const { Client } = require(path.join(__dirname, 'node_modules/pg'));

const rawUrl = process.env.DATABASE_URL || '';
if (!rawUrl) { console.error('❌ DATABASE_URL not set'); process.exit(1); }

const connectionString = rawUrl.replace(/[?&]sslmode=[^&]*/g, '').replace(/\?$/, '');

const schema = `
  CREATE EXTENSION IF NOT EXISTS "pgcrypto";

  CREATE TABLE IF NOT EXISTS users (
    id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name        TEXT NOT NULL,
    email       TEXT UNIQUE NOT NULL,
    password    TEXT NOT NULL,
    role        TEXT NOT NULL DEFAULT 'MEMBER' CHECK (role IN ('ADMIN','MEMBER')),
    avatar      TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS projects (
    id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name        TEXT NOT NULL,
    description TEXT,
    color       TEXT NOT NULL DEFAULT '#10b981',
    status      TEXT NOT NULL DEFAULT 'ACTIVE',
    due_date    TIMESTAMPTZ,
    owner_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS project_members (
    id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    project_id  TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role        TEXT NOT NULL DEFAULT 'MEMBER' CHECK (role IN ('ADMIN','MEMBER')),
    joined_at   TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(project_id, user_id)
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title       TEXT NOT NULL,
    description TEXT,
    status      TEXT NOT NULL DEFAULT 'TODO' CHECK (status IN ('TODO','IN_PROGRESS','IN_REVIEW','DONE')),
    priority    TEXT NOT NULL DEFAULT 'MEDIUM' CHECK (priority IN ('LOW','MEDIUM','HIGH','URGENT')),
    due_date    TIMESTAMPTZ,
    tags        TEXT[] DEFAULT '{}',
    project_id  TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    assignee_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    creator_id  TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS comments (
    id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    content     TEXT NOT NULL,
    task_id     TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    author_id   TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    type        TEXT NOT NULL,
    message     TEXT NOT NULL,
    read        BOOLEAN DEFAULT FALSE,
    user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE INDEX IF NOT EXISTS idx_tasks_project    ON tasks(project_id);
  CREATE INDEX IF NOT EXISTS idx_tasks_assignee   ON tasks(assignee_id);
  CREATE INDEX IF NOT EXISTS idx_tasks_status     ON tasks(status);
  CREATE INDEX IF NOT EXISTS idx_pm_project       ON project_members(project_id);
  CREATE INDEX IF NOT EXISTS idx_pm_user          ON project_members(user_id);
  CREATE INDEX IF NOT EXISTS idx_notif_user       ON notifications(user_id);
  CREATE INDEX IF NOT EXISTS idx_comments_task    ON comments(task_id);
`;

async function migrate() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 20000,
  });

  await client.connect();
  console.log('✅ Connected to Neon PostgreSQL');
  console.log('🔧 Running migrations...');

  try {
    await client.query(schema);
    console.log('✅ Migrations complete');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

migrate().catch((e) => {
  console.error('❌ Error:', e.message);
  process.exit(1);
});
