# Shuffle Seven - Project Architecture

## Overview
**Shuffle Seven** is a Progressive Web App (PWA) for daily mindset support through card draws and journaling.

## Tech Stack

### Backend (Server)
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript (compiled with tsx in dev, esbuild for production)
- **Database**: PostgreSQL via Neon Serverless
  - ORM: Drizzle ORM
  - Connection: WebSocket-based serverless connection
- **Authentication**: Passport.js with local strategy (email/password)
- **Session Management**: express-session with PostgreSQL store
- **Object Storage**: Replit Object Storage (for card images)

### Frontend (Client)
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack Query (React Query)
- **UI Components**: Radix UI primitives + custom components
- **Styling**: Tailwind CSS with custom animations
- **Build Tool**: Vite

### Development Setup
- **Dev Server**: Express serves both API and Vite dev server
  - Port 5000 (configurable via PORT env var)
  - Vite runs in middleware mode for HMR
- **Production**: Express serves pre-built static files from dist/

## Architecture Pattern

### Full-Stack Monorepo Structure
```
/client          - React frontend
  /src
    /components  - UI components
    /pages       - Route pages
    /hooks       - Custom React hooks
    /lib         - Utilities & helpers
/server          - Express backend
  index.ts       - Server entry point
  routes.ts      - API route definitions
  db.ts          - Database connection
  storage.ts     - Data access layer
  localAuth.ts   - Authentication logic
  vite.ts        - Vite dev server setup
/shared          - Shared TypeScript types/schemas
  schema.ts      - Drizzle schema & Zod validators
/public          - Static assets (cards.json, PWA files)
```

## Key Features

### Database Schema
1. **users** - User accounts with email/password auth
2. **sessions** - Express session storage (required for auth)
3. **drawnCards** - History of daily/lifeline card draws
4. **journalEntries** - User reflections on cards
5. **notificationSubscriptions** - Push notification endpoints

### API Endpoints
- `/api/cards` - Fetch card deck
- `/api/cards/lifeline` - Fetch lifeline cards from object storage
- `/api/auth/*` - Authentication (login, signup, logout)
- `/api/drawn-cards/*` - Card draw history
- `/api/journal/*` - Journal entry CRUD
- `/api/notifications/*` - Push notification subscriptions

### PWA Features
- Service Worker (`/public/sw.js`)
- Web App Manifest (`/public/manifest.webmanifest`)
- Push Notifications
- Offline capability

## Development Workflow

### Required Environment Variables
```bash
DATABASE_URL=postgresql://...  # Neon PostgreSQL connection string
NODE_ENV=development           # or production
PORT=5000                      # Server port (default)
```

### Commands
- `npm run dev` - Start development server (tsx + Vite HMR)
- `npm run build` - Build for production (Vite + esbuild)
- `npm run start` - Run production build
- `npm run db:push` - Push schema changes to database

### Database Setup
1. Provision Neon PostgreSQL database
2. Set DATABASE_URL in .env
3. Run `npm run db:push` to create tables

## Deployment Target
Originally built for **Replit** deployment:
- Uses Replit Object Storage for card images
- Configured for Replit's PostgreSQL module
- Port 5000 exposed via Replit's proxy

## Local Development Requirements
1. Node.js 20+
2. PostgreSQL database (Neon recommended)
3. npm dependencies installed
4. .env file with DATABASE_URL

## Current State
- ✅ Full authentication system
- ✅ Card drawing mechanics
- ✅ Journal functionality
- ✅ Push notifications
- ✅ PWA capabilities
- ⚠️ Requires database connection to run
- ⚠️ Object storage configured for Replit