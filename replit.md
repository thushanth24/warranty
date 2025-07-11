# SubTracker Pro

## Overview
SubTracker Pro is a full-stack subscription and warranty management application built with React, Express, and PostgreSQL. The application helps users track their subscriptions, warranties, and receive reminders for upcoming renewals or expirations.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for development and build processes
- **UI Library**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: 
  - Zustand for authentication state with persistence
  - TanStack Query for server state management
- **Routing**: Wouter for client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **API Design**: RESTful endpoints with JSON responses
- **Middleware**: Express built-in middleware for JSON/URL encoding
- **Error Handling**: Centralized error handling middleware
- **Development**: Hot reloading with Vite integration

### Data Storage Solutions
- **Database**: PostgreSQL via Neon Database serverless
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema Management**: Drizzle Kit for migrations
- **Session Storage**: In-memory storage for development (MemStorage class)

## Key Components

### Authentication System
- **Method**: Phone number + OTP verification
- **Flow**: Send OTP → Verify OTP → Create/Update user
- **State**: Persistent authentication state using Zustand
- **Security**: Demo implementation (accepts any 6-digit OTP in development)

### Data Models
- **Users**: Phone number, verification status
- **Subscriptions**: Name, amount, billing cycle, category, renewal dates
- **Warranties**: Product info, vendor, purchase/expiration dates
- **Reminders**: Configurable alerts for items (7, 3, 1 days before)

### UI Components
- **Design System**: Shadcn/ui with "new-york" style variant
- **Theme**: Light/dark mode support with CSS custom properties
- **Responsive**: Mobile-first design with responsive navigation
- **Icons**: Lucide React icons + React Icons for brand logos

### Pages & Features
- **Dashboard**: Overview stats, upcoming renewals/expirations
- **Subscriptions**: CRUD operations, filtering, sorting
- **Warranties**: Product warranty tracking with expiration alerts
- **Reminders**: Configurable notification preferences

## Data Flow

### Client-Server Communication
1. Client makes API requests using TanStack Query
2. Express server handles requests with route-specific logic
3. Drizzle ORM interfaces with PostgreSQL database
4. Responses cached and managed by TanStack Query
5. UI updates reactively based on query state

### Authentication Flow
1. User enters phone number
2. Server simulates OTP sending
3. User enters OTP code
4. Server validates and returns user data
5. Client stores auth state in Zustand with persistence

### State Management
- **Server State**: TanStack Query for API data, caching, and synchronization
- **Client State**: Zustand for authentication and app-level state
- **Form State**: React Hook Form for complex form management
- **UI State**: React hooks for component-level state

## External Dependencies

### Core Framework Dependencies
- React ecosystem (React, React DOM, React Router via Wouter)
- Express.js for server framework
- TypeScript for type safety

### Database & ORM
- Drizzle ORM with PostgreSQL dialect
- Neon Database serverless PostgreSQL
- Drizzle Kit for schema management

### UI & Styling
- Tailwind CSS for utility-first styling
- Radix UI primitives for accessible components
- Lucide React and React Icons for iconography
- Class Variance Authority for component variants

### Development Tools
- Vite for build tooling and development server
- ESBuild for production server bundling
- Replit-specific plugins for development environment

## Deployment Strategy

### Development Environment
- **Server**: Node.js with tsx for TypeScript execution
- **Client**: Vite development server with HMR
- **Database**: Neon Database with environment variable configuration
- **Integration**: Unified development experience through Vite middleware

### Production Build
- **Client**: Vite builds optimized React bundle to `dist/public`
- **Server**: ESBuild bundles Express server to `dist/index.js`
- **Assets**: Static files served by Express in production
- **Database**: PostgreSQL connection via DATABASE_URL environment variable

### Build Commands
- `dev`: Development mode with hot reloading
- `build`: Production build for both client and server
- `start`: Production server startup
- `db:push`: Deploy database schema changes

The application is designed as a monorepo with shared TypeScript types between client and server, ensuring type safety across the full stack. The architecture supports both development and production environments with appropriate tooling for each stage.