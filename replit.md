# Replit.md

## Overview

This is a full-stack web application built with React/TypeScript frontend and Express.js backend. The project uses Drizzle ORM with PostgreSQL for data persistence, and is configured for 3D graphics with Three.js. The application appears to be set up as a game or interactive experience with audio support and comprehensive UI components.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and building
- **Styling**: Tailwind CSS with custom theme configuration
- **UI Components**: Radix UI primitives with custom shadcn/ui components
- **3D Graphics**: Three.js with React Three Fiber ecosystem (@react-three/fiber, @react-three/drei, @react-three/postprocessing)
- **State Management**: Zustand for global state (game state, audio state)
- **Data Fetching**: TanStack Query (React Query) for server state management

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Runtime**: Node.js with ESM modules
- **Development**: tsx for TypeScript execution
- **Build**: esbuild for production bundling
- **Middleware**: Built-in Express middleware for JSON parsing and URL encoding

### Database Layer
- **ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL (configured for Neon Database via @neondatabase/serverless)
- **Migrations**: Drizzle Kit for schema management
- **Schema Location**: `./shared/schema.ts` for shared types between frontend and backend

## Key Components

### Database Schema
- **Users Table**: Basic user authentication with username/password
- **Shared Types**: Common types exported from `shared/schema.ts`
- **Validation**: Zod schemas for runtime type validation

### Storage Layer
- **Interface**: `IStorage` interface defining CRUD operations
- **Implementation**: `MemStorage` class for in-memory storage (development/testing)
- **Methods**: User creation, retrieval by ID and username

### Frontend State Management
- **Game State**: Phase management (ready/playing/ended) with Zustand
- **Audio State**: Sound management with mute/unmute functionality
- **Component State**: Local state for UI components

### Development Tools
- **Hot Reload**: Vite HMR with runtime error overlay
- **Type Checking**: Strict TypeScript configuration
- **GLSL Support**: Shader support for advanced 3D graphics

## Data Flow

1. **Client Requests**: Frontend makes API calls using TanStack Query
2. **API Routes**: Express routes handle HTTP requests (prefixed with `/api`)
3. **Storage Layer**: Controllers use storage interface for data operations
4. **Database Operations**: Drizzle ORM manages PostgreSQL interactions
5. **Response**: JSON responses sent back to client
6. **State Updates**: Client updates local state via Zustand stores

## External Dependencies

### Core Runtime
- **Database**: Neon PostgreSQL serverless database
- **Authentication**: Custom username/password (expandable)

### Development Dependencies
- **Radix UI**: Accessible UI primitives
- **Tailwind CSS**: Utility-first styling
- **Three.js Ecosystem**: 3D graphics and animations
- **Fontsource**: Web font loading (@fontsource/inter)

### Build and Development
- **Vite**: Development server and build tool
- **ESBuild**: Fast JavaScript bundler
- **PostCSS**: CSS processing with Tailwind

## Deployment Strategy

### Build Process
1. **Frontend Build**: Vite builds React app to `dist/public`
2. **Backend Build**: ESBuild bundles server code to `dist/index.js`
3. **Static Assets**: Frontend assets served by Express in production

### Environment Configuration
- **Database URL**: Required environment variable for PostgreSQL connection
- **Production Mode**: NODE_ENV=production for optimized serving
- **Asset Handling**: Support for 3D models (.gltf, .glb) and audio files (.mp3, .ogg, .wav)

### Scripts
- `dev`: Development server with hot reload
- `build`: Production build for both frontend and backend
- `start`: Production server startup
- `db:push`: Database schema synchronization

The application is designed for real-time interactive experiences with 3D graphics, audio feedback, and persistent user data. The modular architecture allows for easy extension of game mechanics, additional storage backends, and enhanced 3D features.