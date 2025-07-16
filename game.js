class SnakeGame {
    constructor() {
        // Canvas setup
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Game settings
        this.gridSize = 20;
        this.tileCountX = 40; // 40 blocks width
        this.tileCountY = 24; // 24 blocks height
        
        // Game state
        this.gameRunning = false;
        this.gameStarted = false;
        this.score = 0;
        this.highScore = this.getHighScore();
        this.hitAnimation = false;
        this.hitAnimationTimer = 0;
        this.knockbackOffset = { x: 0, y: 0 };
        this.isDead = false;
        
        // Snake properties - Start with 3 blocks
        this.snake = [
            { x: 10, y: 10 },
            { x: 9, y: 10 },
            { x: 8, y: 10 }
        ];
        this.direction = { x: 0, y: 0 };
        this.lastDirection = { x: 0, y: 0 };
        
        // Enhanced snake animation properties
        this.snakeSegments = [];
        this.tongueOut = false;
        this.tongueTimer = 0;
        this.mouthOpen = false;
        this.lastTongueTime = 0;
        this.nextTongueTime = 5000 + Math.random() * 4000; // Random interval 5-9 seconds
        this.tongueWiggleTimer = 0;
        
        // Food properties - Normal random generation for gameplay
        this.food = this.generateFood();
        
        // Obstacle properties
        this.obstacles = [];
        this.obstacleImages = {};
        
        // Background image
        this.grassBg = new Image();
        this.grassBg.src = 'assets/grass-bg.webp';
        
        // DOM elements
        this.startScreen = document.getElementById('startScreen');
        this.gameScreen = document.getElementById('gameScreen');
        this.startGameBtn = document.getElementById('startGameBtn');
        this.startScreenHighScore = document.getElementById('startScreenHighScore');
        this.scoreElement = document.getElementById('score');
        this.highScoreElement = document.getElementById('highScore');
        this.gameOverScreen = document.getElementById('gameOverScreen');
        this.finalScoreElement = document.getElementById('finalScore');
        this.bestScoreElement = document.getElementById('bestScore');
        this.restartBtn = document.getElementById('restartBtn');
        this.backToMenuBtn = document.getElementById('backToMenuBtn');
        
        // Initialize game
        this.init();
        
        // Load obstacle images
        this.loadObstacleImages();
        
        // Initialize snake animation for start screen
        this.initStartScreenSnake();
    }
    
    init() {
        // Show start screen initially
        this.showStartScreen();
        
        // Update score displays
        this.updateScoreDisplay();
        this.startScreenHighScore.textContent = this.highScore;
        
        // Event listeners
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        this.startGameBtn.addEventListener('click', () => this.showGameScreen());
        this.restartBtn.addEventListener('click', () => this.restartGame());
        this.backToMenuBtn.addEventListener('click', () => this.showStartScreen());
        
        // Start game loop
        this.gameLoop();
    }
    
    loadObstacleImages() {
        const imageNames = ['1-block-rock', '2-blocks-rock', '4-blocks-rock', '1-block-obstacle'];
        
        imageNames.forEach(name => {
            const img = new Image();
            img.src = `assets/${name}.png`;
            this.obstacleImages[name] = img;
        });
    }
    
    generateObstacles() {
        this.obstacles = [];
        
        // Define obstacle counts and types
        const obstacleConfig = [
            { type: '4-blocks-rock', width: 2, height: 2, count: 3 },
            { type: '2-blocks-rock', width: 2, height: 1, count: 4 + Math.floor(Math.random() * 2) }, // 4-5
            { type: '1-block-rock', width: 1, height: 1, count: Math.floor(Math.random() * 4) + 2 }, // 2-5
            { type: '1-block-obstacle', width: 1, height: 1, count: Math.floor(Math.random() * 4) + 2 } // 2-5
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
        document.body.style.overflow = 'hidden';
        
        // Update high score display on start screen
        this.startScreenHighScore.textContent = this.highScore;
    }
    
    showGameScreen() {
        this.startScreen.classList.add('hidden');
        this.gameScreen.classList.remove('hidden');
        document.body.style.overflow = 'auto';
        
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
    }
    
    handleKeyPress(e) {
        // Prevent default behavior for game keys
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyA', 'KeyS', 'KeyD', 'Space', 'Escape'].includes(e.code)) {
            e.preventDefault();
        }
        
        // ESC to return to menu
        if (e.code === 'Escape') {
            this.showStartScreen();
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
            this.gameOver();
            return;
        }
        
        // Check self collision
        if (this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            this.gameOver();
            return;
        }
        
        // Check obstacle collision
        if (this.checkObstacleCollision(head)) {
            this.gameOver();
            return;
        }
        
        this.snake.unshift(head);
        
        // Check if snake is near food (within 1 block)
        const distanceToFood = Math.abs(head.x - this.food.x) + Math.abs(head.y - this.food.y);
        this.mouthOpen = distanceToFood <= 1;
        
        // Remove debug logging
        // if (this.mouthOpen) {
        //     console.log('Mouth is open! Distance to food:', distanceToFood, 'Head:', head, 'Food:', this.food);
        // }
        
        // Random tongue animation (only when not eating)
        // Random interval between 10-15 seconds (10000-15000ms)
        if (!this.mouthOpen && Date.now() - this.lastTongueTime > this.nextTongueTime) {
            this.tongueOut = true;
            this.tongueTimer = 200; // Show tongue for 200ms
            this.lastTongueTime = Date.now();
            this.nextTongueTime = 10000 + Math.random() * 5000; // Set next random interval
        }
        
        if (this.tongueOut) {
            this.tongueTimer -= 16; // Assuming 60fps
            if (this.tongueTimer <= 0) {
                this.tongueOut = false;
                this.tongueWiggleTimer = 0; // Reset wiggle timer when tongue retracts
            }
        }
        
        // Check food collision
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.updateScoreDisplay();
            this.food = this.generateFood();
            
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
    
    isFacingFood(head, food) {
        // Check if the snake is moving towards the food
        const dx = food.x - head.x;
        const dy = food.y - head.y;
        
        // If food is directly adjacent, consider it as facing
        if (Math.abs(dx) <= 1 && Math.abs(dy) <= 1) {
            return true;
        }
        
        // Check if current direction aligns with food direction
        if (this.direction.x !== 0) {
            return (this.direction.x > 0 && dx > 0) || (this.direction.x < 0 && dx < 0);
        }
        if (this.direction.y !== 0) {
            return (this.direction.y > 0 && dy > 0) || (this.direction.y < 0 && dy < 0);
        }
        
        return false;
    }
    
    gameOver() {
        this.gameRunning = false;
        
        // Mark snake as dead (for X X eyes)
        this.isDead = true;
        
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
        setTimeout(() => {
            this.hitAnimation = false;
            this.knockbackOffset = { x: 0, y: 0 };
            this.finalScoreElement.textContent = this.score;
            this.bestScoreElement.textContent = this.highScore;
            this.gameOverScreen.classList.remove('hidden');
        }, 1000);
    }
    
    render() {
        // Clear canvas with jungle background
        this.drawJungleBackground();
        
        // Apply hit animation effects
        if (this.hitAnimation) {
            this.ctx.save();
            
            // Update hit animation timer
            this.hitAnimationTimer += 16; // Assuming 60fps
            
            // Create shake effect
            const shakeIntensity = Math.max(0, 1 - this.hitAnimationTimer / 1000);
            const shakeX = (Math.random() - 0.5) * 10 * shakeIntensity;
            const shakeY = (Math.random() - 0.5) * 10 * shakeIntensity;
            
            // Apply knockback and shake
            this.ctx.translate(
                this.knockbackOffset.x * shakeIntensity + shakeX,
                this.knockbackOffset.y * shakeIntensity + shakeY
            );
            
            // Flash effect
            const flashIntensity = Math.sin(this.hitAnimationTimer * 0.02) * 0.5 + 0.5;
            this.ctx.globalAlpha = 0.7 + flashIntensity * 0.3;
            
            // Red tint overlay
            this.ctx.fillStyle = `rgba(255, 0, 0, ${0.3 * shakeIntensity})`;
            this.ctx.fillRect(-20, -20, this.canvas.width + 40, this.canvas.height + 40);
        }
        
        // Draw obstacles
        this.drawObstacles();
        
        // Draw food
        this.drawApple(this.food.x * this.gridSize, this.food.y * this.gridSize);
        
        // Draw continuous snake
        this.drawContinuousSnake();
        
        // Draw start message if game hasn't started
        if (!this.gameStarted) {
            this.drawStartMessage();
        }
        
        // Restore canvas state if hit animation was applied
        if (this.hitAnimation) {
            this.ctx.restore();
        }
    }
    
    drawObstacles() {
        if (!this.obstacles || !Array.isArray(this.obstacles)) {
            return;
        }
        
        for (let obstacle of this.obstacles) {
            const img = this.obstacleImages[obstacle.type];
            if (img && img.complete) {
                this.ctx.drawImage(
                    img,
                    obstacle.x * this.gridSize,
                    obstacle.y * this.gridSize,
                    obstacle.width * this.gridSize,
                    obstacle.height * this.gridSize
                );
            }
        }
    }
    
    drawSnakeHead(x, y) {
        const centerX = x + this.gridSize / 2;
        const centerY = y + this.gridSize / 2;
        const radius = this.gridSize / 2 - 1;
        
        // Main head body (blue gradient)
        const gradient = this.ctx.createRadialGradient(
            centerX - radius/3, centerY - radius/3, 0,
            centerX, centerY, radius
        );
        gradient.addColorStop(0, '#5DADE2');
        gradient.addColorStop(1, '#2E86C1');
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Shadow
        this.ctx.shadowColor = 'rgba(46, 134, 193, 0.5)';
        this.ctx.shadowBlur = 8;
        this.ctx.shadowOffsetX = 2;
        this.ctx.shadowOffsetY = 2;
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;
        
        // Eyes
        const eyeSize = 5;
        const eyeOffset = radius / 3;
        
        // Left eye
        this.ctx.fillStyle = 'white';
        this.ctx.beginPath();
        this.ctx.arc(centerX - eyeOffset, centerY - eyeOffset/2, eyeSize, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Right eye
        this.ctx.beginPath();
        this.ctx.arc(centerX + eyeOffset, centerY - eyeOffset/2, eyeSize, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Eye pupils
        this.ctx.fillStyle = 'black';
        this.ctx.beginPath();
        this.ctx.arc(centerX - eyeOffset, centerY - eyeOffset/2, eyeSize/2, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.beginPath();
        this.ctx.arc(centerX + eyeOffset, centerY - eyeOffset/2, eyeSize/2, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Eye shine
        this.ctx.fillStyle = 'white';
        this.ctx.beginPath();
        this.ctx.arc(centerX - eyeOffset + 1, centerY - eyeOffset/2 - 1, 1, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.beginPath();
        this.ctx.arc(centerX + eyeOffset + 1, centerY - eyeOffset/2 - 1, 1, 0, Math.PI * 2);
        this.ctx.fill();
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
    
    drawApple(x, y) {
        const centerX = x + this.gridSize / 2;
        const centerY = y + this.gridSize / 2;
        const radius = this.gridSize / 2 - 2;
        
        // Apple body (red gradient)
        const appleGradient = this.ctx.createRadialGradient(
            centerX - radius/3, centerY - radius/3, 0,
            centerX, centerY, radius
        );
        appleGradient.addColorStop(0, '#FF6B6B');
        appleGradient.addColorStop(1, '#E74C3C');
        
        this.ctx.fillStyle = appleGradient;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY + 1, radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Apple shadow
        this.ctx.shadowColor = 'rgba(231, 76, 60, 0.5)';
        this.ctx.shadowBlur = 8;
        this.ctx.shadowOffsetX = 2;
        this.ctx.shadowOffsetY = 2;
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;
        
        // Apple stem (brown)
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(centerX - 1, centerY - radius - 2, 2, 4);
        
        // Leaf (green)
        this.ctx.fillStyle = '#27AE60';
        this.ctx.beginPath();
        this.ctx.ellipse(centerX + 3, centerY - radius, 3, 2, Math.PI / 4, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Apple highlight
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        this.ctx.beginPath();
        this.ctx.arc(centerX - radius/3, centerY - radius/3, radius/3, 0, Math.PI * 2);
        this.ctx.fill();
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
    
    drawContinuousSnake() {
        if (this.snake.length === 0) return;
        
        // Draw continuous snake body first
        this.drawSnakeBody();
        
        // Then draw the head with eyes on top
        this.drawSnakeHead();
    }
    
    drawSnakeBody() {
        if (this.snake.length === 0) return;
        
        const bodyWidth = this.gridSize * 0.8;
        const bodyHeight = this.gridSize * 0.6;
        
        // Create path for snake body
        this.ctx.beginPath();
        
        for (let i = 0; i < this.snake.length; i++) {
            const segment = this.snake[i];
            const x = segment.x * this.gridSize + this.gridSize / 2;
            const y = segment.y * this.gridSize + this.gridSize / 2;
            
            if (i === 0) {
                // Start at head
                this.ctx.moveTo(x, y);
            } else {
                // Line to each segment
                this.ctx.lineTo(x, y);
            }
        }
        
        // Style the snake body
        this.ctx.strokeStyle = '#4169E1';
        this.ctx.lineWidth = bodyWidth;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.stroke();
        
        // Add inner body highlight
        this.ctx.beginPath();
        for (let i = 0; i < this.snake.length; i++) {
            const segment = this.snake[i];
            const x = segment.x * this.gridSize + this.gridSize / 2;
            const y = segment.y * this.gridSize + this.gridSize / 2;
            
            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }
        
        this.ctx.strokeStyle = '#6495ED';
        this.ctx.lineWidth = bodyWidth * 0.7;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.stroke();
    }
    
    drawSnakeHead() {
        if (this.snake.length === 0) return;
        
        const head = this.snake[0];
        const centerX = head.x * this.gridSize + this.gridSize / 2;
        const centerY = head.y * this.gridSize + this.gridSize / 2;
        const radius = this.gridSize * 0.4;
        
        // Head circle (same as body color)
        this.ctx.fillStyle = '#4169E1';
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Head highlight
        this.ctx.fillStyle = '#6495ED';
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius * 0.7, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Eyes
        const eyeSize = 4;
        const eyeOffset = radius * 0.6;
        
        // Left eye (white background)
        this.ctx.fillStyle = 'white';
        this.ctx.beginPath();
        this.ctx.arc(centerX - eyeOffset, centerY - eyeOffset/2, eyeSize, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Right eye (white background)
        this.ctx.beginPath();
        this.ctx.arc(centerX + eyeOffset, centerY - eyeOffset/2, eyeSize, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Eye pupils - show X X when dead, normal pupils when alive
        if (this.isDead) {
            // Draw X X pupils for dead snake
            this.ctx.strokeStyle = 'black';
            this.ctx.lineWidth = 2;
            
            // Left eye X
            this.ctx.beginPath();
            this.ctx.moveTo(centerX - eyeOffset - 2, centerY - eyeOffset/2 - 2);
            this.ctx.lineTo(centerX - eyeOffset + 2, centerY - eyeOffset/2 + 2);
            this.ctx.moveTo(centerX - eyeOffset + 2, centerY - eyeOffset/2 - 2);
            this.ctx.lineTo(centerX - eyeOffset - 2, centerY - eyeOffset/2 + 2);
            this.ctx.stroke();
            
            // Right eye X
            this.ctx.beginPath();
            this.ctx.moveTo(centerX + eyeOffset - 2, centerY - eyeOffset/2 - 2);
            this.ctx.lineTo(centerX + eyeOffset + 2, centerY - eyeOffset/2 + 2);
            this.ctx.moveTo(centerX + eyeOffset + 2, centerY - eyeOffset/2 - 2);
            this.ctx.lineTo(centerX + eyeOffset - 2, centerY - eyeOffset/2 + 2);
            this.ctx.stroke();
        } else {
            // Normal pupils
            this.ctx.fillStyle = 'black';
            this.ctx.beginPath();
            this.ctx.arc(centerX - eyeOffset, centerY - eyeOffset/2, eyeSize/2, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.beginPath();
            this.ctx.arc(centerX + eyeOffset, centerY - eyeOffset/2, eyeSize/2, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Eye shine
            this.ctx.fillStyle = 'white';
            this.ctx.beginPath();
            this.ctx.arc(centerX - eyeOffset + 1, centerY - eyeOffset/2 - 1, 1, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.beginPath();
            this.ctx.arc(centerX + eyeOffset + 1, centerY - eyeOffset/2 - 1, 1, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // Mouth (open if near food)
        if (this.mouthOpen) {
            // Create a more visible open mouth
            this.ctx.fillStyle = '#8B0000';
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY + radius/2, 6, 0, Math.PI, false);
            this.ctx.fill();
            
            // Add mouth interior shadow
            this.ctx.fillStyle = '#4B0000';
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY + radius/2, 4, 0, Math.PI, false);
            this.ctx.fill();
            
            // Add teeth/fangs
            this.ctx.fillStyle = 'white';
            this.ctx.beginPath();
            this.ctx.moveTo(centerX - 4, centerY + radius/2);
            this.ctx.lineTo(centerX - 3, centerY + radius/2 + 3);
            this.ctx.lineTo(centerX - 2, centerY + radius/2);
            this.ctx.fill();
            
            this.ctx.beginPath();
            this.ctx.moveTo(centerX + 4, centerY + radius/2);
            this.ctx.lineTo(centerX + 3, centerY + radius/2 + 3);
            this.ctx.lineTo(centerX + 2, centerY + radius/2);
            this.ctx.fill();
        } else {
            // Closed mouth - just a small line
            this.ctx.strokeStyle = '#000';
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.moveTo(centerX - 3, centerY + radius/2);
            this.ctx.lineTo(centerX + 3, centerY + radius/2);
            this.ctx.stroke();
        }
        
        // Tongue (if extended and mouth is closed)
        if (this.tongueOut && !this.mouthOpen) {
            // Update wiggle animation
            this.tongueWiggleTimer += 16; // Assuming 60fps
            
            // Create wiggle effect - subtle side-to-side movement
            const wiggleFrequency = 0.008; // Speed of wiggle
            const wiggleAmplitude = 1.5; // How far it wiggles
            const wiggleOffset = Math.sin(this.tongueWiggleTimer * wiggleFrequency) * wiggleAmplitude;
            
            // Create slight vertical bobbing
            const bobFrequency = 0.006;
            const bobAmplitude = 0.5;
            const bobOffset = Math.sin(this.tongueWiggleTimer * bobFrequency) * bobAmplitude;
            
            this.ctx.strokeStyle = '#FF0000';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            
            // Main tongue body with wiggle
            this.ctx.moveTo(centerX, centerY + radius/2);
            this.ctx.lineTo(centerX + wiggleOffset, centerY + radius/2 + 8 + bobOffset);
            
            // Forked tongue tip with wiggle
            this.ctx.moveTo(centerX + wiggleOffset, centerY + radius/2 + 8 + bobOffset);
            this.ctx.lineTo(centerX - 2 + wiggleOffset, centerY + radius/2 + 10 + bobOffset);
            this.ctx.moveTo(centerX + wiggleOffset, centerY + radius/2 + 8 + bobOffset);
            this.ctx.lineTo(centerX + 2 + wiggleOffset, centerY + radius/2 + 10 + bobOffset);
            
            this.ctx.stroke();
        }
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
    
    gameLoop() {
        // Update game logic only if not in hit animation
        if (!this.hitAnimation) {
            this.updateGame();
        }
        
        // Always render (for hit animation effects)
        this.render();
        
        // Continue game loop
        setTimeout(() => {
            requestAnimationFrame(() => this.gameLoop());
        }, 120); // Game speed - lower number = faster game
    }
    
    initStartScreenSnake() {
        // Get SVG elements
        this.snakeBody = document.getElementById('snakeBody');
        this.snakeHead = document.getElementById('snakeHead');
        this.leftEye = document.getElementById('leftEye');
        this.rightEye = document.getElementById('rightEye');
        this.leftPupil = document.getElementById('leftPupil');
        this.rightPupil = document.getElementById('rightPupil');
        this.leftInnerPupil = document.getElementById('leftInnerPupil');
        this.rightInnerPupil = document.getElementById('rightInnerPupil');
        this.headSpot1 = document.getElementById('headSpot1');
        this.headSpot2 = document.getElementById('headSpot2');
        this.bodySpots = document.getElementById('bodySpots');
        this.snakeTongue = document.getElementById('snakeTongue');
        
        this.snakeAnimationFrame = 0;
        this.bodyLength = 120; // Number of points to track for body
        this.bodyPoints = [];
        this.pointSpacing = 2; // Distance between body tracking points
        this.apples = []; // Store apple data
        this.applesContainer = document.getElementById('applesContainer');
        
        // Button dimensions and position relative to container
        this.buttonWidth = 200;
        this.buttonHeight = 60;
        this.containerWidth = 350;
        this.containerHeight = 200;
        
        // Calculate button position (centered in container)
        this.buttonLeft = (this.containerWidth - this.buttonWidth) / 2;
        this.buttonTop = (this.containerHeight - this.buttonHeight) / 2;
        
        // Create rectangular path around button with padding
        this.pathPadding = 35;
        this.createRectangularPath();
        
        // Initialize body points - pre-fill with positions along the path
        for (let i = 0; i < this.bodyLength; i++) {
            const pathIndex = (this.path.length - (i * this.pointSpacing)) % this.path.length;
            const adjustedIndex = pathIndex < 0 ? this.path.length + pathIndex : pathIndex;
            this.bodyPoints.push({ 
                x: this.path[Math.floor(adjustedIndex)].x, 
                y: this.path[Math.floor(adjustedIndex)].y 
            });
        }
        
        // Create fixed apples for start screen animation
        this.createFixedApples();
        
        // Start animation
        this.animateStartScreenSnake();
    }
    
    createRectangularPath() {
        this.path = [];
        const left = this.buttonLeft - this.pathPadding;
        const right = this.buttonLeft + this.buttonWidth + this.pathPadding;
        const top = this.buttonTop - this.pathPadding;
        const bottom = this.buttonTop + this.buttonHeight + this.pathPadding;
        const cornerRadius = 25;
        
        // Top side (left to right)
        for (let x = left + cornerRadius; x <= right - cornerRadius; x += 1) {
            this.path.push({ x, y: top });
        }
        
        // Top-right corner
        for (let angle = -90; angle <= 0; angle += 1.5) {
            const rad = (angle * Math.PI) / 180;
            const x = right - cornerRadius + Math.cos(rad) * cornerRadius;
            const y = top + cornerRadius + Math.sin(rad) * cornerRadius;
            this.path.push({ x, y });
        }
        
        // Right side (top to bottom)
        for (let y = top + cornerRadius; y <= bottom - cornerRadius; y += 1) {
            this.path.push({ x: right, y });
        }
        
        // Bottom-right corner
        for (let angle = 0; angle <= 90; angle += 1.5) {
            const rad = (angle * Math.PI) / 180;
            const x = right - cornerRadius + Math.cos(rad) * cornerRadius;
            const y = bottom - cornerRadius + Math.sin(rad) * cornerRadius;
            this.path.push({ x, y });
        }
        
        // Bottom side (right to left)
        for (let x = right - cornerRadius; x >= left + cornerRadius; x -= 1) {
            this.path.push({ x, y: bottom });
        }
        
        // Bottom-left corner
        for (let angle = 90; angle <= 180; angle += 1.5) {
            const rad = (angle * Math.PI) / 180;
            const x = left + cornerRadius + Math.cos(rad) * cornerRadius;
            const y = bottom - cornerRadius + Math.sin(rad) * cornerRadius;
            this.path.push({ x, y });
        }
        
        // Left side (bottom to top)
        for (let y = bottom - cornerRadius; y >= top + cornerRadius; y -= 1) {
            this.path.push({ x: left, y });
        }
        
        // Top-left corner
        for (let angle = 180; angle <= 270; angle += 1.5) {
            const rad = (angle * Math.PI) / 180;
            const x = left + cornerRadius + Math.cos(rad) * cornerRadius;
            const y = top + cornerRadius + Math.sin(rad) * cornerRadius;
            this.path.push({ x, y });
        }
    }
    
    animateStartScreenSnake() {
        if (!this.path || this.path.length === 0) return;
        
        // Get current head position with smooth interpolation
        const rawIndex = this.snakeAnimationFrame % this.path.length;
        const headIndex = Math.floor(rawIndex);
        const nextHeadIndex = (headIndex + 1) % this.path.length;
        const t = rawIndex - headIndex; // interpolation factor
        
        const headPos = this.path[headIndex];
        const nextHeadPos = this.path[nextHeadIndex];
        
        // Smooth interpolation between path points
        const interpolatedHead = {
            x: headPos.x + (nextHeadPos.x - headPos.x) * t,
            y: headPos.y + (nextHeadPos.y - headPos.y) * t
        };
        
        // Add long, smooth wave undulation to head
        const primaryWave = Math.sin(this.snakeAnimationFrame * 0.08) * 2.2;
        const secondaryWave = Math.cos(this.snakeAnimationFrame * 0.05) * 1.1;
        const irregularOffset = primaryWave + secondaryWave;
        
        const adjustedHeadPos = {
            x: interpolatedHead.x,
            y: interpolatedHead.y + irregularOffset
        };
        
        // Update body points with consistent spacing
        if (this.bodyPoints.length === 0) {
            this.bodyPoints.push({ x: adjustedHeadPos.x, y: adjustedHeadPos.y });
        } else {
            const lastPoint = this.bodyPoints[0];
            const distance = Math.sqrt(
                Math.pow(adjustedHeadPos.x - lastPoint.x, 2) + 
                Math.pow(adjustedHeadPos.y - lastPoint.y, 2)
            );
            
            // Only add new point if moved enough distance
            if (distance >= this.pointSpacing) {
                this.bodyPoints.unshift({ x: adjustedHeadPos.x, y: adjustedHeadPos.y });
                if (this.bodyPoints.length > this.bodyLength) {
                    this.bodyPoints.pop();
                }
            }
        }
        
        // Create smooth continuous body path ensuring visibility on straight segments
        if (this.bodyPoints.length > 1) {
            let pathData = `M ${this.bodyPoints[0].x} ${this.bodyPoints[0].y}`;
            
            // For straight segments, use simple lines; for curves, use smooth curves
            for (let i = 1; i < this.bodyPoints.length; i++) {
                const current = this.bodyPoints[i];
                
                if (i < this.bodyPoints.length - 1) {
                    // Check if this is a straight segment or curve
                    const prev = this.bodyPoints[i - 1];
                    const next = this.bodyPoints[i + 1];
                    
                    // Calculate if points are roughly collinear (straight line)
                    const dx1 = current.x - prev.x;
                    const dy1 = current.y - prev.y;
                    const dx2 = next.x - current.x;
                    const dy2 = next.y - current.y;
                    
                    // Cross product to check collinearity
                    const crossProduct = Math.abs(dx1 * dy2 - dy1 * dx2);
                    
                    if (crossProduct < 5) { // Straight line threshold
                        pathData += ` L ${current.x} ${current.y}`;
                    } else {
                        // Use quadratic curve for smooth turns
                        const nextPoint = this.bodyPoints[i + 1];
                        const controlX = current.x;
                        const controlY = current.y;
                        pathData += ` Q ${controlX} ${controlY} ${(current.x + nextPoint.x) / 2} ${(current.y + nextPoint.y) / 2}`;
                        i++; // Skip next point as it's used in the curve
                    }
                } else {
                    pathData += ` L ${current.x} ${current.y}`;
                }
            }
            
            this.snakeBody.setAttribute('d', pathData);
        }
        
        // Position and rotate head
        this.snakeHead.setAttribute('cx', adjustedHeadPos.x);
        this.snakeHead.setAttribute('cy', adjustedHeadPos.y);
        
        // Calculate head rotation
        const angle = Math.atan2(nextHeadPos.y - headPos.y, nextHeadPos.x - headPos.x);
        const headRotation = `rotate(${angle * 180 / Math.PI} ${adjustedHeadPos.x} ${adjustedHeadPos.y})`;
        this.snakeHead.setAttribute('transform', headRotation);
        
        // Position eyes relative to head
        const eyeOffsetX = Math.cos(angle) * 3;
        const eyeOffsetY = Math.sin(angle) * 3;
        const eyeSeparation = 4;
        
        // Eye positions (perpendicular to movement direction)
        const perpX = -Math.sin(angle) * eyeSeparation;
        const perpY = Math.cos(angle) * eyeSeparation;
        
        this.leftEye.setAttribute('cx', adjustedHeadPos.x + eyeOffsetX + perpX);
        this.leftEye.setAttribute('cy', adjustedHeadPos.y + eyeOffsetY + perpY);
        this.rightEye.setAttribute('cx', adjustedHeadPos.x + eyeOffsetX - perpX);
        this.rightEye.setAttribute('cy', adjustedHeadPos.y + eyeOffsetY - perpY);
        
        // Position pupils
        this.leftPupil.setAttribute('cx', adjustedHeadPos.x + eyeOffsetX + perpX);
        this.leftPupil.setAttribute('cy', adjustedHeadPos.y + eyeOffsetY + perpY);
        this.rightPupil.setAttribute('cx', adjustedHeadPos.x + eyeOffsetX - perpX);
        this.rightPupil.setAttribute('cy', adjustedHeadPos.y + eyeOffsetY - perpY);
        
        // Position inner pupils
        this.leftInnerPupil.setAttribute('cx', adjustedHeadPos.x + eyeOffsetX + perpX);
        this.leftInnerPupil.setAttribute('cy', adjustedHeadPos.y + eyeOffsetY + perpY);
        this.rightInnerPupil.setAttribute('cx', adjustedHeadPos.x + eyeOffsetX - perpX);
        this.rightInnerPupil.setAttribute('cy', adjustedHeadPos.y + eyeOffsetY - perpY);
        
        // Position head spots
        this.headSpot1.setAttribute('cx', adjustedHeadPos.x + Math.cos(angle + 0.8) * 8);
        this.headSpot1.setAttribute('cy', adjustedHeadPos.y + Math.sin(angle + 0.8) * 8);
        this.headSpot2.setAttribute('cx', adjustedHeadPos.x + Math.cos(angle - 0.8) * 6);
        this.headSpot2.setAttribute('cy', adjustedHeadPos.y + Math.sin(angle - 0.8) * 6);
        
        // Update body spots
        if (this.bodySpots) {
            this.updateBodySpots();
        }
        
        // Animate tongue (flicks occasionally with jiggle)
        if (Math.floor(this.snakeAnimationFrame / 40) % 3 === 0) {
            const tongueLength = 8;
            
            // Add long, smooth tongue motion
            const jiggleX = Math.sin(this.snakeAnimationFrame * 0.3) * 1.8;
            const jiggleY = Math.cos(this.snakeAnimationFrame * 0.25) * 1.2;
            
            const tongueX = adjustedHeadPos.x + Math.cos(angle) * (12 + tongueLength) + jiggleX;
            const tongueY = adjustedHeadPos.y + Math.sin(angle) * (12 + tongueLength) + jiggleY;
            const forkOffset = 2;
            
            // Add smooth motion to fork ends
            const forkJiggle1 = Math.sin(this.snakeAnimationFrame * 0.4) * 1.0;
            const forkJiggle2 = Math.cos(this.snakeAnimationFrame * 0.35) * 1.1;
            
            const tongueData = `M ${adjustedHeadPos.x + Math.cos(angle) * 12} ${adjustedHeadPos.y + Math.sin(angle) * 12} 
                              L ${tongueX} ${tongueY}
                              M ${tongueX} ${tongueY}
                              L ${tongueX + Math.cos(angle + 0.3) * forkOffset + forkJiggle1} ${tongueY + Math.sin(angle + 0.3) * forkOffset + forkJiggle1}
                              M ${tongueX} ${tongueY}
                              L ${tongueX + Math.cos(angle - 0.3) * forkOffset + forkJiggle2} ${tongueY + Math.sin(angle - 0.3) * forkOffset + forkJiggle2}`;
            this.snakeTongue.setAttribute('d', tongueData);
            this.snakeTongue.style.opacity = '1';
        } else {
            this.snakeTongue.style.opacity = '0';
        }
        
        this.snakeAnimationFrame += 1.2; // Animation speed - increased for faster movement
        
        // Check for apple collisions and update visibility
        this.updateAppleVisibility();
        
        // Continue animation
        requestAnimationFrame(() => this.animateStartScreenSnake());
    }
    
    updateBodySpots() {
        // Clear existing spots
        this.bodySpots.innerHTML = '';
        
        // Add orange spots along the snake body
        for (let i = 5; i < this.bodyPoints.length; i += 8) {
            if (i < this.bodyPoints.length) {
                const spot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                spot.setAttribute('cx', this.bodyPoints[i].x);
                spot.setAttribute('cy', this.bodyPoints[i].y);
                spot.setAttribute('r', Math.random() * 2 + 1.5);
                spot.setAttribute('fill', '#FF9800');
                spot.setAttribute('opacity', '0.8');
                this.bodySpots.appendChild(spot);
            }
        }
    }
    
    createFixedApples() {
        // Create only 2 apples at fixed positions along the path
        const applePositions = [
            { pathIndex: Math.floor(this.path.length * 0.25) }, // First quarter
            { pathIndex: Math.floor(this.path.length * 0.75) }  // Third quarter
        ];
        
        applePositions.forEach((appleData, index) => {
            const position = this.path[appleData.pathIndex];
            if (position) {
                const apple = this.createAppleElement(position.x, position.y, index);
                this.apples.push({
                    element: apple,
                    x: position.x,
                    y: position.y,
                    eaten: false,
                    id: index,
                    visible: true
                });
            }
        });
    }
    
    updateAppleVisibility() {
        this.apples.forEach(apple => {
            if (apple.eaten) return;
            
            // Check if any part of the snake is near this apple position
            const snakeNearApple = this.bodyPoints.some(point => {
                const distance = Math.sqrt(
                    Math.pow(point.x - apple.x, 2) + 
                    Math.pow(point.y - apple.y, 2)
                );
                return distance < 20; // Hide apple if snake is within 20 pixels
            });
            
            // Update visibility
            if (snakeNearApple && apple.visible) {
                apple.element.style.opacity = '0';
                apple.visible = false;
            } else if (!snakeNearApple && !apple.visible) {
                apple.element.style.opacity = '1';
                apple.visible = true;
            }
        });
    }
    
    createAppleElement(x, y, id) {
        // Create apple SVG group
        const appleGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        appleGroup.setAttribute('id', `apple-${id}`);
        appleGroup.setAttribute('transform', `translate(${x}, ${y})`);
        
        // Apple body (red circle)
        const appleBody = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        appleBody.setAttribute('cx', '0');
        appleBody.setAttribute('cy', '0');
        appleBody.setAttribute('r', '8');
        appleBody.setAttribute('fill', 'url(#appleGradient)');
        appleBody.setAttribute('filter', 'url(#appleShadow)');
        
        // Apple stem
        const appleStem = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        appleStem.setAttribute('x', '-1');
        appleStem.setAttribute('y', '-10');
        appleStem.setAttribute('width', '2');
        appleStem.setAttribute('height', '4');
        appleStem.setAttribute('fill', '#8B4513');
        
        // Apple leaf
        const appleLeaf = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
        appleLeaf.setAttribute('cx', '3');
        appleLeaf.setAttribute('cy', '-8');
        appleLeaf.setAttribute('rx', '3');
        appleLeaf.setAttribute('ry', '2');
        appleLeaf.setAttribute('fill', '#228B22');
        appleLeaf.setAttribute('transform', 'rotate(30)');
        
        appleGroup.appendChild(appleBody);
        appleGroup.appendChild(appleStem);
        appleGroup.appendChild(appleLeaf);
        
        // Add gradients and filters if not already present
        this.addAppleDefinitions();
        
        this.applesContainer.appendChild(appleGroup);
        return appleGroup;
    }
    
    addAppleDefinitions() {
        const defs = document.querySelector('defs');
        if (!document.getElementById('appleGradient')) {
            const appleGradient = document.createElementNS('http://www.w3.org/2000/svg', 'radialGradient');
            appleGradient.setAttribute('id', 'appleGradient');
            appleGradient.innerHTML = `
                <stop offset="0%" style="stop-color:#FF6B6B;stop-opacity:1" />
                <stop offset="70%" style="stop-color:#DC143C;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#8B0000;stop-opacity:1" />
            `;
            defs.appendChild(appleGradient);
        }
        
        if (!document.getElementById('appleShadow')) {
            const appleShadow = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
            appleShadow.setAttribute('id', 'appleShadow');
            appleShadow.innerHTML = `<feDropShadow dx="1" dy="1" stdDeviation="2" flood-color="rgba(0,0,0,0.4)"/>`;
            defs.appendChild(appleShadow);
        }
    }
    
    checkAppleCollisions(headPos) {
        this.apples.forEach(apple => {
            if (!apple.eaten) {
                const distance = Math.sqrt(
                    Math.pow(headPos.x - apple.x, 2) + 
                    Math.pow(headPos.y - apple.y, 2)
                );
                
                if (distance < 15) { // Collision threshold
                    this.eatApple(apple);
                }
            }
        });
    }
    
    eatApple(apple) {
        apple.eaten = true;
        
        // Create eating animation
        const appleElement = apple.element;
        appleElement.style.transition = 'all 0.3s ease';
        appleElement.style.transform = `translate(${apple.x}px, ${apple.y}px) scale(0)`;
        appleElement.style.opacity = '0';
        
        // Remove apple after animation
        setTimeout(() => {
            if (appleElement.parentNode) {
                appleElement.parentNode.removeChild(appleElement);
            }
            
            // Respawn apple at a different location after delay
            setTimeout(() => {
                this.respawnApple(apple);
            }, 2000);
        }, 300);
    }
    
    respawnApple(apple) {
        // Choose a new random position along the path
        const newIndex = Math.floor(Math.random() * this.path.length);
        const newPosition = this.path[newIndex];
        
        apple.x = newPosition.x;
        apple.y = newPosition.y;
        apple.eaten = false;
        apple.element = this.createAppleElement(newPosition.x, newPosition.y, apple.id);
    }
}

// Start the game when page loads
window.addEventListener('load', () => {
    new SnakeGame();
});
