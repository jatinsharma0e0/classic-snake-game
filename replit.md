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

**Critical Bug Fixes and Code Optimization (July 17, 2025):**
- Fixed critical duplicate game initialization issue that caused memory leaks and conflicting instances
- Resolved missing AudioManager integration by implementing proper null checks throughout codebase
- Fixed conflicting snake rendering methods by removing duplicate drawSnakeBody() function
- Implemented proper object pool initialization in constructor for performance optimizations
- Added comprehensive null safety checks for all audio manager references
- Cleaned up orphaned code and ensured all methods are properly called
- Fixed asset loader dependency integration for smooth loading experience
- Preserved start screen snake animation with apple collision system
- Enhanced error handling to prevent crashes when audio system is not available
- Optimized game initialization flow to prevent duplicate event listeners
- All critical errors identified in code analysis have been resolved

## Previous Changes

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

**Enhanced Game Features (July 16, 2025):**
- Enhanced game screen with jungle-themed green gradient background
- Replaced circular snake segments with continuous blue snake body
- Added distinct snake head with white eyes and black pupils
- Implemented mouth opening animation when within 1 block of food
- Added red tongue animation that appears randomly every 5-9 seconds when not eating
- Snake mouth opens with visible teeth and fangs when approaching food
- Added smooth connections between snake segments for fluid movement
- Snake now starts with 3 blocks minimum body length for better gameplay
- Added obstacle system with 4 types: 1-block-rock, 2-blocks-rock, 4-blocks-rock, 1-block-obstacle
- Obstacles generate with specific counts: 3 big rocks (4-blocks), 4-5 medium rocks (2-blocks), 5-6 small rocks/obstacles
- Obstacles cause game over on collision and are avoided by food generation
- Doubled game area size from 400x400 to 800x800 pixels for expanded gameplay
- Updated game area to 40 blocks width by 24 blocks height (800x480 pixels) with rectangular gameplay field
- Added hit animation with knockback effect and 1-second delay before Game Over screen
- Implemented screen shake, red flash, and directional knockback based on collision type
- Snake cannot start moving with left arrow key to prevent immediate self-collision
- Snake pupils change to X X immediately upon death and remain visible throughout hit animation
- Updated start screen with beautiful jungle background image for immersive experience
- Enhanced text styling with better contrast and readability over new background
- Removed animated grid elements (trees, vines, leaves) to showcase clean jungle background image
- Added wiggle animation to snake's tongue for more dynamic and flexible appearance
- Tongue now shows subtle side-to-side wiggle and vertical bobbing when extended
- Added grass level background image to game canvas for enhanced visual environment
- Replaced gradient background with detailed grass texture featuring white flowers and natural elements
- Removed old grid pattern overlay to showcase clean grass background texture
- Repositioned snake head features (eyes, mouth, tongue) to front of head as shown in reference images
- Added directional rotation so head features rotate with snake movement direction
- Eyes now positioned at front of head with proper vertical separation
- Mouth and tongue positioned at front tip of head for realistic appearance
- Enhanced tongue wiggle animation with increased amplitude and visibility
- Increased tongue display duration and frequency for better visual feedback

**Audio System Implementation (July 16, 2025):**
- Added comprehensive audio system with Web Audio API synthesis for cartoonish sound effects
- Implemented cheerful button click sounds for all menu interactions
- Added upbeat game start fanfare when gameplay begins
- Included subtle snake movement sounds (played every 10th move to avoid repetition)
- Created satisfying eating sound effects when snake consumes food
- Added playful tongue flick sounds with random timing (every 10-15 seconds)
- Implemented funny collision sounds for wall and obstacle hits
- Added dramatic hit impact sounds during knockback animation
- Created lighthearted game over sound sequence
- Implemented calm background music loop for menu screen (stops during gameplay)
- Added mute/unmute button with speaker icon in game header
- Organized all audio files in assets/audio/ directory with proper structure
- Created audio file generator tool for converting Web Audio synthesis to downloadable files
- All sounds designed to be joyful, cartoonish, and non-intrusive to match game theme

