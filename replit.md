# Seventy7 Kapital - Trading Platform

## Overview

Seventy7 Kapital is a premium trading and financial empowerment platform that combines both static frontend capabilities and full-stack functionality. The platform offers investment management, portfolio tracking, trading signals, mentorship programs, and educational resources for traders.

The application is built with a React frontend using Vite, and an Express.js backend with PostgreSQL (via Neon Database) for data persistence. It features a modern Web3-inspired dark theme with neon accents, smooth animations, and a fully responsive design.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build Tool**
- React 18+ with TypeScript for type safety
- Vite for fast development and optimized production builds
- Wouter for lightweight client-side routing
- Root directory: `client/src/`

**UI & Styling**
- Tailwind CSS for utility-first styling with custom brand colors (gold primary: #F2B23A, deep navy secondary: #0F172A)
- Shadcn UI component library (New York style) for consistent, accessible components
- Framer Motion for declarative animations and page transitions
- Custom candlestick chart backgrounds for trading aesthetics

**State Management**
- React Context API for authentication state (AuthProvider)
- TanStack React Query for server state management
- Local state with React hooks for component-level data

**Key Features**
- Authentication with JWT tokens stored in localStorage
- Role-based routing (client dashboard vs admin panel)
- Protected routes via PrivateRoute wrapper component
- Responsive design optimized for mobile and desktop

### Backend Architecture

**Server Framework**
- Express.js with TypeScript
- ESM modules (type: "module" in package.json)
- RESTful API design with route modularization
- Port 3000 for backend, Port 5000 for frontend dev server

**Authentication & Authorization**
- JWT-based authentication using jsonwebtoken
- bcryptjs for password hashing
- Auth middleware applied to protected routes
- Admin-only middleware for privileged operations
- User roles: "client" and "admin"

**API Structure**
- Main router: `server/api.ts` aggregates all sub-routes
- User routes: `/api/auth`, `/api/user`, `/api/deposit`, `/api/withdrawal`
- Investment routes: `/api/invest`, `/api/investments`, `/api/portfolio`, `/api/plans`
- Admin routes: `/api/admin/*` (users, transactions, plans, trades, settings)
- Trading routes: `/api/trades`, `/api/mentorship`, `/api/learning`

**Database Layer**
- Drizzle ORM for type-safe database queries
- Schema defined in `server/db/schema.ts`
- Connection management in `server/db/connection.ts`
- Migrations stored in `migrations/` directory

**Core Data Models**
- Users: id, username, email, password_hash, role, balance, bonus_balance, referral_code, referred_by
- Plans: investment plans with min/max amounts, duration, progress tracking
- Investments: user investments linked to plans, tracking profit/loss and status
- Transactions: deposits, withdrawals, referral bonuses with status tracking
- Trades: live and historical trades with PnL calculations applied to active investments
- Managed Portfolios: professional portfolio management with allocation tracking
- Learning: courses, lessons, enrollments, assignments for education platform

**Business Logic Patterns**
- Transactions use numeric SQL operations to prevent race conditions (addToColumn, subFromColumn helpers)
- Investment profit/loss calculated from applied trades
- Referral system with configurable commission percentages
- Bonus balance separate from main balance with withdrawal restrictions

### Database Design

**Database Provider**
- Neon Serverless PostgreSQL (optimized for serverless deployments)
- Connection via `@neondatabase/serverless` package
- DATABASE_URL loaded from environment variables

**Schema Highlights**
- Numeric fields use `numeric(precision, scale)` for financial accuracy
- JSONB columns for flexible transaction details
- Timestamp fields with timezone support
- Foreign key constraints with cascade deletes
- Unique constraints on usernames and referral codes

**Investment Trade System**
- `investment_trades` junction table links investments to trades
- Stores applied_amount and pnl_percent for each allocation
- Enables portfolio-wide PnL calculation from multiple trades

### External Dependencies

**Third-Party Services**
- **Neon Database**: Serverless PostgreSQL hosting
- **Replit**: Development and potential deployment platform with proxy configuration

**Key NPM Packages**
- **UI**: @radix-ui/react-* (accessible component primitives), framer-motion, recharts
- **Forms**: react-hook-form, @hookform/resolvers, zod (validation)
- **Data Fetching**: @tanstack/react-query, axios
- **Database**: drizzle-orm, drizzle-kit, @neondatabase/serverless
- **Authentication**: jsonwebtoken, bcryptjs
- **Development**: vite, tsx, esbuild, concurrently

**Static Hosting Options**
- Designed for deployment to Netlify, Vercel, GitHub Pages, or traditional cPanel hosting
- Build output: `dist/` directory contains static assets
- No server-side rendering required for basic functionality

**API Integration**
- API_BASE dynamically configured based on environment (localhost vs replit.dev)
- CORS configured for Replit domains and localhost
- Proxy setup in vite.config.ts for development (/api routes → port 3000)

**Asset Management**
- Logo and images stored in `client/src/assets/`
- Font Awesome CDN for icons
- QR code generation via qrcode.react for deposit addresses