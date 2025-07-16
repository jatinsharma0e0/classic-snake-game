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
        
        // Food properties
        this.food = this.generateFood();
        
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
        this.food = this.generateFood();
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
        
        // Draw food (apple)
        this.drawApple(this.food.x * this.gridSize, this.food.y * this.gridSize);
        
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
}

// Start the game when page loads
window.addEventListener('load', () => {
    new SnakeGame();
});