**Replit Migration Complete (July 16, 2025):**
- Successfully migrated from Replit Agent to Replit environment
- Installed Python 3.11 support for server functionality
- Verified all assets loading correctly on port 5000 with proper 0.0.0.0 binding
- Added restart icon button next to score display for instant game restart
- Fixed background music to only play on start screen, not during gameplay
- Enhanced mute functionality to respect screen context

**Adorable Mint Green Snake with Warm Accents (July 17, 2025):**
- Redesigned with appealing mint green color palette for friendly, lively appearance
- Base colors: Light to vibrant mint green gradient with creamy yellow belly accent
- Added soft coral pink cheek spots for extra charm and cuteness
- Enhanced eyes with deep blue-gray pupils and white sparkles for friendlier look
- Vibrant coral red tongue provides warm color contrast
- Creamy yellow belly stripe adds visual interest and depth
- Color palette designed to be visually striking yet harmonious with game theme
- Bright, warm tones create adorable, non-threatening character
- Perfect contrast with grass background while maintaining clear visibility
- Cohesive color scheme enhances snake's cuteness and game's cheerful aesthetic

**Enhanced Audio System with Whimsical Background Music (July 16, 2025):**
- Completely redesigned background music with cartoon-style composition featuring:
  - Playful marimba, xylophone, bells, pizzicato strings, and soft flute timbres
  - 32-second seamless loop with varied instrumental sections
  - Warm bass line and subtle percussion for harmonic richness
  - Whimsical melody in C major with bouncy, cheerful progressions
- Background music intelligently stops during gameplay for focus
- Smart screen detection prevents music from playing inappropriately
- Comprehensive sound effects system with cartoonish, joyful tones
- All audio balanced for non-intrusive, engaging experience
- Mute functionality respects current screen context

**User Interaction Restrictions & Game Protection (July 16, 2025):**
- Implemented comprehensive user interaction restrictions to prevent unintended actions
- Prevented text selection across all pages and elements using CSS user-select: none
- Disabled image and element dragging with user-drag: none properties
- Blocked browser right-click context menu throughout the entire application
- Prevented mobile long-press menus and touch callouts on all devices
- Disabled mobile zooming with touch-action: manipulation and viewport meta settings
- Blocked double-tap zoom behavior specifically on iOS devices
- Prevented page scrolling during gameplay and locked viewport in place
- Blocked common keyboard shortcuts (F12, Ctrl+Shift+I, Ctrl+U, Ctrl+S, F5, Ctrl+R)
- Added modal blocking functionality that prevents clicks on underlying elements during Game Over screen
- Implemented canvas focus management to ensure keyboard controls remain responsive throughout gameplay
- Added automatic canvas refocusing when focus is lost during active gameplay
- All restrictions feel seamless and don't interfere with legitimate game interactions

**Performance Optimization for 60 FPS (July 16, 2025):**
- Completely rewritten game loop using requestAnimationFrame with adaptive frame rate management
- Implemented FPS monitoring and automatic performance scaling for low-end devices
- Added canvas context optimizations (alpha: false, desynchronized: true, powerPreference: 'high-performance')
- Created comprehensive caching system for gradients, patterns, and frequently used graphics
- Implemented dirty region rendering to minimize unnecessary canvas clears
- Added object pooling and memory management to reduce garbage collection
- Optimized snake rendering with single-path drawing and cached gradients
- Simplified shadow and blur effects for mobile performance
- Added throttled keyboard input handling to prevent spam and improve responsiveness
- Implemented audio source limiting and cleanup to prevent performance degradation
- Added frustum culling for off-screen objects to reduce draw calls
- Enhanced CSS with hardware acceleration (translateZ, will-change, backface-visibility)
- Created render state caching to skip redundant drawing operations
- All optimizations maintain visual quality while targeting 60 FPS on low-end hardware

