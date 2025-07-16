# Replit.md

## Overview

This is a pure HTML5, CSS3, and JavaScript snake game with a jungle theme. The project has been simplified to contain only the essential files for a standalone web game, removing all React, Node.js, and framework dependencies. The game features an animated snake on the start screen with 2 fixed apples that appear/disappear based on snake position.

## User Preferences

Preferred communication style: Simple, everyday language.
Landing page: Snake game should be the main landing page (not game hub interface).
Landing page preference: Direct access to snake game, no hub interface.

## System Architecture

### Core Files
- **index.html**: Main HTML structure with start screen and game screen
- **style.css**: Complete styling including jungle theme, animations, and responsive design
- **game.js**: Pure JavaScript game logic with Snake class and animation systems
- **serve.py**: Optional Python HTTP server for local development

### Game Features
- **Start Screen**: Animated snake moving around start button with 2 fixed apples
- **Game Logic**: Classic snake gameplay with collision detection and scoring
- **Visual Design**: Jungle theme with decorative elements and smooth animations
- **Responsive**: Works on desktop and mobile devices

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

## Recent Changes

**Simplified to Pure HTML5/CSS/JS (January 16, 2025):**
- Removed all React, Node.js, and framework dependencies
- Cleaned up project to contain only essential game files
- Implemented 2 fixed apples in start screen animation that hide when snake approaches
- Game now runs as standalone HTML5 application
- Updated start button from image to styled button element
- Project structure simplified to 3 core files: index.html, style.css, game.js

**Replit Migration (July 16, 2025):**
- Migrated from Replit Agent to Replit environment
- Fixed server configuration to use port 5000 with 0.0.0.0 binding
- Added Python 3.11 support for serving the HTML5 game
- Created assets folder and integrated custom start button image
- Replaced styled button with wooden log image (start-button.png)
- Updated CSS styling for image button with hover effects
- Replaced snake emoji with custom snake icon image (snake-icon.png)
- Added animated snake icon with wiggle effect in title
- Updated title layout to flex display for proper icon alignment