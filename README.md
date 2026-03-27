# Calisthenics Progress Tracker

A full-stack training tracker built for serious calisthenics athletes. Log workouts, track body weight, set goals, and visualize progress.

## Stack

| Layer | Tech |
|---|---|
| Frontend | React 18, TypeScript, Tailwind CSS, Vite |
| State | React Query v5, React Hook Form, Zod |
| Charts | Recharts |
| Backend | Node.js, Express, TypeScript |
| Database | MongoDB, Mongoose |
| Auth | JWT (jsonwebtoken, bcryptjs) |

---

## Project Structure

```
calisthenics-tracker/
├── backend/
│   ├── src/
│   │   ├── config/         # DB connection
│   │   ├── controllers/    # auth, exercise, workout, bodyweight, goal, analytics
│   │   ├── middleware/     # JWT auth middleware
│   │   ├── models/         # Mongoose models
│   │   ├── routes/         # Express routers
│   │   ├── scripts/        # seed.ts
│   │   ├── services/       # analytics.service.ts
│   │   ├── types/          # Shared TypeScript types
│   │   └── index.ts        # App entry point
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/
    ├── src/
    │   ├── api/            # Axios client + API functions
    │   ├── components/
    │   │   ├── forms/      # WorkoutForm
    │   │   ├── layout/     # Layout + sidebar
    │   │   └── ui/         # StatCard, Modal, Badge, Spinner, etc.
    │   ├── hooks/          # React Query hooks (useQueries.ts)
    │   ├── pages/
    │   │   ├── auth/       # LoginPage, RegisterPage
    │   │   ├── analytics/  # AnalyticsPage
    │   │   ├── bodyweight/ # BodyWeightPage
    │   │   ├── dashboard/  # DashboardPage
    │   │   ├── exercises/  # ExercisesPage
    │   │   ├── goals/      # GoalsPage
    │   │   └── workouts/   # WorkoutsPage, LogWorkoutPage, EditWorkoutPage
    │   ├── store/          # AuthContext
    │   ├── types/          # Shared types
    │   ├── App.tsx
    │   ├── main.tsx
    │   └── index.css       # Design system + Tailwind
    ├── index.html
    ├── package.json
    ├── tailwind.config.js
    └── vite.config.ts
```

---

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB running locally OR a MongoDB Atlas URI

### 1. Clone and install

```bash
git clone <repo>

# Backend
cd calisthenics-tracker/backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure environment

```bash
cd backend
cp .env.example .env
# Edit .env — set your MONGODB_URI and JWT_SECRET
```

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/calisthenics-tracker
JWT_SECRET=change-this-to-something-long-and-random
JWT_EXPIRES_IN=7d
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### 3. Seed the database

```bash
cd backend
npm run seed
# Seeds 60 default exercises across all categories
```

### 4. Start the servers

```bash
# Terminal 1 — backend
cd backend
npm run dev

# Terminal 2 — frontend
cd frontend
npm run dev
```

Open **http://localhost:3000**, register an account, and start tracking.

---

## API Endpoints

### Auth
```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me
PATCH  /api/auth/me
```

### Workouts
```
GET    /api/workouts          ?page, limit, from, to
POST   /api/workouts
GET    /api/workouts/:id
PATCH  /api/workouts/:id
DELETE /api/workouts/:id
```

### Exercises
```
GET    /api/exercises
POST   /api/exercises
PATCH  /api/exercises/:id
DELETE /api/exercises/:id
```

### Goals
```
GET    /api/goals             ?status
POST   /api/goals
PATCH  /api/goals/:id
DELETE /api/goals/:id
```

### Body Weight
```
GET    /api/bodyweight        ?from, to, limit
POST   /api/bodyweight
DELETE /api/bodyweight/:id
```

### Analytics
```
GET    /api/analytics/dashboard
GET    /api/analytics/streaks
GET    /api/analytics/personal-bests
GET    /api/analytics/workouts-per-week   ?weeks
GET    /api/analytics/goal-progress
GET    /api/analytics/exercise-progress/:exerciseId
```

---

## Features

- **JWT authentication** with protected routes on both frontend and backend
- **Workout logging** with a dynamic exercise + set builder (reps, duration, distance)
- **Exercise library** — 60 seeded defaults + custom exercises per user
- **Goals system** — set targets by reps/sets/weight/duration, track progress with visual bars
- **Body weight tracking** with trend chart
- **Analytics dashboard** — streak counter, workouts per week bar chart, personal bests, goal progress, exercise-specific progress charts
- **Dark industrial UI** — Barlow Condensed + DM Sans, amber accent, animated cards

---

## Design System

The UI uses a custom Tailwind theme with CSS component classes:

| Class | Usage |
|---|---|
| `.card` | Surface container |
| `.btn-primary` | Amber CTA button |
| `.btn-secondary` | Ghost border button |
| `.input` | Form input |
| `.label` | Small caps field label |
| `.badge` | Inline tag |
| `.section-title` | Page section heading |

Colors: `background (#0a0b0d)`, `surface (#111318)`, `accent (#f5a623)`, semantic categories (push/pull/legs/core/cardio/mobility/skill) each have unique color tokens.
