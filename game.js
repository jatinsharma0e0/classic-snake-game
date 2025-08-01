class SnakeGame {
    constructor() {
        // Canvas setup with performance optimizations
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d', {
            alpha: false,              // Disable transparency for better performance
            desynchronized: true,      // Allow async rendering
            powerPreference: 'high-performance'
        });
        
        // Game settings
        this.gridSize = 20;
        this.tileCountX = 40; // 40 blocks width
        this.tileCountY = 24; // 24 blocks height
        
        // Performance optimization settings
        this.targetFPS = 60;
        this.frameDuration = 1000 / this.targetFPS;
        this.lastFrameTime = 0;
        this.deltaTime = 0;
        this.gameSpeed = 120; // Base game speed in ms
        this.lastGameUpdate = 0;
        this.frameCount = 0;
        this.fpsBuffer = [];
        this.maxFpsBufferSize = 30;
        
        // Loop management for performance optimization
        this.animationFrameId = null;
        this.isLoopActive = false;
        this.shouldRender = true;
        
        // Game state
        this.gameRunning = false;
        this.gameStarted = false;
        this.gameOverTimeout = null;
        this.score = 0;
        this.highScore = this.getHighScore();
        this.hitAnimation = false;
        this.hitAnimationTimer = 0;
        this.knockbackOffset = { x: 0, y: 0 };
        this.isDead = false;
        
        // Performance caching
        this.imageCache = new Map();
        this.gradientCache = new Map();
        this.pathCache = new Map();
        this.dirtyRegions = [];
        this.lastRenderState = null;
        
        // Snake properties - Start with 3 blocks
        this.snake = [
            { x: 10, y: 10 },
            { x: 9, y: 10 },
            { x: 8, y: 10 }
        ];
        this.direction = { x: 0, y: 0 };
        this.lastDirection = { x: 0, y: 0 };
        

        

        
        // Food properties - Normal random generation for gameplay
        this.food = this.generateFood();
        
        // Obstacle properties
        this.obstacles = [];
        this.obstacleImages = {};
        
        // Snake sprite images
        this.snakeImages = {};
        
        // Background image
        this.grassBg = new Image();
        this.grassBg.src = 'assets/backgrounds/grass_01.webp';
        
        // Audio system - will be initialized after assets load
        this.audioManager = null;
        this.moveCounter = 0; // For subtle movement sounds
        
        // DOM elements
        this.startScreen = document.getElementById('startScreen');
        this.gameScreen = document.getElementById('gameScreen');
        this.startGameBtn = document.getElementById('startGameBtn');
        this.stonePlayBtn = document.querySelector('.stone-play-button-overlay');

        this.settingsBtn = document.getElementById('settingsBtn');
        this.settingsModal = document.getElementById('settingsModal');
        this.closeSettingsBtn = document.getElementById('closeSettingsBtn');
        this.startScreenHighScore = document.getElementById('startScreenHighScore');
        this.scoreElement = document.getElementById('score');
        this.highScoreElement = document.getElementById('highScore');
        this.gameOverScreen = document.getElementById('gameOverScreen');
        this.finalScoreElement = document.getElementById('finalScore');
        this.bestScoreElement = document.getElementById('bestScore');
        this.restartBtn = document.getElementById('restartBtn');
        this.restartGameBtn = document.getElementById('restartGameBtn');
        this.backToMenuBtn = document.getElementById('backToMenuBtn');
        this.homeBtn = document.getElementById('homeBtn');
        this.muteBtn = document.getElementById('muteBtn');
        this.homeMuteBtn = document.getElementById('homeMuteBtn');
        this.tutorialOverlay = document.getElementById('tutorialOverlay');
        
        // Custom skin system
        this.currentSkin = 'default';
        this.customSkinImages = {};
        

        
        // Initialize game
        this.init();
        
        // Load obstacle images
        this.loadObstacleImages();
        
        // Load snake sprite images
        this.loadSnakeImages();
        
        // Load custom skin if available
        this.loadCustomSkin();
        
        // Initialize skin selector
        this.loadAvailableSkins();
        

    }
    
    init() {
        // Show start screen initially
        this.showStartScreen();
        
        // Update score displays
        this.updateScoreDisplay();
        this.startScreenHighScore.textContent = this.highScore;
        
        // Event listeners
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        // Stone play button event listener
        if (this.stonePlayBtn) {
            this.stonePlayBtn.addEventListener('click', () => {
                if (this.audioManager) {
                    this.audioManager.resumeAudioContext().then(() => {
                        // Only start background music if not already playing
                        if (this.audioManager.onStartScreen && !this.audioManager.isMuted && !this.audioManager.backgroundMusic) {
                            this.audioManager.playBackgroundMusic();
                        }
                        this.audioManager.playSound('buttonClick');
                        this.audioManager.vibrateForEvent('button_click');
                    });
                }
                this.showGameScreen();
            });
        }
        
        // Settings button functionality
        this.settingsBtn.addEventListener('click', () => {
            if (this.audioManager) {
                this.audioManager.resumeAudioContext().then(() => {
                    // Only start background music if not already playing
                    if (this.audioManager.onStartScreen && !this.audioManager.isMuted && !this.audioManager.backgroundMusic) {
                        this.audioManager.playBackgroundMusic();
                    }
                    this.audioManager.playSound('buttonClick');
                    this.audioManager.vibrateForEvent('button_click');
                });
            }
            this.settingsModal.classList.remove('hidden');
        });
        
        this.closeSettingsBtn.addEventListener('click', () => {
            this.settingsModal.classList.add('hidden');
        });
        
        // Close settings modal when clicking outside
        this.settingsModal.addEventListener('click', (e) => {
            if (e.target === this.settingsModal || e.target.classList.contains('settings-overlay')) {
                this.settingsModal.classList.add('hidden');
            }
        });
        
        // Settings sound toggle
        const soundToggle = document.getElementById('soundToggle');
        if (soundToggle) {
            soundToggle.addEventListener('click', () => {
                if (this.audioManager) {
                    this.audioManager.toggleMute();
                    this.updateSoundToggleButton();
                }
            });
        }

        // Settings download sounds button
        const downloadSoundsBtn = document.getElementById('downloadSoundsBtn');
        if (downloadSoundsBtn) {
            downloadSoundsBtn.addEventListener('click', async () => {
                if (this.audioManager) {
                    this.audioManager.playSound('buttonClick');
                    // Show loading state
                    downloadSoundsBtn.disabled = true;
                    downloadSoundsBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>Processing...';
                    
                    try {
                        await this.audioManager.downloadAllSounds();
                    } catch (error) {
                        console.error('Download failed:', error);
                    } finally {
                        // Restore button state
                        downloadSoundsBtn.disabled = false;
                        downloadSoundsBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>Download';
                    }
                }
            });
        }
        
        // Settings skin selection
        const skinOptions = document.querySelectorAll('.skin-selection-grid .skin-option');
        skinOptions.forEach(option => {
            option.addEventListener('click', () => {
                // Remove selected class from all options
                skinOptions.forEach(opt => opt.classList.remove('selected'));
                // Add selected class to clicked option
                option.classList.add('selected');
                // Apply skin immediately
                const skinName = option.dataset.skin;
                this.applySkin(skinName);
            });
        });
        this.restartBtn.addEventListener('click', () => {
            if (this.audioManager) {
                this.audioManager.playSound('buttonClick');
                this.audioManager.vibrateForEvent('button_click');
            }
            this.restartGame();
        });
        this.restartGameBtn.addEventListener('click', () => {
            if (this.audioManager) {
                this.audioManager.playSound('buttonClick');
                this.audioManager.vibrateForEvent('button_click');
            }
            this.restartGame();
        });
        this.backToMenuBtn.addEventListener('click', () => {
            if (this.audioManager) {
                this.audioManager.playSound('buttonClick');
                this.audioManager.vibrateForEvent('button_click');
            }
            
            // Unblock interactions when returning to menu
            this.blockUnderlyingInteractions(false);
            
            this.showStartScreen();
        });
        
        this.homeBtn.addEventListener('click', () => {
            if (this.audioManager) {
                this.audioManager.playSound('buttonClick');
                this.audioManager.vibrateForEvent('button_click');
            }
            
            // Unblock interactions when returning to menu
            this.blockUnderlyingInteractions(false);
            
            this.showStartScreen();
        });
        // Mute button functionality for both buttons
        const handleMuteToggle = () => {
            if (this.audioManager) {
                const isMuted = this.audioManager.toggleMute();
                
                // Update both mute buttons with SVG icons
                this.updateMuteButtonIcons(isMuted);
                
                if (!isMuted) {
                    this.audioManager.playSound('buttonClick');
                    this.audioManager.vibrateForEvent('button_click');
                }
            }
        };
        
        this.muteBtn.addEventListener('click', handleMuteToggle);
        if (this.homeMuteBtn) {
            this.homeMuteBtn.addEventListener('click', handleMuteToggle);
        }
        
        // Tutorial overlay dismissal
        const dismissTutorial = () => {
            this.tutorialOverlay.classList.add('fade-out');
            setTimeout(() => {
                this.tutorialOverlay.style.display = 'none';
            }, 300);
        };
        
        this.tutorialOverlay.addEventListener('click', dismissTutorial);
        
        // Setup interaction restrictions
        this.setupInteractionRestrictions();
        
        // Setup optimized performance features
        this.setupOptimizedKeyboardHandling();

        
        // Initialize game loop but don't start yet - will be started when needed
        this.initializeGameLoop();
    }
    
    updateMuteButtonIcons(isMuted) {
        // SVG for unmuted state (sound on)
        const unmuteIcon = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 5L6 9H2v6h4l5 4V5zM19.07 4.93l-1.41 1.41A8.98 8.98 0 0 1 21 12a8.98 8.98 0 0 1-3.34 5.66l1.41 1.41A10.97 10.97 0 0 0 23 12a10.97 10.97 0 0 0-3.93-7.07zM16.24 7.76l-1.41 1.41A4.98 4.98 0 0 1 17 12a4.98 4.98 0 0 1-2.17 2.83l1.41 1.41A6.97 6.97 0 0 0 19 12a6.97 6.97 0 0 0-2.76-4.24z"/>
            </svg>
        `;
        
        // SVG for muted state (sound off)
        const muteIcon = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 5L6 9H2v6h4l5 4V5z"/>
                <line x1="23" y1="9" x2="17" y2="15"/>
                <line x1="17" y1="9" x2="23" y2="15"/>
            </svg>
        `;
        
        // Update both mute buttons
        this.muteBtn.innerHTML = isMuted ? muteIcon : unmuteIcon;
        if (this.homeMuteBtn) {
            this.homeMuteBtn.innerHTML = isMuted ? muteIcon : unmuteIcon;
        }
        
        // Update settings sound toggle button
        const soundToggle = document.getElementById('soundToggle');
        if (soundToggle) {
            if (isMuted) {
                soundToggle.classList.add('muted');
                soundToggle.innerHTML = muteIcon;
            } else {
                soundToggle.classList.remove('muted');
                soundToggle.innerHTML = unmuteIcon;
            }
        }
    }
    
    updateSoundToggleButton() {
        if (this.audioManager) {
            const isMuted = this.audioManager.isMuted;
            this.updateMuteButtonIcons(isMuted);
        }
    }
    






    setupOptimizedKeyboardHandling() {
        // Optimized keyboard handling with throttling
        this.keyBuffer = {};
        this.lastKeyTime = 0;
        this.keyThrottleDelay = 50; // 50ms throttle
        

    }



    loadAvailableSkins() {
        // Load available skins for the skin selector
        // For now, we only have the default greeny skin

    }



    applySkin(skinName) {
        this.currentSkin = skinName;
        localStorage.setItem('selectedSkin', skinName);
        // The skin will be applied during the next render cycle
    }
    
    loadObstacleImages() {
        const imageNames = ['rock_1_block', 'rock_2_blocks', 'rock_4_blocks', 'rock_1_block_alt'];
        
        imageNames.forEach(name => {
            const img = new Image();
            img.src = `assets/obstacles/${name}.webp`;
            this.obstacleImages[name] = img;
        });
    }
    
    loadSnakeImages() {
        // Initialize empty snake images object - will be populated by default skin or custom skin
        this.snakeImages = {};
        
        // Initialize apple image - will be loaded by default skin or custom skin
        this.appleImage = null;
        
        // Load default skin if no custom skin is selected
        this.loadDefaultSkin();
    }
    
    loadDefaultSkin() {
        // Load the new greeny default skin - using single sprites with rotation
        this.defaultSkinLoaded = false;
        
        // Map greeny sprites to game sprite names (simplified for rotation-based rendering)
        const spriteMapping = {
            'head_up': 'assets/snake/skins/greeny/head.webp',
            'dead_head': 'assets/snake/skins/greeny/dead_head.webp',
            'body_horizontal': 'assets/snake/skins/greeny/body_straight.webp',
            'body_turn_left_down': 'assets/snake/skins/greeny/body_turn.webp',
            'tail_up': 'assets/snake/skins/greeny/tail.webp'
        };
        
        // Load each sprite
        Object.keys(spriteMapping).forEach(spriteName => {
            const img = new Image();
            img.src = spriteMapping[spriteName];
            this.snakeImages[spriteName] = img;
        });
        
        // Load the food sprite
        this.appleImage = new Image();
        this.appleImage.src = 'assets/snake/skins/greeny/food.webp';
        
        this.defaultSkinLoaded = true;
    }
    
    // Helper function to draw rotated sprites
    drawRotatedSprite(image, x, y, width, height, rotation) {
        this.ctx.save();
        
        // Move to the center of where we want to draw the sprite
        const centerX = x + width / 2;
        const centerY = y + height / 2;
        this.ctx.translate(centerX, centerY);
        
        // Rotate around the center
        this.ctx.rotate(rotation);
        
        // Draw the image centered on the rotation point
        this.ctx.drawImage(image, -width / 2, -height / 2, width, height);
        
        this.ctx.restore();
    }
    
    loadCustomSkin() {
        // Check if a custom skin is selected
        const selectedSkin = localStorage.getItem('currentSkin');
        if (selectedSkin && selectedSkin !== 'default') {
            this.currentSkin = selectedSkin;
            
            // Load custom skin from localStorage
            const savedSkins = JSON.parse(localStorage.getItem('customSkins') || '[]');
            const skinData = savedSkins.find(skin => skin.id === selectedSkin);
            
            if (skinData && skinData.segments) {
                this.customSkinImages = {};
                
                // Map sprite sheet segments to game sprite names
                const segmentMapping = {
                    '0-0': ['body_turn_left_down', 'body_turn_up_left', 'body_turn_down_right', 'body_turn_right_up'], // Body Turn (rotatable)
                    '0-1': ['body_horizontal', 'body_vertical'], // Body Straight (rotatable)
                    '0-2': ['head_up', 'head_down', 'head_left', 'head_right'], // Head (rotatable)
                    '1-0': ['tail_up', 'tail_down', 'tail_left', 'tail_right'], // Tail (rotatable)
                    '2-0': ['apple'], // Food
                    '2-2': ['dead_head'] // Dead Head
                };
                
                // Load each segment into multiple sprite variants
                Object.keys(segmentMapping).forEach(segmentKey => {
                    const segment = skinData.segments[segmentKey];
                    if (segment && !segment.isEmpty) {
                        const spriteNames = segmentMapping[segmentKey];
                        spriteNames.forEach(spriteName => {
                            const img = new Image();
                            img.src = segment.dataURL;
                            this.customSkinImages[spriteName] = img;
                        });
                    }
                });
                

            }
        }
    }
    
    getSnakeImage(spriteName) {
        // Return custom skin image if available, otherwise default
        if (this.currentSkin !== 'default' && this.customSkinImages[spriteName]) {
            return this.customSkinImages[spriteName];
        }
        return this.snakeImages[spriteName];
    }
    
    getFoodImage() {
        // Return custom food image if available, otherwise default
        if (this.currentSkin !== 'default' && this.customSkinImages['apple']) {
            return this.customSkinImages['apple'];
        }
        return this.appleImage;
    }
    
    generateObstacles() {
        this.obstacles = [];
        
        // Define obstacle counts and types
        const obstacleConfig = [
            { type: 'rock_4_blocks', width: 2, height: 2, count: 3 },
            { type: 'rock_2_blocks', width: 2, height: 1, count: 4 + Math.floor(Math.random() * 2) }, // 4-5
            { type: 'rock_1_block', width: 1, height: 1, count: Math.floor(Math.random() * 4) + 2 }, // 2-5
            { type: 'rock_1_block_alt', width: 1, height: 1, count: Math.floor(Math.random() * 4) + 2 } // 2-5
        ];
        
        // Ensure small obstacles total 5-6
        const totalSmall = obstacleConfig[2].count + obstacleConfig[3].count;
        if (totalSmall < 5) {
            const difference = 5 - totalSmall;
            obstacleConfig[2].count += Math.floor(difference / 2);
            obstacleConfig[3].count += Math.ceil(difference / 2);
        } else if (totalSmall > 6) {
            const difference = totalSmall - 6;
            obstacleConfig[2].count -= Math.floor(difference / 2);
            obstacleConfig[3].count -= Math.ceil(difference / 2);
        }
        
        // Generate obstacles based on configuration
        for (let config of obstacleConfig) {
            for (let i = 0; i < config.count; i++) {
                // Find a valid position that doesn't conflict with snake or food
                let position;
                let attempts = 0;
                do {
                    position = {
                        x: Math.floor(Math.random() * (this.tileCountX - config.width)),
                        y: Math.floor(Math.random() * (this.tileCountY - config.height))
                    };
                    attempts++;
                } while (this.isObstacleConflicting(position, config) && attempts < 100);
                
                if (attempts < 100) {
                    this.obstacles.push({
                        x: position.x,
                        y: position.y,
                        type: config.type,
                        width: config.width,
                        height: config.height
                    });
                }
            }
        }
    }
    
    isObstacleConflicting(position, obstacle) {
        // Define safe area around snake's starting position (10, 10)
        const safeAreaRadius = 3; // 3 blocks radius around starting position
        const snakeStartX = 10;
        const snakeStartY = 10;
        
        // Check if obstacle is within safe area
        for (let dx = 0; dx < obstacle.width; dx++) {
            for (let dy = 0; dy < obstacle.height; dy++) {
                const obstacleX = position.x + dx;
                const obstacleY = position.y + dy;
                
                // Check if this part of the obstacle is within the safe area
                if (Math.abs(obstacleX - snakeStartX) <= safeAreaRadius && 
                    Math.abs(obstacleY - snakeStartY) <= safeAreaRadius) {
                    return true;
                }
            }
        }
        
        // Check conflict with snake
        for (let segment of this.snake) {
            for (let dx = 0; dx < obstacle.width; dx++) {
                for (let dy = 0; dy < obstacle.height; dy++) {
                    if (segment.x === position.x + dx && segment.y === position.y + dy) {
                        return true;
                    }
                }
            }
        }
        
        // Check conflict with food
        for (let dx = 0; dx < obstacle.width; dx++) {
            for (let dy = 0; dy < obstacle.height; dy++) {
                if (this.food.x === position.x + dx && this.food.y === position.y + dy) {
                    return true;
                }
            }
        }
        
        // Check conflict with other obstacles
        for (let existingObstacle of this.obstacles) {
            if (this.rectanglesOverlap(
                position.x, position.y, obstacle.width, obstacle.height,
                existingObstacle.x, existingObstacle.y, existingObstacle.width, existingObstacle.height
            )) {
                return true;
            }
        }
        
        return false;
    }
    
    rectanglesOverlap(x1, y1, w1, h1, x2, y2, w2, h2) {
        return !(x1 + w1 <= x2 || x2 + w2 <= x1 || y1 + h1 <= y2 || y2 + h2 <= y1);
    }
    
    checkObstacleCollision(head) {
        if (!this.obstacles || !Array.isArray(this.obstacles)) {
            return false;
        }
        for (let obstacle of this.obstacles) {
            for (let dx = 0; dx < obstacle.width; dx++) {
                for (let dy = 0; dy < obstacle.height; dy++) {
                    if (head.x === obstacle.x + dx && head.y === obstacle.y + dy) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    
    showStartScreen() {
        this.startScreen.classList.remove('hidden');
        this.gameScreen.classList.add('hidden');
        this.gameRunning = false;
        this.gameStarted = false;
        
        // Update high score display on start screen
        this.startScreenHighScore.textContent = this.highScore;
        
        // Set audio manager to start screen mode and play background music
        this.audioManager && this.audioManager.setScreen(true);
        this.audioManager && this.audioManager.resumeAudioProcessing();
        
        // Pause game loop when on start screen to save performance
        this.pauseGameLoop();
    }
    
    showGameScreen() {
        this.startScreen.classList.add('hidden');
        this.gameScreen.classList.remove('hidden');
        
        // Ensure interactions are unblocked when entering game
        this.blockUnderlyingInteractions(false);
        
        // Show tutorial overlay
        this.tutorialOverlay.style.display = 'flex';
        this.tutorialOverlay.classList.remove('fade-out');
        
        // Reset and start the game
        this.gameRunning = true;
        this.gameStarted = true;
        this.gameOverScreen.classList.add('hidden');
        
        // Reset game state - Start with 3 blocks
        this.snake = [
            { x: 10, y: 10 },
            { x: 9, y: 10 },
            { x: 8, y: 10 }
        ];
        this.direction = { x: 0, y: 0 };
        this.lastDirection = { x: 0, y: 0 };
        this.score = 0;
        this.isDead = false;
        this.generateObstacles();
        this.food = this.generateFood();
        this.updateScoreDisplay();
        
        // Set audio manager to game screen mode and play game start sound
        this.audioManager && this.audioManager.setScreen(false);
        this.audioManager && this.audioManager.resumeAudioProcessing();
        this.audioManager && this.audioManager.playSound('gameStart');
        this.audioManager && this.audioManager.vibrateForEvent('button_click');
        
        // Resume game loop when entering game screen
        this.resumeGameLoop();
    }
    
    handleKeyPress(e) {
        // Prevent default behavior for game keys
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyA', 'KeyS', 'KeyD', 'Space', 'Escape'].includes(e.code)) {
            e.preventDefault();
        }
        
        // Dismiss tutorial overlay on any key press except ESC
        if (e.code !== 'Escape' && this.tutorialOverlay && this.tutorialOverlay.style.display !== 'none' && !this.tutorialOverlay.classList.contains('fade-out')) {
            this.tutorialOverlay.classList.add('fade-out');
            setTimeout(() => {
                this.tutorialOverlay.style.display = 'none';
            }, 300);
        }
        
        // ESC to return to menu
            if (e.code === 'Escape') {
                if (this.isInStartScreen) {
                    return; // Already showing start screen — do nothing
                }
                this.isInStartScreen = true;

                this.showStartScreen();

                // Optional: reset the flag when ready
                // If `showStartScreen` itself resets the flag when done, then great.
                // Otherwise you can reset after a delay or when some event happens.
                return;
            }
        
        // Start game or restart with Space (only when on game screen)
        if (e.code === 'Space' && !this.startScreen.classList.contains('hidden')) {
            return; // Space does nothing on start screen
        }
        
        if (e.code === 'Space') {
            if (!this.gameStarted || !this.gameRunning) {
                this.startGame();
            }
            return;
        }
        
        // Don't process movement if game is not running or on start screen
        if (!this.gameRunning || !this.startScreen.classList.contains('hidden')) return;
        
        const newDirection = { ...this.direction };
        
        // Check if snake has started moving (not stationary)
        const hasStartedMoving = this.lastDirection.x !== 0 || this.lastDirection.y !== 0;
        
        // Handle movement keys
        switch (e.code) {
            case 'ArrowUp':
            case 'KeyW':
                if (this.lastDirection.y !== 1) { // Prevent reverse direction
                    newDirection.x = 0;
                    newDirection.y = -1;
                }
                break;
            case 'ArrowDown':
            case 'KeyS':
                if (this.lastDirection.y !== -1) { // Prevent reverse direction
                    newDirection.x = 0;
                    newDirection.y = 1;
                }
                break;
            case 'ArrowLeft':
            case 'KeyA':
                // Don't allow left arrow to start the game (would cause immediate collision)
                if (!hasStartedMoving) {
                    return; // Ignore left arrow when snake hasn't started moving
                }
                if (this.lastDirection.x !== 1) { // Prevent reverse direction
                    newDirection.x = -1;
                    newDirection.y = 0;
                }
                break;
            case 'ArrowRight':
            case 'KeyD':
                if (this.lastDirection.x !== -1) { // Prevent reverse direction
                    newDirection.x = 1;
                    newDirection.y = 0;
                }
                break;
        }
        
        this.direction = newDirection;
    }
    
    startGame() {
        // This method is only called when Space is pressed on game screen
        this.gameRunning = true;
        this.gameStarted = true;
        this.gameOverScreen.classList.add('hidden');
        
        // Reset game state - Start with 3 blocks
        this.snake = [
            { x: 10, y: 10 },
            { x: 9, y: 10 },
            { x: 8, y: 10 }
        ];
        this.direction = { x: 0, y: 0 };
        this.lastDirection = { x: 0, y: 0 };
        this.score = 0;
        this.isDead = false;
        this.generateObstacles();
        this.food = this.generateFood();
        this.updateScoreDisplay();
    }
    
    restartGame() {
        // Unblock interactions when restarting
        this.blockUnderlyingInteractions(false);
        
        // Resume optimizations when restarting
        this.shouldRender = true;
        this.audioManager && this.audioManager.resumeAudioProcessing();
        
        this.startGame();
    }
    
    generateFood() {
        let foodPosition;
        
        // Keep generating until we find a position not occupied by snake or obstacles
        do {
            foodPosition = {
                x: Math.floor(Math.random() * this.tileCountX),
                y: Math.floor(Math.random() * this.tileCountY)
            };
        } while (this.snake.some(segment => 
            segment.x === foodPosition.x && segment.y === foodPosition.y
        ) || this.isPositionInObstacle(foodPosition));
        
        return foodPosition;
    }
    
    isPositionInObstacle(position) {
        if (!this.obstacles || !Array.isArray(this.obstacles)) {
            return false;
        }
        for (let obstacle of this.obstacles) {
            for (let dx = 0; dx < obstacle.width; dx++) {
                for (let dy = 0; dy < obstacle.height; dy++) {
                    if (position.x === obstacle.x + dx && position.y === obstacle.y + dy) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    
    updateGame() {
        if (!this.gameRunning) return;
        
        // Don't move if no direction is set (snake hasn't started moving)
        if (this.direction.x === 0 && this.direction.y === 0) return;
        
        // Move snake
        const head = { ...this.snake[0] };
        head.x += this.direction.x;
        head.y += this.direction.y;
        
        // Check wall collision
        if (head.x < 0 || head.x >= this.tileCountX || 
            head.y < 0 || head.y >= this.tileCountY) {
            this.audioManager && this.audioManager.playSound('collision');
            this.audioManager && this.audioManager.vibrateForEvent('collision');
            this.gameOver();
            return;
        }
        
        // Check self collision (excluding the current head position)
        for (let i = 1; i < this.snake.length; i++) {
            if (this.snake[i].x === head.x && this.snake[i].y === head.y) {
                this.audioManager && this.audioManager.playSound('collision');
                this.audioManager && this.audioManager.vibrateForEvent('collision');
                this.gameOver();
                return;
            }
        }
        
        // Check obstacle collision
        if (this.checkObstacleCollision(head)) {
            this.audioManager && this.audioManager.playSound('collision');
            this.audioManager && this.audioManager.vibrateForEvent('collision');
            this.gameOver();
            return;
        }
        
        this.snake.unshift(head);
        
        // Play subtle movement sound occasionally
        this.moveCounter++;
        if (this.moveCounter % 10 === 0) { // Every 10th move
            this.audioManager && this.audioManager.playSound('snakeMove');
        }
        

        
        // Check food collision
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.updateScoreDisplay();
            this.food = this.generateFood();
            
            // Play eating sound and vibration
            this.audioManager && this.audioManager.playSound('eatFood');
            this.audioManager && this.audioManager.vibrateForEvent('eat_food');
            
            // Update high score if needed
            if (this.score > this.highScore) {
                this.highScore = this.score;
                this.saveHighScore();
            }
        } else {
            // Remove tail if no food eaten
            this.snake.pop();
        }
        
        // Update last direction for reverse prevention
        if (this.direction.x !== 0 || this.direction.y !== 0) {
            this.lastDirection = { ...this.direction };
        }
    }
    

    
    gameOver() {
        // Prevent multiple game over calls
        if (!this.gameRunning) return;
        
        this.gameRunning = false;
        
        // Clear any existing game over timeout to prevent duplicates
        if (this.gameOverTimeout) {
            clearTimeout(this.gameOverTimeout);
        }
        
        // Mark snake as dead (for X X eyes)
        this.isDead = true;
        
        // Play hit impact sound and game over vibration
        this.audioManager && this.audioManager.playSound('hitImpact');
        this.audioManager && this.audioManager.vibrateForEvent('game_over');
        
        // Start hit animation
        this.hitAnimation = true;
        this.hitAnimationTimer = 0;
        
        // Calculate knockback direction based on collision type
        const head = this.snake[0];
        this.knockbackOffset = { x: 0, y: 0 };
        
        // Check what was hit for knockback direction
        if (head.x < 0) {
            this.knockbackOffset.x = 3; // Hit left wall, knockback right
        } else if (head.x >= this.tileCountX) {
            this.knockbackOffset.x = -3; // Hit right wall, knockback left
        } else if (head.y < 0) {
            this.knockbackOffset.y = 3; // Hit top wall, knockback down
        } else if (head.y >= this.tileCountY) {
            this.knockbackOffset.y = -3; // Hit bottom wall, knockback up
        } else {
            // Hit obstacle or self - random knockback
            this.knockbackOffset.x = (Math.random() - 0.5) * 6;
            this.knockbackOffset.y = (Math.random() - 0.5) * 6;
        }
        
        // Show game over screen after animation delay
        this.gameOverTimeout = setTimeout(() => {
            // Double check game is still not running
            if (this.gameRunning) return;
            
            this.hitAnimation = false;
            this.knockbackOffset = { x: 0, y: 0 };
            this.finalScoreElement.textContent = this.score;
            this.bestScoreElement.textContent = this.highScore;
            
            // Block interactions with underlying elements during modal
            this.blockUnderlyingInteractions(true);
            
            this.gameOverScreen.classList.remove('hidden');
            
            // Play game over sound
            this.audioManager && this.audioManager.playSound('gameOver');
            
            // Reduce loop frequency when game over screen is shown
            this.shouldRender = false; // Stop rendering until needed
            this.audioManager && this.audioManager.pauseAudioProcessing(); // Pause audio processing
            
            // Clear the timeout reference
            this.gameOverTimeout = null;
        }, 1000);
    }
    
    render() {
        // CRITICAL FIX: Always perform full canvas clear to prevent snake flickering
        // Dirty region optimization was causing snake invisibility issues
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw background (cached)
        this.drawJungleBackgroundOptimized();
        
        // Apply hit animation effects
        if (this.hitAnimation) {
            this.ctx.save();
            
            // Update hit animation timer with delta time
            this.hitAnimationTimer += this.deltaTime;
            
            // Create shake effect
            const shakeIntensity = Math.max(0, 1 - this.hitAnimationTimer / 1000);
            const shakeX = (Math.random() - 0.5) * 10 * shakeIntensity;
            const shakeY = (Math.random() - 0.5) * 10 * shakeIntensity;
            
            // Apply knockback and shake
            this.ctx.translate(
                this.knockbackOffset.x * shakeIntensity + shakeX,
                this.knockbackOffset.y * shakeIntensity + shakeY
            );
            
            // Flash effect (optimized)
            const flashIntensity = Math.sin(this.hitAnimationTimer * 0.02) * 0.5 + 0.5;
            this.ctx.globalAlpha = 0.7 + flashIntensity * 0.3;
            
            // Red tint overlay
            this.ctx.fillStyle = `rgba(255, 0, 0, ${0.3 * shakeIntensity})`;
            this.ctx.fillRect(-20, -20, this.canvas.width + 40, this.canvas.height + 40);
        }
        
        // Draw obstacles (optimized)
        this.drawObstaclesOptimized();
        
        // Draw food (optimized)
        this.drawAppleSprite(this.food.x * this.gridSize, this.food.y * this.gridSize);
        
        // Draw continuous snake (optimized)
        this.drawContinuousSnakeOptimized();
        
        // Draw start message if game hasn't started
        if (!this.gameStarted) {
            this.drawStartMessage();
        }
        
        // Restore canvas state if hit animation was applied
        if (this.hitAnimation) {
            this.ctx.restore();
        }
        
        // Note: Dirty regions optimization disabled to fix snake visibility
        // Performance is still excellent with full canvas clear on modern devices
    }
    
    // Optimized background drawing with caching
    drawJungleBackgroundOptimized() {
        if (this.grassBg.complete) {
            // Cache pattern if not exists
            if (!this.imageCache.has('backgroundPattern')) {
                const pattern = this.ctx.createPattern(this.grassBg, 'no-repeat');
                this.imageCache.set('backgroundPattern', pattern);
            }
            
            this.ctx.drawImage(this.grassBg, 0, 0, this.canvas.width, this.canvas.height);
        } else {
            // Use cached gradient for fallback
            if (!this.gradientCache.has('backgroundGradient')) {
                const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
                gradient.addColorStop(0, '#9ACD32');
                gradient.addColorStop(0.25, '#7FFF00');
                gradient.addColorStop(0.5, '#ADFF2F');
                gradient.addColorStop(0.75, '#98FB98');
                gradient.addColorStop(1, '#90EE90');
                this.gradientCache.set('backgroundGradient', gradient);
            }
            
            this.ctx.fillStyle = this.gradientCache.get('backgroundGradient');
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }
    
    drawObstaclesOptimized() {
        if (!this.obstacles || !Array.isArray(this.obstacles)) {
            return;
        }
        
        // Performance: batch draw operations
        for (let obstacle of this.obstacles) {
            const img = this.obstacleImages[obstacle.type];
            if (img && img.complete) {
                // Simple frustum culling - only draw if on screen
                const x = obstacle.x * this.gridSize;
                const y = obstacle.y * this.gridSize;
                const width = obstacle.width * this.gridSize;
                const height = obstacle.height * this.gridSize;
                
                if (x + width >= 0 && x <= this.canvas.width && 
                    y + height >= 0 && y <= this.canvas.height) {
                    this.ctx.drawImage(img, x, y, width, height);
                }
            }
        }
    }
    

    
    drawSnakeBody(x, y) {
        const centerX = x + this.gridSize / 2;
        const centerY = y + this.gridSize / 2;
        const radius = this.gridSize / 2 - 1;
        
        // Main body (lighter blue gradient)
        const gradient = this.ctx.createRadialGradient(
            centerX - radius/3, centerY - radius/3, 0,
            centerX, centerY, radius
        );
        gradient.addColorStop(0, '#7FB3D3');
        gradient.addColorStop(1, '#5499C7');
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Shadow
        this.ctx.shadowColor = 'rgba(84, 153, 199, 0.4)';
        this.ctx.shadowBlur = 6;
        this.ctx.shadowOffsetX = 1;
        this.ctx.shadowOffsetY = 1;
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;
    }
    
    drawAppleOptimized(x, y) {
        const centerX = x + this.gridSize / 2;
        const centerY = y + this.gridSize / 2;
        const radius = this.gridSize / 2 - 2;
        
        // Cache apple gradient for reuse
        const gradientKey = `apple_${radius}`;
        if (!this.gradientCache.has(gradientKey)) {
            const appleGradient = this.ctx.createRadialGradient(
                -radius/3, -radius/3, 0, 0, 0, radius
            );
            appleGradient.addColorStop(0, '#FF6B6B');
            appleGradient.addColorStop(1, '#E74C3C');
            this.gradientCache.set(gradientKey, appleGradient);
        }
        
        // Performance: reduce canvas state changes
        this.ctx.save();
        this.ctx.translate(centerX, centerY);
        
        // Apple body
        this.ctx.fillStyle = this.gradientCache.get(gradientKey);
        this.ctx.beginPath();
        this.ctx.arc(0, 1, radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Simplified shadow (no blur for performance)
        this.ctx.fillStyle = 'rgba(231, 76, 60, 0.3)';
        this.ctx.beginPath();
        this.ctx.arc(2, 3, radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Apple stem
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(-1, -radius - 2, 2, 4);
        
        // Leaf
        this.ctx.fillStyle = '#27AE60';
        this.ctx.beginPath();
        this.ctx.ellipse(3, -radius, 3, 2, Math.PI / 4, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Apple highlight
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        this.ctx.beginPath();
        this.ctx.arc(-radius/3, -radius/3, radius/3, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.restore();
    }
    
    drawAppleSprite(x, y) {
        // Use custom food image if available
        const foodImg = this.getFoodImage();
        if (foodImg && foodImg.complete) {
            this.ctx.drawImage(foodImg, x, y, this.gridSize, this.gridSize);
        } else {
            // Fallback to original apple drawing if sprite not loaded
            this.drawAppleOptimized(x, y);
        }
    }
    
    drawJungleBackground() {
        // Draw grass background image if loaded
        if (this.grassBg.complete) {
            this.ctx.drawImage(this.grassBg, 0, 0, this.canvas.width, this.canvas.height);
        } else {
            // Fallback gradient background while image loads
            const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
            gradient.addColorStop(0, '#9ACD32');
            gradient.addColorStop(0.25, '#7FFF00');
            gradient.addColorStop(0.5, '#ADFF2F');
            gradient.addColorStop(0.75, '#98FB98');
            gradient.addColorStop(1, '#90EE90');
            
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }
    
    drawContinuousSnakeOptimized() {
        if (this.snake.length === 0) return;
        
        // Use sprite-based snake rendering
        this.drawSpriteBasedSnake();
    }
    
    drawSpriteBasedSnake() {
        if (this.snake.length === 0) return;
        
        // Draw each segment with appropriate sprite
        for (let i = 0; i < this.snake.length; i++) {
            const segment = this.snake[i];
            const x = segment.x * this.gridSize;
            const y = segment.y * this.gridSize;
            
            if (i === 0) {
                // Draw head
                this.drawSnakeHeadSprite(x, y);
            } else if (i === this.snake.length - 1) {
                // Draw tail
                this.drawSnakeTailSprite(x, y, i);
            } else {
                // Draw body segment
                this.drawSnakeBodySprite(x, y, i);
            }
        }
    }
    
    drawSnakeHeadSprite(x, y) {
        // Use the dead head sprite when snake is dead, otherwise use normal head
        const headSprite = this.isDead ? 'dead_head' : 'head_up';
        const img = this.getSnakeImage(headSprite);
        
        if (img && img.complete && img.naturalWidth > 0) {
            // Calculate rotation angle based on movement direction
            // Default sprite faces right, so adjust rotations accordingly
            let rotation = 0;
            if (this.direction.x === 1) rotation = 0; // Right: 0° (default orientation)
            else if (this.direction.x === -1) rotation = Math.PI; // Left: 180°
            else if (this.direction.y === 1) rotation = Math.PI / 2; // Down: 90°
            else if (this.direction.y === -1) rotation = -Math.PI / 2; // Up: -90°
            
            // Draw rotated sprite
            this.drawRotatedSprite(img, x, y, this.gridSize, this.gridSize, rotation);
        } else {
            // Fallback to optimized head rendering if sprite fails
            this.drawSnakeHeadOptimized();
        }
    }
    
    drawSnakeBodySprite(x, y, index) {
        const current = this.snake[index];
        const prev = this.snake[index - 1];
        const next = this.snake[index + 1];
        
        if (prev && next) {
            // Determine if this is a corner or straight segment
            const prevDir = { x: current.x - prev.x, y: current.y - prev.y };
            const nextDir = { x: next.x - current.x, y: next.y - current.y };
            
            let spriteType, rotation = 0;
            
            if (prevDir.x === nextDir.x && prevDir.x === 0) {
                // Vertical straight segment (moving up/down)
                spriteType = 'body_straight';
                rotation = Math.PI / 2; // Rotate 90° for vertical (default is horizontal)
            } else if (prevDir.y === nextDir.y && prevDir.y === 0) {
                // Horizontal straight segment (moving left/right)
                spriteType = 'body_straight';
                rotation = 0; // No rotation for horizontal (default orientation)
            } else {
                // Corner piece - use turn sprite and rotate appropriately
                spriteType = 'body_turn';
                
                // Determine rotation based on turn direction
                // The corner sprite shows a curve from top-left to bottom-right by default
                if ((prevDir.x === -1 && nextDir.y === 1) || (prevDir.y === -1 && nextDir.x === 1)) {
                    // left→down or up→right corner
                    rotation = 0; // Base orientation
                } else if ((prevDir.y === -1 && nextDir.x === -1) || (prevDir.x === 1 && nextDir.y === 1)) {
                    // up→left or right→down corner
                    rotation = Math.PI / 2; // 90°
                } else if ((prevDir.x === 1 && nextDir.y === -1) || (prevDir.y === 1 && nextDir.x === -1)) {
                    // right→up or down→left corner
                    rotation = Math.PI; // 180°
                } else if ((prevDir.y === 1 && nextDir.x === 1) || (prevDir.x === -1 && nextDir.y === -1)) {
                    // down→right or left→up corner  
                    rotation = -Math.PI / 2; // -90°
                }
            }
            
            // Get the appropriate sprite
            const spriteName = spriteType === 'body_straight' ? 'body_horizontal' : 'body_turn_left_down';
            const img = this.getSnakeImage(spriteName);
            
            if (img && img.complete && img.naturalWidth > 0) {
                this.drawRotatedSprite(img, x, y, this.gridSize, this.gridSize, rotation);
            } else {
                // Fallback: draw a simple colored square as body segment
                this.ctx.fillStyle = '#7ED091'; // Match the mint green theme
                this.ctx.fillRect(x + 2, y + 2, this.gridSize - 4, this.gridSize - 4);
            }
        }
    }
    
    drawSnakeTailSprite(x, y, index) {
        const current = this.snake[index];
        const prev = this.snake[index - 1];
        
        if (prev) {
            // Use the greeny tail sprite and rotate it based on direction
            const img = this.getSnakeImage('tail_up'); // Use base tail sprite
            if (img && img.complete && img.naturalWidth > 0) {
                // Determine tail direction - tail should point TOWARD the previous segment
                const direction = { x: prev.x - current.x, y: prev.y - current.y };
                
                // Tail should point toward the previous segment (opposite of movement direction)
                // Default tail sprite points up, so adjust rotations accordingly
                let rotation = 0;
                if (direction.x === 1) rotation = Math.PI / 2;  // Point right: 90°
                else if (direction.x === -1) rotation = -Math.PI / 2;  // Point left: -90°
                else if (direction.y === 1) rotation = Math.PI;  // Point down: 180°
                else if (direction.y === -1) rotation = 0;  // Point up: 0° (default orientation)
                
                this.drawRotatedSprite(img, x, y, this.gridSize, this.gridSize, rotation);
            } else {
                // Fallback: draw a smaller colored circle as tail
                this.ctx.fillStyle = '#6BB77B'; // Slightly darker mint for tail
                const centerX = x + this.gridSize / 2;
                const centerY = y + this.gridSize / 2;
                const radius = this.gridSize * 0.3;
                this.ctx.beginPath();
                this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }
    }
    

    
    drawSnakeHeadOptimized() {
        if (this.snake.length === 0) return;
        
        const head = this.snake[0];
        const centerX = head.x * this.gridSize + this.gridSize / 2;
        const centerY = head.y * this.gridSize + this.gridSize / 2;
        const radius = this.gridSize * 0.4;
        
        // Calculate rotation angle based on direction
        let angle = 0;
        if (this.direction.x === 1) angle = 0; // Right
        else if (this.direction.x === -1) angle = Math.PI; // Left
        else if (this.direction.y === 1) angle = Math.PI / 2; // Down
        else if (this.direction.y === -1) angle = -Math.PI / 2; // Up
        

        
        // Cache adorable mint green snake head with warm highlights
        if (!this.gradientCache.has('adorableSnakeHead')) {
            const gradient = this.ctx.createRadialGradient(-radius/3, -radius/3, 0, 0, 0, radius);
            gradient.addColorStop(0, '#B8F2D1'); // Lightest mint highlight
            gradient.addColorStop(0.3, '#A8E6CF'); // Light mint green
            gradient.addColorStop(0.7, '#88D8A3'); // Fresh mint
            gradient.addColorStop(1, '#6BB77B'); // Deeper mint for depth
            this.gradientCache.set('adorableSnakeHead', gradient);
        }
        
        // Performance: save/restore only when needed
        this.ctx.save();
        this.ctx.translate(centerX, centerY);
        this.ctx.rotate(angle);
        
        // Adorable rounded head with mint green gradient
        this.ctx.fillStyle = this.gradientCache.get('adorableSnakeHead');
        this.ctx.beginPath();
        this.ctx.arc(0, 0, radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Add cute coral pink cheek spots for extra charm
        this.ctx.fillStyle = '#FFB3BA'; // Soft coral pink
        this.ctx.globalAlpha = 0.6;
        this.ctx.beginPath();
        this.ctx.arc(-radius * 0.6, radius * 0.2, radius * 0.15, 0, Math.PI * 2);
        this.ctx.arc(radius * 0.6, radius * 0.2, radius * 0.15, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.globalAlpha = 1.0;
        
        // Draw simple white eyes like in the reference image
        const eyeOffset = radius * 0.4;
        const eyeSize = radius * 0.25;
        
        // Simple white circular eyes
        if (!this.isBlinking) {
            this.ctx.fillStyle = 'white';
            this.ctx.beginPath();
            this.ctx.arc(-eyeOffset, -radius * 0.3, eyeSize, 0, Math.PI * 2);
            this.ctx.arc(eyeOffset, -radius * 0.3, eyeSize, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // Adorable pupils with sparkle
        if (this.isDead) {
            // X X for dead eyes
            this.ctx.strokeStyle = '#2C3E50'; // Deep blue-gray instead of harsh black
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            // Left eye X
            this.ctx.moveTo(-eyeOffset - eyeSize * 0.5, -radius * 0.3 - eyeSize * 0.5);
            this.ctx.lineTo(-eyeOffset + eyeSize * 0.5, -radius * 0.3 + eyeSize * 0.5);
            this.ctx.moveTo(-eyeOffset + eyeSize * 0.5, -radius * 0.3 - eyeSize * 0.5);
            this.ctx.lineTo(-eyeOffset - eyeSize * 0.5, -radius * 0.3 + eyeSize * 0.5);
            // Right eye X
            this.ctx.moveTo(eyeOffset - eyeSize * 0.5, -radius * 0.3 - eyeSize * 0.5);
            this.ctx.lineTo(eyeOffset + eyeSize * 0.5, -radius * 0.3 + eyeSize * 0.5);
            this.ctx.moveTo(eyeOffset + eyeSize * 0.5, -radius * 0.3 - eyeSize * 0.5);
            this.ctx.lineTo(eyeOffset - eyeSize * 0.5, -radius * 0.3 + eyeSize * 0.5);
            this.ctx.stroke();
        } else if (!this.isBlinking) {
            // Charming deep blue pupils
            this.ctx.fillStyle = '#2C3E50'; // Deep blue-gray for friendlier look
            this.ctx.beginPath();
            this.ctx.arc(-eyeOffset, -radius * 0.3, eyeSize * 0.3, 0, Math.PI * 2);
            this.ctx.arc(eyeOffset, -radius * 0.3, eyeSize * 0.3, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Add cute white sparkles
            this.ctx.fillStyle = 'white';
            this.ctx.beginPath();
            this.ctx.arc(-eyeOffset + eyeSize * 0.15, -radius * 0.3 - eyeSize * 0.15, eyeSize * 0.08, 0, Math.PI * 2);
            this.ctx.arc(eyeOffset + eyeSize * 0.15, -radius * 0.3 - eyeSize * 0.15, eyeSize * 0.08, 0, Math.PI * 2);
            this.ctx.fill();
        }
        

        
        this.ctx.restore();
    }
    
    // Removed duplicate drawSnakeBody method - using optimized version only
    
    drawSnakeHead() {
        if (this.snake.length === 0) return;
        
        const head = this.snake[0];
        const centerX = head.x * this.gridSize + this.gridSize / 2;
        const centerY = head.y * this.gridSize + this.gridSize / 2;
        const radius = this.gridSize * 0.4;
        
        // Calculate rotation angle based on direction
        let angle = 0;
        if (this.direction.x === 1) angle = 0; // Right
        else if (this.direction.x === -1) angle = Math.PI; // Left
        else if (this.direction.y === 1) angle = Math.PI / 2; // Down
        else if (this.direction.y === -1) angle = -Math.PI / 2; // Up
        
        // Save context for rotation
        this.ctx.save();
        this.ctx.translate(centerX, centerY);
        this.ctx.rotate(angle);
        
        // Head circle (same as body color)
        this.ctx.fillStyle = '#4169E1';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Head highlight
        this.ctx.fillStyle = '#6495ED';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, radius * 0.7, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Eyes positioned at front of head (like in the images)
        const eyeSize = 4;
        const eyeOffsetX = radius * 0.3; // Forward position on head
        const eyeOffsetY = radius * 0.4; // Vertical separation
        
        // Left eye (white background)
        this.ctx.fillStyle = 'white';
        this.ctx.beginPath();
        this.ctx.arc(eyeOffsetX, -eyeOffsetY, eyeSize, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Right eye (white background)
        this.ctx.beginPath();
        this.ctx.arc(eyeOffsetX, eyeOffsetY, eyeSize, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Eye pupils - show X X when dead, normal pupils when alive
        if (this.isDead) {
            // Draw X X pupils for dead snake
            this.ctx.strokeStyle = 'black';
            this.ctx.lineWidth = 2;
            
            // Left eye X
            this.ctx.beginPath();
            this.ctx.moveTo(eyeOffsetX - 2, -eyeOffsetY - 2);
            this.ctx.lineTo(eyeOffsetX + 2, -eyeOffsetY + 2);
            this.ctx.moveTo(eyeOffsetX + 2, -eyeOffsetY - 2);
            this.ctx.lineTo(eyeOffsetX - 2, -eyeOffsetY + 2);
            this.ctx.stroke();
            
            // Right eye X
            this.ctx.beginPath();
            this.ctx.moveTo(eyeOffsetX - 2, eyeOffsetY - 2);
            this.ctx.lineTo(eyeOffsetX + 2, eyeOffsetY + 2);
            this.ctx.moveTo(eyeOffsetX + 2, eyeOffsetY - 2);
            this.ctx.lineTo(eyeOffsetX - 2, eyeOffsetY + 2);
            this.ctx.stroke();
        } else {
            // Normal pupils
            this.ctx.fillStyle = 'black';
            this.ctx.beginPath();
            this.ctx.arc(eyeOffsetX, -eyeOffsetY, eyeSize/2, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.beginPath();
            this.ctx.arc(eyeOffsetX, eyeOffsetY, eyeSize/2, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Eye shine
            this.ctx.fillStyle = 'white';
            this.ctx.beginPath();
            this.ctx.arc(eyeOffsetX + 1, -eyeOffsetY - 1, 1, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.beginPath();
            this.ctx.arc(eyeOffsetX + 1, eyeOffsetY - 1, 1, 0, Math.PI * 2);
            this.ctx.fill();
        }
        

        
        // Restore context
        this.ctx.restore();
    }
    

    
    drawStartMessage() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Press SPACE to Start', this.canvas.width / 2, this.canvas.height / 2 - 20);
        
        this.ctx.font = '16px Arial';
        this.ctx.fillText('Use Arrow Keys or WASD to move', this.canvas.width / 2, this.canvas.height / 2 + 20);
        
        // Reset text align
        this.ctx.textAlign = 'left';
    }
    
    updateScoreDisplay() {
        this.scoreElement.textContent = this.score;
        this.highScoreElement.textContent = this.highScore;
    }
    
    getHighScore() {
        return parseInt(localStorage.getItem('snakeHighScore') || '0');
    }
    
    saveHighScore() {
        localStorage.setItem('snakeHighScore', this.highScore.toString());
        this.updateScoreDisplay();
    }
    
    gameLoop(currentTime) {
        // Exit if loop should not be active
        if (!this.isLoopActive) {
            this.animationFrameId = null;
            return;
        }
        
        // Initialize timing on first frame
        if (!this.lastFrameTime) {
            this.lastFrameTime = currentTime;
            this.lastGameUpdate = currentTime;
        }
        
        // Calculate delta time
        this.deltaTime = currentTime - this.lastFrameTime;
        this.lastFrameTime = currentTime;
        
        // FPS monitoring for adaptive performance
        this.updateFPS(this.deltaTime);
        
        // Adaptive frame rate - reduce update frequency on low-end devices
        const adaptiveFrameDuration = this.getAdaptiveFrameDuration();
        
        if (this.deltaTime >= adaptiveFrameDuration) {
            // Update game logic at fixed intervals - only when game is running
            if (this.gameRunning && currentTime - this.lastGameUpdate >= this.gameSpeed) {
                if (!this.hitAnimation) {
                    this.updateGame();
                }
                this.lastGameUpdate = currentTime;
            }
            
            // Only render when needed
            if (this.shouldRender) {
                this.render();
                this.frameCount++;
            }
        }
        
        // Continue game loop using RAF for optimal timing
        this.animationFrameId = requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    // Initialize game loop without starting it
    initializeGameLoop() {
        this.isLoopActive = false;
        this.shouldRender = false;
        // Game loop will be started when needed
    }
    
    // Resume game loop for active gameplay
    resumeGameLoop() {
        if (this.isLoopActive) return; // Already active
        
        this.isLoopActive = true;
        this.shouldRender = true;
        this.lastFrameTime = 0; // Reset timing
        this.animationFrameId = requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    // Pause game loop to save performance when not needed
    pauseGameLoop() {
        this.isLoopActive = false;
        this.shouldRender = false;
        
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }
    
    updateFPS(deltaTime) {
        const fps = 1000 / deltaTime;
        this.fpsBuffer.push(fps);
        
        if (this.fpsBuffer.length > this.maxFpsBufferSize) {
            this.fpsBuffer.shift();
        }
    }
    
    getAverageFPS() {
        if (this.fpsBuffer.length === 0) return 60;
        const sum = this.fpsBuffer.reduce((a, b) => a + b, 0);
        return sum / this.fpsBuffer.length;
    }
    
    getAdaptiveFrameDuration() {
        const avgFPS = this.getAverageFPS();
        
        // If FPS is consistently low, reduce update frequency
        if (avgFPS < 30) {
            return this.frameDuration * 2; // 30 FPS
        } else if (avgFPS < 45) {
            return this.frameDuration * 1.33; // 45 FPS
        }
        
        return this.frameDuration; // Target 60 FPS
    }
    
    setupInteractionRestrictions() {
        // Note: Browser UI restrictions are now managed by dev-toggle.js
        // This allows developers to toggle restrictions on/off with Ctrl+Shift+D
        
        // Ensure canvas maintains focus during gameplay
        this.maintainCanvasFocus();
        
        // Prevent scrolling with arrow keys and space during gameplay only
        document.addEventListener('keydown', (e) => {
            if (this.gameRunning && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
                e.preventDefault();
            }
        });
    }
    
    maintainCanvasFocus() {
        // Focus canvas when game starts
        this.canvas.addEventListener('click', () => {
            this.canvas.focus();
        });
        
        // Refocus canvas if it loses focus during gameplay
        const refocusCanvas = () => {
            if (this.gameRunning && document.activeElement !== this.canvas) {
                setTimeout(() => {
                    this.canvas.focus();
                }, 10);
            }
        };
        
        document.addEventListener('blur', refocusCanvas);
        window.addEventListener('blur', refocusCanvas);
        
        // Make canvas focusable
        this.canvas.setAttribute('tabindex', '0');
        this.canvas.style.outline = 'none';
    }
    
    blockUnderlyingInteractions(isBlocked) {
        // Block interactions with underlying elements during modals
        if (isBlocked) {
            document.body.style.pointerEvents = 'none';
            // Allow interaction only with modal elements
            const modalElements = document.querySelectorAll('.game-over, .game-over *, .tutorial-overlay, .tutorial-overlay *');
            modalElements.forEach(element => {
                element.style.pointerEvents = 'auto';
            });
        } else {
            document.body.style.pointerEvents = 'auto';
        }
    }
    
    // All snake animation functions removed for simplified home page

    
    // Food creation functions removed for simplified home page
    // All animation helper functions removed for simplified home page
    
    // All animation and food functions removed for simplified home page
}

function fadeFromBlackToStart() {
    const blackOverlay = document.getElementById('blackOverlay');
    const loadingScreen = document.getElementById('loadingScreen');
    const startScreen = document.getElementById('startScreen');
    
    console.log('Starting transition to start screen');
    
    // Hide loading screen and black overlay
    if (loadingScreen) {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }
    
    if (blackOverlay) {
        blackOverlay.style.opacity = '0';
        setTimeout(() => {
            blackOverlay.style.display = 'none';
        }, 500);
    }
    
    // Show start screen with smooth transition
    if (startScreen) {
        startScreen.style.display = 'block';
        startScreen.style.opacity = '0';
        startScreen.style.transition = 'opacity 0.8s ease-in';
        
        setTimeout(() => {
            startScreen.style.opacity = '1';
        }, 100);
    }
    
    // Initialize game instance after transition starts
    setTimeout(() => {
        initializeGameInstance();
    }, 200);
}

// Global game instance variable
let gameInstance = null;

function initializeGameInstance() {
    if (!gameInstance) {
        // Initialize the game now that assets are loaded
        gameInstance = new SnakeGame();
        
        // Initialize audio manager after assets are loaded
        gameInstance.audioManager = new AudioManager();
        
        // The AudioManager now handles its own autoplay setup
        // No additional initialization needed here
    }
}