**Bug Fix: Snake Body Sprite Orientation (July 17, 2025):**
- Fixed critical bug where snake body sprites used wrong orientation
- Corrected logic in drawSnakeBodySprite() function to properly distinguish between horizontal and vertical movement
- When snake moves horizontally (left/right), now correctly uses body_horizontal.png sprite
- When snake moves vertically (up/down), now correctly uses body_vertical.png sprite
- Fixed condition to check if direction vectors are zero for straight segments
- Snake body segments now properly align with movement direction for visual consistency

**Custom Skins System Implementation (July 17, 2025):**
- Implemented comprehensive custom skins system for snake and food personalization
- Added Spritesheet Slicer Tool that accepts 1080×1080px sprite sheets and slices them into 3×3 grid (360×360px per cell)
- Created skin editor interface (skin-editor.html) with drag-and-drop upload functionality
- Added automatic sprite sheet processing with empty cell detection and segment mapping
- Implemented skin gallery with preview thumbnails and selection system
- Added localStorage-based skin management supporting up to 10 custom skins
- Created segment mapping system: Body Turn (0,0), Body Straight (0,1), Head (0,2), Tail (1,0), Food (2,0), Dead Head (2,2)
- Updated game engine to support dynamic skin loading and fallback rendering
- Added skin editor button to main menu with intuitive navigation
- Custom skins persist across game sessions and integrate seamlessly with existing sprite system

**Default Skin Preparation (July 17, 2025):**
- Safely removed old default snake skin assets (assets/snakes/greeny/) while preserving game logic
- Removed old food sprite assets (assets/food/apple/) in preparation for new default skin
- Updated game code to use fallback rendering when no skin assets are available
- Modified skin editor to show built-in default placeholder instead of missing image references
- Prepared loadDefaultSkin() function for easy integration of new default skin assets
- Game now gracefully handles missing sprite assets with optimized fallback rendering
- All custom skin functionality remains intact and ready for new default skin integration

**New Default Greeny Skin Integration (July 17, 2025):**
- Successfully integrated new greeny snake skin with dead head variant using 1080×1080px sprite sheet
- Created assets/sprites/greeny/ directory to store original sprite sheet
- Created assets/skins/greeny/ directory with sliced individual sprites (360×360px each)
- Implemented automatic sprite sheet slicing with Python tool for 3×3 grid layout
- Mapped greeny sprites to game elements: head, body_straight, body_turn, tail, food, dead_head
- Updated loadDefaultSkin() function to load greeny sprites with proper sprite mapping
- All game sprites now use the new greeny skin by default with proper fallback support

**Asset Preloading & Loading Screen System (July 17, 2025):**
- Implemented comprehensive asset preloading system for lag-free performance
- Added beautiful jungle-themed loading screen with progress bar and animated snake
- Created AssetLoader class that preloads all game assets before showing main menu
- Preloads core assets, obstacle images, snake sprites, food sprites, and audio files
- Loading screen shows progress with themed messages and smooth progress bar animation
- Added animated snake segments and wiggling snake icon during loading
- Game only initializes after all assets are fully loaded ensuring smooth gameplay
- Optimized for all devices with parallel asset loading for maximum performance

**Snake Animation Orientation Enhancement (July 17, 2025):**
- Implemented dynamic sprite rotation system for proper snake segment orientation
- Added drawRotatedSprite() helper function for canvas rotation-based rendering
- Enhanced head sprite to rotate based on movement direction (up, down, left, right)
- Improved body segments to properly orient straight and turn sprites with correct rotation angles
- Updated tail sprite to point in the correct direction relative to previous segment
- Simplified sprite loading to use base sprites (head, body_straight, body_turn, tail) with rotation
- Snake segments now properly face their movement direction for visually coherent animation
- All turns and directional changes display smooth and accurate sprite orientations