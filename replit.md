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
- **Start Screen**: Animated snake moving around start button
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

**Assets Directory Restructure and Standardization (July 19, 2025):**
- Completed comprehensive assets directory restructuring with clustering and clear naming conventions
- Renamed all files from hyphen-case to underscore_case for consistency: grass-bg.webp → grass_01.webp, snake-icon.png → snake_icon.png
- Updated all asset references across HTML, CSS, JavaScript, and asset-loader files
- Fixed font path references: Display-Dots-Two-Sans.ttf → display_dots_two_sans.ttf
- Updated background images, snake skin files, obstacle assets, and button references
- Restructured snake skin directory with cleaner file names: greeny_head.png → head.png (within greeny folder)
- Fixed game over screen asset references: retry-stone-button.png → retry_stone.png, home-stone-button.png → home_stone.png
- All assets now load correctly with standardized naming convention and improved organization
- Project structure follows best practices with lowercase + underscore naming throughout

**Asset Renaming and Code Cleanup Completion (July 19, 2025):**
- Renamed start-button.png to log.png for better semantic naming
- Updated HTML: start-button-container → log-container, start-game-btn-image → log-image
- Updated CSS: .start-button-container → .log-container (4 responsive breakpoints), .start-game-btn-image → .log-image
- Updated asset-loader.js to reference new log.png filename
- Completed comprehensive code cleanup and optimization:
  - Removed unused HTML elements: skin selector panel, empty settings section (48 lines removed)
  - Removed 9 unused JavaScript functions: setupSkinSelectorListeners(), updatePersonalityAnimations(), etc.
  - Removed 8 unused variables and DOM references: skinSelectorBtn, skinSelectorPanel, etc.
  - Fixed critical audio bug: corrected isMuted() method call to isMuted property access
  - Cleaned up console.log statements for production-ready code
  - Reduced HTML from 218 to 170 lines, JavaScript from 3,608 to 1,786 lines (major optimization)
  - CSS optimized to 1,277 lines with unused classes removed
- Project fully optimized and migration from Replit Agent to Replit environment completed
- All asset references updated and game functionality preserved

## Recent Changes

**Comprehensive Audio Control System Added (July 20, 2025):**
- Implemented Master Volume, Music Volume, and SFX Volume sliders (0-100%) with live preview
- Added persistent audio settings saved in localStorage across sessions
- Created real-time volume adjustment with immediate audio feedback
- Integrated UI Click Sounds toggle and Mobile Vibration toggle for enhanced control
- Enhanced sound download feature to export all 9 game sounds as WAV files in ZIP format
- All audio functions now use effective volume calculation (master × specific volume)
- Added preview sounds when adjusting sliders: click sound for master/SFX, music chord for music
- Modern toggle switches with smooth animations and golden jungle theme styling
- Audio settings automatically load on game start and persist across browser sessions

**UI Hover Sound Effects System (July 20, 2025):**
- Added subtle hover sound effects for all interactive UI elements (buttons, sliders, toggles)
- Gentle ascending chime sound (800Hz base + 1200Hz harmonic) with 0.15s duration
- Prevents audio spam with 300ms cooldown per element to avoid rapid hover triggering
- Respects UI Sounds setting - disabled when UI sounds are turned off
- Integrated into sound download ZIP with proper WAV file generation
- Auto-detects interactive elements: buttons, sliders, toggles, and custom UI components
- Created physical assets/audio/jungle_snake_hover.wav file following naming conventions

**Silent Auto-Start Background Music System (July 20, 2025):**
- Implemented clean auto-start background music system with 1-second delay
- Music automatically starts after 1-second delay without console warnings or errors
- Completely silent error handling - no AudioContext warnings in browser console
- Enhanced browser policy compliance with graceful fallback strategies
- Background music starts automatically on page load with clean, professional implementation
- Multiple interaction triggers ensure music starts on first user activity

