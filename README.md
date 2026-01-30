# Dynalog

A modern gym progress tracking web application built with Next.js 16, designed to help users manage workout routines, track exercises, and monitor their fitness journey.

## Features

- **User Authentication**: Secure JWT-based authentication with 30-day sessions
- **Routine Management**: Create, edit, and organize workout routines
- **Exercise Tracking**: Add exercises with weight, sets, reps, and rest time
- **Workout Sessions**: Start workouts and log your sets in real-time with rest time display
- **Cancel Workout**: Ability to cancel and delete an in-progress workout
- **Workout History**: View completed workout sessions with infinite scroll pagination (15 items per page)
- **Delete Workouts**: Remove completed workout sessions from history
- **Progress Tracking**: Visualize your progress with interactive charts per routine
  - Timeframe filtering (1W, 1M, 3M, 6M, 1Y)
  - Track max weight and Dynascore (weight × reps) over time
  - Dual Y-axis charts for weight and performance metrics
- **Profile Management**: Update personal information, fitness goals, and avatar
- **Responsive Design**: Works seamlessly on both desktop and mobile devices
- **Smooth Animations**: Framer Motion powered UI animations
- **Dotted Background**: Subtle dotted pattern background throughout the app

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Database**: SQLite with Turso (via Drizzle ORM)
- **Authentication**: JWT with jose + bcrypt
- **Data Fetching**: TanStack Query + ky (with infinite queries for pagination)
- **Validation**: Zod
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm/yarn
- Turso account for database

### Environment Setup

1. Clone the repository
2. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
3. Fill in your environment variables:
   ```
   DATABASE_URL=libsql://your-database.turso.io
   DATABASE_AUTH_TOKEN=your-auth-token
   JWT_SECRET=your-super-secret-jwt-key-at-least-32-chars
   ```

### Installation

```bash
# Install dependencies
pnpm install

# Push database schema
pnpm drizzle-kit push

# Run development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Project Structure

```
/app                  # Next.js App Router pages and API routes
  /api                # API endpoints
    /auth             # Authentication routes
    /users            # User management
    /routines         # Routine CRUD
    /exercises        # Exercise CRUD
    /sessions         # Workout session management (with pagination)
    /logs             # Exercise log management
    /progress         # Progress data for charts
  /auth               # Auth page
  /routines/[id]      # Single routine page
  /sessions/[id]      # Active workout page
  /history            # Workout history with infinite scroll
  /progress           # Progress overview
  /progress/[routineId] # Routine-specific progress charts
  /profile            # User profile

/components           # React components
  /layout             # Layout components (TopBar, BottomNav, etc.)
  /auth               # Authentication components
  /routines           # Routine-related components
  /exercises          # Exercise-related components
  /sessions           # Session-related components
  /profile            # Profile components
  /progress           # Progress chart components
  /providers          # Context providers
  /shadcn-ui          # shadcn/ui components

/lib                  # Utility functions and configurations
  /api                # API client functions
  /auth               # Authentication utilities
  /contexts           # React contexts
  /db                 # Database configuration
    /schemas          # Drizzle schemas
    /queries          # Database query functions

/hooks                # Custom React hooks
```

## Database Schema

- **users**: User accounts, profile information, and avatar selection
- **routines**: Workout routine definitions
- **exercises**: Exercises within routines (with weight, sets, reps, rest time)
- **workout_sessions**: Workout session records with start/completion timestamps
- **exercise_logs**: Individual set logs within sessions for progress tracking

## Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm drizzle-kit push    # Push schema to database
pnpm drizzle-kit studio  # Open Drizzle Studio
```

## License

MIT License - see [LICENSE](LICENSE) for details.
