class SnakeGame {
    constructor() {
        // Canvas setup
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Game settings
        this.gridSize = 20;
        this.tileCount = this.canvas.width / this.gridSize;
        
        // Game state
        this.gameRunning = false;
        this.gameStarted = false;
        this.score = 0;
        this.highScore = this.getHighScore();
        
        // Snake properties
        this.snake = [
            { x: 10, y: 10 }
        ];
        this.direction = { x: 0, y: 0 };
        this.lastDirection = { x: 0, y: 0 };
        
        // Food properties - Fixed positions for two apples
        this.fixedApplePositions = [
            { x: 5, y: 5 },   // Top-left area
            { x: 15, y: 15 }  // Bottom-right area
        ];
        this.apples = [
            { x: 5, y: 5, active: true, snakePassedThrough: false },
            { x: 15, y: 15, active: true, snakePassedThrough: false }
        ];
        
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
        
        // Reset game state
        this.snake = [{ x: 10, y: 10 }];
        this.direction = { x: 0, y: 0 };
        this.lastDirection = { x: 0, y: 0 };
        this.score = 0;
        this.apples = [
            { x: 5, y: 5, active: true, snakePassedThrough: false },
            { x: 15, y: 15, active: true, snakePassedThrough: false }
        ];
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
        
        // Reset game state
        this.snake = [{ x: 10, y: 10 }];
        this.direction = { x: 0, y: 0 };
        this.lastDirection = { x: 0, y: 0 };
        this.score = 0;
        this.apples = [
            { x: 5, y: 5, active: true, snakePassedThrough: false },
            { x: 15, y: 15, active: true, snakePassedThrough: false }
        ];
        this.updateScoreDisplay();
    }
    
    restartGame() {
        this.startGame();
    }
    
    generateFood() {
        let foodPosition;
        
        // Keep generating until we find a position not occupied by snake
        do {
            foodPosition = {
                x: Math.floor(Math.random() * this.tileCount),
                y: Math.floor(Math.random() * this.tileCount)
            };
        } while (this.snake.some(segment => 
            segment.x === foodPosition.x && segment.y === foodPosition.y
        ));
        
        return foodPosition;
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
        if (head.x < 0 || head.x >= this.tileCount || 
            head.y < 0 || head.y >= this.tileCount) {
            this.gameOver();
            return;
        }
        
        // Check self collision
        if (this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            this.gameOver();
            return;
        }
        
        this.snake.unshift(head);
        
        // Check apple collisions
        let appleEaten = false;
        for (let i = 0; i < this.apples.length; i++) {
            const apple = this.apples[i];
            if (apple.active && head.x === apple.x && head.y === apple.y) {
                this.score += 10;
                this.updateScoreDisplay();
                apple.active = false;
                apple.snakePassedThrough = false;
                appleEaten = true;
                
                // Update high score if needed
                if (this.score > this.highScore) {
                    this.highScore = this.score;
                    this.saveHighScore();
                }
                break;
            }
        }
        
        // Check if snake has passed through apple positions to enable respawning
        this.apples.forEach(apple => {
            if (!apple.active && !apple.snakePassedThrough) {
                // Check if any part of the snake is still on the apple position
                const snakeOnApple = this.snake.some(segment => 
                    segment.x === apple.x && segment.y === apple.y
                );
                
                if (!snakeOnApple) {
                    apple.snakePassedThrough = true;
                    apple.active = true; // Respawn the apple
                }
            }
        });
        
        if (!appleEaten) {
            // Remove tail if no apple eaten
            this.snake.pop();
        }
        
        // Update last direction for reverse prevention
        if (this.direction.x !== 0 || this.direction.y !== 0) {
            this.lastDirection = { ...this.direction };
        }
    }
    
    gameOver() {
        this.gameRunning = false;
        this.finalScoreElement.textContent = this.score;
        this.bestScoreElement.textContent = this.highScore;
        this.gameOverScreen.classList.remove('hidden');
    }
    
    render() {
        // Clear canvas
        this.ctx.fillStyle = '#2d3748';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid (optional)
        this.drawGrid();
        
        // Draw active apples
        this.apples.forEach(apple => {
            if (apple.active) {
                this.drawApple(apple.x * this.gridSize, apple.y * this.gridSize);
            }
        });
        
        // Draw snake
        this.snake.forEach((segment, index) => {
            if (index === 0) {
                // Head with eyes
                this.drawSnakeHead(segment.x * this.gridSize, segment.y * this.gridSize);
            } else {
                // Body segments
                this.drawSnakeBody(segment.x * this.gridSize, segment.y * this.gridSize);
            }
        });
        
        // Draw start message if game hasn't started
        if (!this.gameStarted) {
            this.drawStartMessage();
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
        const eyeSize = 3;
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
    
    drawGrid() {
        this.ctx.strokeStyle = '#4a5568';
        this.ctx.lineWidth = 0.5;
        
        for (let i = 0; i <= this.tileCount; i++) {
            // Vertical lines
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.gridSize, 0);
            this.ctx.lineTo(i * this.gridSize, this.canvas.height);
            this.ctx.stroke();
            
            // Horizontal lines
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.gridSize);
            this.ctx.lineTo(this.canvas.width, i * this.gridSize);
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
        this.updateGame();
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
        
        // Create initial apples
        this.createApples();
        
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
        
        // Check for apple collisions
        this.checkAppleCollisions(adjustedHeadPos);
        
        // Continue animation
        requestAnimationFrame(() => this.animateStartScreenSnake());
    }
    
    createApples() {
        // Place apples at strategic points along the path
        const applePositions = [
            { pathIndex: Math.floor(this.path.length * 0.2) },
            { pathIndex: Math.floor(this.path.length * 0.4) },
            { pathIndex: Math.floor(this.path.length * 0.6) },
            { pathIndex: Math.floor(this.path.length * 0.8) }
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
                    id: index
                });
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
