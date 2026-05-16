# TeamFlow

A full-stack team task management platform with role-based access control, project tracking, and real-time dashboards.

---

## Project Overview

TeamFlow is a collaborative task manager designed for small-to-medium engineering teams. It supports multiple projects, kanban-style task boards, assignee tracking, priority levels, due dates, comments, and in-app notifications. Access is governed by two roles: Admin and Member, each with well-defined permissions.

---

## Features

- JWT authentication with access and refresh tokens
- Role-based access control (Admin / Member)
- Project creation with color labels, due dates, and team membership
- Kanban board with four status columns: To Do, In Progress, In Review, Done
- Task management: priority levels, due dates, tags, assignees, and inline comments
- Dashboard with live statistics, task distribution chart, upcoming deadlines, and recent activity
- Team management page with role promotion and demotion (Admin only)
- In-app notifications for task assignments, project invites, and overdue items
- Pre-seeded demo accounts with realistic sample data

---

## Tech Stack

| Layer     | Technology                                      |
|-----------|-------------------------------------------------|
| Frontend  | React 18, Vite, Tailwind CSS, Zustand, Recharts |
| Backend   | Node.js, Express.js                             |
| Database  | PostgreSQL via node-postgres (raw SQL)          |
| Auth      | JWT (access + refresh tokens), bcrypt           |
| Deployment| Railway                                         |

---

## Demo Accounts

| Role   | Email              | Password   |
|--------|--------------------|------------|
| Admin  | admin@demo.com     | Demo@1234  |
| Member | jordan@demo.com    | Demo@1234  |
| Member | sam@demo.com       | Demo@1234  |
| Member | taylor@demo.com    | Demo@1234  |

---

## Folder Structure

```
Task_Manager-main/
  backend/
    src/
      controllers/     Route handler logic
      db/              Database pool, migrations, seed script
      middleware/       Auth guards, rate limiting, error handling
      routes/          Express route definitions
      utils/           Token generation, shared helpers
    index.js           Entry point
  frontend/
    src/
      api/             Axios API clients (auth, tasks, projects, etc.)
      components/      Layout, Sidebar, Header, and shared UI primitives
      context/         Zustand auth store
      pages/           Page-level React components
      index.css        Global styles and Tailwind component classes
      App.jsx          Route configuration
      main.jsx         React entry point
    tailwind.config.js
    vite.config.js
```

---

## Setup Instructions

### Prerequisites

- Node.js 18 or later
- PostgreSQL 15 or later (or a hosted PostgreSQL connection string)

### Backend

```bash
cd backend
cp .env.example .env
# Fill in DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET, and FRONTEND_URL in .env
npm install
node run-migrate.js   # Create tables
node run-seed.js      # Populate demo data
npm start
```

### Frontend

```bash
cd frontend
cp .env.example .env
# Set VITE_API_URL to the backend base URL (e.g. http://localhost:3000)
npm install
npm run dev
```

The frontend dev server starts at `http://localhost:5173` by default.

---

## Railway Deployment

### Recommended: Single-Service Deploy From Repo Root

This repository is now set up so Railway can deploy directly from the repo root:

- Railway builds the frontend from `frontend/`
- Railway starts the backend from `backend/`
- the backend serves the built frontend in production
- the deployed app uses one Railway URL for both UI and API

Required Railway variables:

- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `JWT_EXPIRES_IN=15m`
- `JWT_REFRESH_EXPIRES_IN=7d`
- `NODE_ENV=production`

Optional:

- `FRONTEND_URL`

Deployment notes:

- Point the Railway service at the repository root, not `frontend/` or `backend/`
- The root `railway.toml` handles build and start automatically
- The frontend production API URL is set to `/api`, so it works behind the same Railway domain

### Alternative: Separate Frontend / Backend Services

If you prefer two Railway services:

- use `backend/railway.toml` for the API service
- use `frontend/railway.toml` for the frontend service
- set `VITE_API_URL` on the frontend service to the deployed backend URL plus `/api`

---

## Usage

1. Open the app and sign in with a demo account (see table above).
2. Use the Admin account to manage projects, assign tasks, and promote team members.
3. Use a Member account to view assigned tasks, update statuses, and leave comments.
4. The Dashboard provides a live overview of workload, completion rate, and upcoming deadlines.

---

## API Reference

### Auth

| Method | Endpoint            | Description           |
|--------|---------------------|-----------------------|
| POST   | /api/auth/register  | Register a new user   |
| POST   | /api/auth/login     | Login                 |
| POST   | /api/auth/refresh   | Refresh access token  |
| GET    | /api/auth/me        | Get current user      |

### Projects

| Method | Endpoint                          | Description       |
|--------|-----------------------------------|-------------------|
| GET    | /api/projects                     | List projects     |
| POST   | /api/projects                     | Create project    |
| GET    | /api/projects/:id                 | Get project       |
| PUT    | /api/projects/:id                 | Update project    |
| DELETE | /api/projects/:id                 | Delete project    |
| POST   | /api/projects/:id/members         | Add member        |
| DELETE | /api/projects/:id/members/:userId | Remove member     |

### Tasks

| Method | Endpoint                  | Description           |
|--------|---------------------------|-----------------------|
| GET    | /api/tasks                | List tasks (filtered) |
| POST   | /api/tasks                | Create task           |
| GET    | /api/tasks/:id            | Get task              |
| PUT    | /api/tasks/:id            | Update task           |
| PATCH  | /api/tasks/:id/status     | Update status only    |
| DELETE | /api/tasks/:id            | Delete task           |
| POST   | /api/tasks/:id/comments   | Add comment           |

### Dashboard

| Method | Endpoint        | Description          |
|--------|-----------------|----------------------|
| GET    | /api/dashboard  | Get dashboard stats  |

---

## Role Permissions

| Action                | Admin | Member            |
|-----------------------|-------|-------------------|
| View all projects     | Yes   | Own projects only |
| Create project        | Yes   | Yes               |
| Delete project        | Yes   | No                |
| Add / remove members  | Yes   | No                |
| Create tasks          | Yes   | Yes (own projects)|
| Delete tasks          | Yes   | Own tasks only    |
| Change user roles     | Yes   | No                |

---

## Security

- Passwords hashed with bcrypt (12 rounds)
- JWT access tokens expire in 15 minutes; refresh tokens expire in 7 days
- Rate limiting: 200 requests per 15 minutes globally, 20 per 15 minutes on auth routes
- Helmet.js for HTTP security headers
- CORS restricted to the configured frontend origin
- Input validation on all endpoints

---