**Enhanced Vibration System for All Devices (July 20, 2025):**
- Upgraded vibration functionality to work on laptops, desktops, and mobile devices
- Added gamepad vibration support for controllers connected to laptops/desktops
- Implemented multiple vibration patterns for different game events (eat food, collision, game over)
- Enhanced Web Vibration API support with fallback mechanisms for maximum compatibility
- Integrated vibration feedback into all game interactions: button clicks, eating food, collisions
- Updated settings interface to simply show "Vibration" instead of "Vibration (Mobile)"
- Different vibration intensities and patterns for immersive gameplay experience
- Comprehensive device support: mobile navigator.vibrate, gamepad controllers, web APIs

**Complete Asset Optimization (July 20, 2025):**
- Converted all 10 audio files from WAV to MP3 format (87% size reduction: 5.7MB → 700KB)
- Used optimized bitrates: 160kbps for background music, 128kbps for sound effects
- Converted all 25 images from PNG/JPG to WebP format with transparency preservation
- Updated all file references across HTML, CSS, JavaScript, and asset loader
- Maintained visual quality while achieving significant file size reduction
- Cleaned up original formats: removed all WAV, PNG, JPG files and backup directory
- Final optimized assets: 10 MP3 + 25 WebP + 2 TTF fonts = 1.7MB total
- All game functionality verified working with optimized assets

**Replit Migration Completed (July 20, 2025):**
- Successfully migrated Snake game project from Replit Agent to Replit environment
- Installed required Python dependencies (Pillow 11.3.0, NumPy) using package manager
- Verified Python 3.11 environment and server functionality on port 5000
- Confirmed all game assets loading correctly from localStorage cache (37/37 assets cached)
- Advanced caching system: Base64 localStorage storage with 50MB limit and metadata tracking
- Validated home page structure: jungle theme, log container with overlay buttons
- Security features intact: dev-toggle system with Ctrl+Shift+D for development mode
- Project running cleanly with proper client/server separation and security practices
- All functionality preserved: start screen, game mechanics, settings modal, audio system
- Asset loading optimized: instant loading from cache, skips loading screen when cached

**Complete Asset Optimization (July 20, 2025):**
- Converted all 10 audio files from WAV to MP3 format achieving 87% size reduction (5.7MB → 700KB)
- Converted all 25 images from PNG/JPG to WebP format while preserving transparency
- Updated all file references in HTML, CSS, JavaScript, and asset loader
- Optimized total assets directory from ~13MB to 1.7MB (audio: 700KB, images: 684KB, fonts: 308KB)
- Maintained visual quality and audio fidelity while significantly improving load performance
- Cleaned up original format files and backup directories for production-ready codebase

**Code Cleanup and Optimization (July 19, 2025):**
- Removed redundant comments and unused code from HTML, CSS, and JavaScript files
- Cleaned up obsolete references to removed features (snake animations, unused buttons)
- Simplified audio manager calls by removing redundant && checks
- Removed unused CSS classes for features that were previously removed
- Streamlined codebase from 3,608 lines to optimized version for better maintainability
- Project successfully migrated to Replit environment with all functionality preserved

## Previous Changes

**Complete Snake Animation Removal (July 19, 2025):**
- Completely removed all snake animation logic from the home page for maximum simplicity
- Removed SVG overlay, snake path creation, food placement, and all animation functions
- Cleaned up HTML by removing snakeAnimationOverlay div and all SVG elements
- Removed CSS styles for snake animation overlay, path container, and SVG elements
- Eliminated all JavaScript functions: initStartScreenSnake, animateStartScreenSnake, createFigure8Path, createStartScreenFood, etc.
- Home page now shows clean interface with just title, buttons, and background
- Simplified user experience without any distracting animations or moving elements

**Full-Screen Snake Animation Overlay System (July 19, 2025):**
- Created dedicated full-screen overlay layer for snake and food animations
- Moved snake SVG elements from within start-button-container to independent overlay
- Implemented transparent full-screen layer with z-index 1500 (above UI, below modals)
- Added pointer-events: none for seamless interaction with underlying UI buttons
- Snake and food animations now have unobstructed full-viewport space
- Maintained clean DOM hierarchy with isolated animation logic
- Enhanced visual focus by separating animations from cluttered UI components
- Preserved all existing snake pathfinding and food-chasing functionality

**Implemented Figure-8 Snake Path with Precise Food Placement (July 19, 2025):**
- Completely redesigned snake movement to follow exact figure-8 pattern from reference image
- Created smooth curved path with two interconnected loops around play/settings buttons
- Snake moves in continuous figure-8 motion crossing through center intersection point
- Applied advanced weighted smoothing algorithm for ultra-smooth curved animation
- Positioned 6 food items at exact locations matching reference image red spots
- Food items strategically placed outside figure-8 loops for optimal snake chasing behavior
- Enhanced pathfinding system works seamlessly with new complex curved path
- Maintained all food-chasing functionality with improved movement fluidity

**Enhanced Snake Food-Chasing System (July 19, 2025):**
- Implemented dynamic pathfinding for snake to chase nearby food items on start screen
- Added intelligent detection radius (40px) for snake to spot and pursue food
- Created smooth path interpolation system for chasing, eating, and returning behaviors
- Snake dynamically changes from figure-8 path to direct food-chasing path when food detected
- After consuming food, snake automatically returns to closest point on original path
- Food items disappear with scale/opacity animation when eaten, respawn after 3 seconds
- Implemented three-phase movement system: normal → chasing → returning → normal
- Enhanced start screen interactivity with realistic snake hunting behavior
- Maintains smooth body animation and head rotation throughout all movement phases

**Added Food Elements to Start Screen (July 19, 2025):**
- Implemented home-food.png based food system around start screen snake animation
- Added intelligent food positioning that avoids overlapping with snake's movement path
- Created 6 randomly positioned food items with minimum distance constraints from snake path and each other
- Added floating animation for food items with CSS keyframes (foodFloat animation)
- Food items use SVG image elements with subtle scale and opacity animations
- Implemented collision-free positioning system with configurable distance parameters
- Added home-food.png to asset loader for proper preloading and caching
- Food items positioned dynamically within container bounds while maintaining visual balance

**Removed Apple Elements from Home Screen (July 19, 2025):**
- Completely removed all apple-related SVG elements from start screen animation
- Cleaned up HTML by removing applesContainer and decorative apple elements 
- Removed all JavaScript apple functions: createFixedApples, updateAppleVisibility, createAppleElement, addAppleDefinitions, checkAppleCollisions, eatApple, respawnApple
- Eliminated apple collision detection and visibility management from start screen snake animation
- Streamlined start screen to show only the animated snake moving around the play button
- Maintained smooth snake animation while removing all apple interactions and visual elements
- Code optimization by removing unused apple gradient definitions and performance caching
- Clean, simplified start screen focuses purely on snake movement animation

## Previous Changes

**Updated Button System with Stone Design (July 18, 2025):**
- Replaced wooden play button with new stone-style play button featuring leaves and golden triangle
- Updated game over screen with new stone-style retry and home buttons
- Changed CSS classes from `.leaf-button` to `.stone-button` for better semantics
- Updated button hover effects for stone buttons with appropriate scaling and shadow effects
- Enhanced game over board layout with centered scores at top and buttons at bottom
- Added subtle background contrast for score labels to improve readability
- Maintained all existing functionality while updating visual design
- All buttons now feature consistent stone-and-leaf nature theme

**Enhanced Game Over Screen Layout (July 18, 2025):**
- Repositioned scores to be centered at the top of the wooden board
- Added background contrast and padding for score labels for better legibility
- Positioned retry and home buttons at the bottom center with proper spacing
- Maintained thematic nature styling with leaf-like motifs and earthy tones
- Applied clean alignment and spacing for modern, balanced look
- Enhanced visual hierarchy with proper typography and golden color scheme

**Enhanced Game Over Screen Layout (July 18, 2025):**
- Redesigned game over board layout for better visual hierarchy and clarity
- Repositioned 'Score' and 'Best Score' labels centered at the top, stacked vertically
- Added subtle background contrast to score items with rounded borders and backdrop blur
- Enhanced score label typography with increased size and letter spacing
- Improved score value styling with golden glow effects and better text shadows
- Repositioned 'Retry' and 'Home' buttons at bottom center with increased spacing
- Added improved button hover effects with enhanced shadows and brightness
- Maintained earthy, nature-themed styling with leaf motifs and wooden textures
- Applied modern spacing and alignment principles for balanced, professional appearance

**Developer Toggle System for Browser Restrictions (July 19, 2025):**
- Implemented Ctrl + Shift + D keyboard shortcut to toggle browser UI restrictions on/off
- Created comprehensive dev-toggle.js system to manage all interaction restrictions
- When restrictions are OFF: developers can use F12, right-click, select text, scroll freely
- When restrictions are ON: full protection against text selection, dragging, zooming, dev tools
- Visual notification system shows current mode with floating alerts (1-2 seconds)
- Restrictions enabled by default (production mode) for player protection
- Removed hardcoded restrictions from game.js and style.css for centralized management
- Allows seamless development and testing while maintaining production security

**Replit Migration and Project Setup (July 18, 2025):**
- Successfully migrated project from Replit Agent to Replit environment
- Verified Python 3.11 and Pillow package installation
- Confirmed server running properly on port 5000 with 0.0.0.0 binding
- All assets loading correctly including sprites, backgrounds, and UI elements
- Audio files present but with loading issues (non-critical for gameplay)
- Complete project structure validated and functioning in Replit environment
- Enhanced asset loading to prioritize fonts first, then other assets for better text rendering
- Reorganized asset loader structure with separate categories for optimized loading sequence
- Fixed home page styling with improved title positioning and layout spacing
- Adjusted title text positioning within wooden background for better visual alignment
- Repositioned both play and settings buttons on the wooden log for better visual balance
- Changed title background sizing to show complete wooden plank without cropping
- Fixed home page styling with improved title positioning, subtitle layout, and overall centering
- Optimized start-content container for better responsive layout and visual hierarchy
- Project migration completed and fully functional in Replit environment

## Previous Changes

**Game Over Screen Redesign with Custom Wooden Board (July 17, 2025):**
- Replaced default Game Over screen with custom wooden board background (game-over-board.png)
- Updated layout to display Score and Best Score in organized first row with custom styling
- Replaced generic buttons with custom leaf-style RETRY and HOME buttons (retry-button.png, home-button.png)
- Added proper jungle-themed typography using Driftwood font for score labels
- Implemented Display-Dots-Two-Sans font for score values with enhanced contrast and shadows
- Removed old CSS styling for generic buttons and implemented new leaf button system
- Enhanced hover effects with scaling and brightness filters for better user interaction
- All Game Over UI elements now match jungle theme with wooden textures and leaf designs

**Safe Area Implementation and UI Enhancement (July 17, 2025):**
- Added safe area around snake's starting position (3-block radius) where no obstacles spawn
- Modified isObstacleConflicting() function to prevent obstacle generation near snake start (10, 10)
- Updated mute button to use X symbol instead of ~ for muted state with proper SVG icons
- Added Home button to game screen (positioned left of restart button) with golden theme styling
- Fixed mute button to maintain golden SVG icons for both muted and unmuted states
- Updated both home screen and game screen mute buttons to use consistent SVG icons instead of emojis
- Enhanced home mute button with proper golden border, background, and hover effects matching restart button
- Implemented updateMuteButtonIcons() function to ensure proper icon toggling with maintained styling
- All UI buttons now maintain consistent golden theme with proper backdrop blur and shadow effects

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
- Clean start screen animation with snake movement around button
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

**Advanced Asset Caching System (July 18, 2025):**
- Implemented localStorage-based asset caching with integrity validation
- Added black screen overlay that appears immediately on page load
- Created sophisticated asset validation logic to bypass loading screens
- Implemented smooth transitions: black overlay → loading screen → start screen
- Added performance safeguards with timeout protection and cache size limits
- Enhanced asset loader with cache-first loading strategy
- Integrated asset status tracking ("cached", "needs_download", "loading")
- Added cache versioning system for automatic invalidation on updates

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