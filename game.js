// Game Constants
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const PLAYER_WIDTH = 40;
const PLAYER_HEIGHT = 30;
const PLAYER_SPEED = 5;
const ENEMY_WIDTH = 30;
const ENEMY_HEIGHT = 20;
const ENEMY_ROW_COUNT = 5;
const ENEMY_COL_COUNT = 10;
const ENEMY_PADDING = 20;
const ENEMY_TOP_OFFSET = 60;
const ENEMY_LEFT_OFFSET = 50;
const ENEMY_BASE_SPEED = 1;
const ENEMY_DESCEND = 20;
const BULLET_WIDTH = 3;
const BULLET_HEIGHT = 15;
const BULLET_SPEED = 7;
const ENEMY_BULLET_SPEED = 4;
const ENEMY_FIRE_RATE = 0.01; // Probability of enemy firing in each frame
const PLAYER_FIRE_DELAY = 300; // milliseconds between player shots

// Game state variables
let canvas, ctx;
let player, enemies, playerBullets, enemyBullets;
let score, lives;
let gameActive = false;
let lastPlayerShot = 0;
let enemyDirection = 1; // 1 for right, -1 for left
let animationId;
let enemyDeathSound, playerShootSound, playerDeathSound;

// DOM elements
let scoreElement, livesElement, startScreen, gameOverScreen, finalScoreElement;

// Initialize the game
window.onload = function() {
    console.log("Window loaded");
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    
    scoreElement = document.getElementById('score');
    livesElement = document.getElementById('lives');
    startScreen = document.getElementById('startScreen');
    gameOverScreen = document.getElementById('gameOverScreen');
    finalScoreElement = document.getElementById('finalScore');
    
    // Add event listeners with debugging
    const startButton = document.getElementById('startButton');
    console.log("Start button element:", startButton);
    
    if (startButton) {
        startButton.addEventListener('click', function() {
            console.log("Start button clicked!");
            startGame();
        });
    } else {
        console.error("Start button not found in the DOM");
    }
    
    const restartButton = document.getElementById('restartButton');
    console.log("Restart button element:", restartButton);
    
    if (restartButton) {
        restartButton.addEventListener('click', function() {
            console.log("Restart button clicked!");
            startGame();
        });
    } else {
        console.error("Restart button not found in the DOM");
    }
    
    // Setup event listeners
    setupKeyboardControls();
    
    // Initialize game state
    initializeSounds();
    
    // Draw the initial canvas
    drawInitialScreen();
};

function drawInitialScreen() {
    // Draw an initial frame to ensure canvas is working
    if (ctx) {
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.fillStyle = "#33ff33";
        ctx.font = "24px 'Courier New', Courier, monospace";
        ctx.fillText("Space Invaders Ready!", CANVAS_WIDTH/2 - 150, CANVAS_HEIGHT/2);
    } else {
        console.error("Canvas context not initialized");
    }
}

function setupKeyboardControls() {
    console.log("Setting up keyboard controls");
    // Key state tracking
    const keys = {
        ArrowLeft: false,
        ArrowRight: false,
        a: false,
        d: false,
        space: false
    };
    
    window.addEventListener('keydown', (e) => {
        // Debug key presses
        console.log("Key pressed:", e.key);
        
        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.ArrowLeft = true;
        if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.ArrowRight = true;
        if (e.key === ' ') {
            keys.space = true;
            if (gameActive) {
                // Prevent space from scrolling the page
                e.preventDefault();
                fireBullet();
            }
        }
    });
    
    window.addEventListener('keyup', (e) => {
        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.ArrowLeft = false;
        if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.ArrowRight = false;
        if (e.key === ' ') keys.space = false;
    });
    
    // Update player movement in the game loop
    function updatePlayerPosition() {
        if (!gameActive || !player) return;
        
        if (keys.ArrowLeft) {
            player.x = Math.max(0, player.x - PLAYER_SPEED);
        }
        if (keys.ArrowRight) {
            player.x = Math.min(CANVAS_WIDTH - PLAYER_WIDTH, player.x + PLAYER_SPEED);
        }
    }
    
    // Register the update function to be called in the game loop
    window.updatePlayerPosition = updatePlayerPosition;
}

function initializeSounds() {
    try {
        // Simple audio context for sound effects
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const audioCtx = new AudioContext();
        
        // Enemy death sound
        enemyDeathSound = {
            play: function() {
                try {
                    const oscillator = audioCtx.createOscillator();
                    const gainNode = audioCtx.createGain();
                    
                    oscillator.type = 'square';
                    oscillator.frequency.setValueAtTime(150, audioCtx.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(40, audioCtx.currentTime + 0.2);
                    
                    gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
                    
                    oscillator.connect(gainNode);
                    gainNode.connect(audioCtx.destination);
                    
                    oscillator.start();
                    oscillator.stop(audioCtx.currentTime + 0.2);
                } catch (error) {
                    console.error("Error playing enemy death sound:", error);
                }
            }
        };
        
        // Player shoot sound
        playerShootSound = {
            play: function() {
                try {
                    const oscillator = audioCtx.createOscillator();
                    const gainNode = audioCtx.createGain();
                    
                    oscillator.type = 'square';
                    oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.1);
                    
                    gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
                    
                    oscillator.connect(gainNode);
                    gainNode.connect(audioCtx.destination);
                    
                    oscillator.start();
                    oscillator.stop(audioCtx.currentTime + 0.1);
                } catch (error) {
                    console.error("Error playing player shoot sound:", error);
                }
            }
        };
        
        // Player death sound
        playerDeathSound = {
            play: function() {
                try {
                    const oscillator = audioCtx.createOscillator();
                    const gainNode = audioCtx.createGain();
                    
                    oscillator.type = 'sawtooth';
                    oscillator.frequency.setValueAtTime(300, audioCtx.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(30, audioCtx.currentTime + 0.5);
                    
                    gainNode.gain.setValueAtTime(0.4, audioCtx.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
                    
                    oscillator.connect(gainNode);
                    gainNode.connect(audioCtx.destination);
                    
                    oscillator.start();
                    oscillator.stop(audioCtx.currentTime + 0.5);
                } catch (error) {
                    console.error("Error playing player death sound:", error);
                }
            }
        };
    } catch (error) {
        console.error("Error initializing sounds:", error);
        // Fallback sound objects that do nothing
        enemyDeathSound = { play: function() {} };
        playerShootSound = { play: function() {} };
        playerDeathSound = { play: function() {} };
    }
}

function startGame() {
    console.log("Starting game...");
    // Reset game state
    score = 0;
    lives = 3;
    playerBullets = [];
    enemyBullets = [];
    lastPlayerShot = 0;
    
    // Update UI
    scoreElement.textContent = score;
    livesElement.textContent = lives;
    
    if (startScreen) {
        startScreen.style.display = 'none';
        console.log("Start screen hidden");
    } else {
        console.error("Start screen element not found");
    }
    
    if (gameOverScreen) {
        gameOverScreen.style.display = 'none';
        console.log("Game over screen hidden");
    } else {
        console.error("Game over screen element not found");
    }
    
    // Create player
    player = {
        x: (CANVAS_WIDTH - PLAYER_WIDTH) / 2,
        y: CANVAS_HEIGHT - PLAYER_HEIGHT - 20,
        width: PLAYER_WIDTH,
        height: PLAYER_HEIGHT
    };
    console.log("Player created:", player);
    
    // Create enemies
    createEnemies();
    
    // Start game loop
    gameActive = true;
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
    console.log("Game active, starting game loop");
    gameLoop();
}

function createEnemies() {
    console.log("Creating enemies...");
    enemies = [];
    for (let row = 0; row < ENEMY_ROW_COUNT; row++) {
        for (let col = 0; col < ENEMY_COL_COUNT; col++) {
            enemies.push({
                x: ENEMY_LEFT_OFFSET + col * (ENEMY_WIDTH + ENEMY_PADDING),
                y: ENEMY_TOP_OFFSET + row * (ENEMY_HEIGHT + ENEMY_PADDING),
                width: ENEMY_WIDTH,
                height: ENEMY_HEIGHT,
                type: ENEMY_ROW_COUNT - row // Different enemy types based on row
            });
        }
    }
    console.log(`Created ${enemies.length} enemies`);
    enemyDirection = 1; // Reset enemy direction (moving right)
}

function fireBullet() {
    const now = Date.now();
    if (now - lastPlayerShot < PLAYER_FIRE_DELAY) return; // Enforce firing delay
    
    playerBullets.push({
        x: player.x + PLAYER_WIDTH / 2 - BULLET_WIDTH / 2,
        y: player.y - BULLET_HEIGHT,
        width: BULLET_WIDTH,
        height: BULLET_HEIGHT
    });
    
    lastPlayerShot = now;
    playerShootSound.play();
}

function enemyFireBullet() {
    // Randomly select enemies from the bottom row of each column
    const bottomEnemies = [];
    const columnMap = {};
    
    enemies.forEach(enemy => {
        const col = Math.floor((enemy.x - ENEMY_LEFT_OFFSET) / (ENEMY_WIDTH + ENEMY_PADDING));
        if (!columnMap[col] || enemy.y > columnMap[col].y) {
            columnMap[col] = enemy;
        }
    });
    
    for (let col in columnMap) {
        bottomEnemies.push(columnMap[col]);
    }
    
    if (bottomEnemies.length === 0) return;
    
    // Randomly select a bottom enemy to fire
    if (Math.random() < ENEMY_FIRE_RATE) {
        const shootingEnemy = bottomEnemies[Math.floor(Math.random() * bottomEnemies.length)];
        enemyBullets.push({
            x: shootingEnemy.x + ENEMY_WIDTH / 2 - BULLET_WIDTH / 2,
            y: shootingEnemy.y + ENEMY_HEIGHT,
            width: BULLET_WIDTH,
            height: BULLET_HEIGHT
        });
    }
}

function updateBullets() {
    // Update player bullets
    for (let i = playerBullets.length - 1; i >= 0; i--) {
        playerBullets[i].y -= BULLET_SPEED;
        
        // Remove bullets that go off-screen
        if (playerBullets[i].y < 0) {
            playerBullets.splice(i, 1);
            continue;
        }
        
        // Check for collisions with enemies
        for (let j = enemies.length - 1; j >= 0; j--) {
            if (checkCollision(playerBullets[i], enemies[j])) {
                // Enemy hit
                score += enemies[j].type * 10;
                scoreElement.textContent = score;
                enemies.splice(j, 1);
                playerBullets.splice(i, 1);
                enemyDeathSound.play();
                break;
            }
        }
    }
    
    // Update enemy bullets
    for (let i = enemyBullets.length - 1; i >= 0; i--) {
        enemyBullets[i].y += ENEMY_BULLET_SPEED;
        
        // Remove bullets that go off-screen
        if (enemyBullets[i].y > CANVAS_HEIGHT) {
            enemyBullets.splice(i, 1);
            continue;
        }
        
        // Check for collision with player
        if (gameActive && checkCollision(enemyBullets[i], player)) {
            enemyBullets.splice(i, 1);
            playerHit();
        }
    }
}

function updateEnemies() {
    // Initialize currentEnemySpeed for this frame
    let currentEnemySpeed = ENEMY_BASE_SPEED;
    let moveDown = false;
    let leftMost = CANVAS_WIDTH;
    let rightMost = 0;
    
    // Find leftmost and rightmost enemies
    enemies.forEach(enemy => {
        leftMost = Math.min(leftMost, enemy.x);
        rightMost = Math.max(rightMost, enemy.x + ENEMY_WIDTH);
    });
    
    // Check if enemies need to change direction and move down
    if (rightMost >= CANVAS_WIDTH - 20 && enemyDirection > 0) {
        enemyDirection = -1;
        moveDown = true;
    } else if (leftMost <= 20 && enemyDirection < 0) {
        enemyDirection = 1;
        moveDown = true;
    }
    
    // Update enemy positions
    enemies.forEach(enemy => {
        enemy.x += currentEnemySpeed * enemyDirection;
        if (moveDown) {
            enemy.y += ENEMY_DESCEND;
        }
        
        // Check if enemies reached the player
        if (enemy.y + ENEMY_HEIGHT >= player.y) {
            gameOver();
        }
    });
    
    // Increase enemy speed as they get fewer
    const speedMultiplier = 1 + (1 - enemies.length / (ENEMY_ROW_COUNT * ENEMY_COL_COUNT)) * 2;
    // Calculate current speed based on the base speed and multiplier
    currentEnemySpeed = ENEMY_BASE_SPEED * speedMultiplier;
    
    // Check if all enemies are destroyed
    if (enemies.length === 0) {
        // New wave
        createEnemies();
    }
}

function playerHit() {
    lives--;
    livesElement.textContent = lives;
    playerDeathSound.play();
    
    if (lives <= 0) {
        gameOver();
    } else {
        // Brief invulnerability period
        player.invulnerable = true;
        setTimeout(() => {
            player.invulnerable = false;
        }, 1500);
    }
}

function gameOver() {
    console.log("Game over!");
    gameActive = false;
    finalScoreElement.textContent = score;
    gameOverScreen.style.display = 'block';
}

function checkCollision(obj1, obj2) {
    return obj1.x < obj2.x + obj2.width &&
           obj1.x + obj1.width > obj2.x &&
           obj1.y < obj2.y + obj2.height &&
           obj1.y + obj1.height > obj2.y;
}

function draw() {
    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Draw player
    if (gameActive) {
        ctx.fillStyle = player.invulnerable ? '#ff6666' : '#33ff33';
        ctx.fillRect(player.x, player.y, player.width, player.height);
        
        // Draw player ship details
        ctx.fillStyle = '#000';
        ctx.fillRect(player.x + player.width / 2 - 2, player.y - 5, 4, 5);
    }
    
    // Draw enemies
    enemies.forEach(enemy => {
        // Different enemy colors/styles based on type
        switch(enemy.type) {
            case 1: ctx.fillStyle = '#ff3333'; break; // Red
            case 2: ctx.fillStyle = '#ff9933'; break; // Orange
            case 3: ctx.fillStyle = '#ffff33'; break; // Yellow
            case 4: ctx.fillStyle = '#33ff33'; break; // Green
            case 5: ctx.fillStyle = '#3399ff'; break; // Blue
            default: ctx.fillStyle = '#ffffff'; break; // White
        }
        
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        
        // Draw enemy details
        ctx.fillStyle = '#000';
        ctx.fillRect(enemy.x + 5, enemy.y + 5, 5, 5);
        ctx.fillRect(enemy.x + enemy.width - 10, enemy.y + 5, 5, 5);
        ctx.fillRect(enemy.x + 5, enemy.y + enemy.height - 5, enemy.width - 10, 2);
    });
    
    // Draw player bullets
    ctx.fillStyle = '#33ff33';
    playerBullets.forEach(bullet => {
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });
    
    // Draw enemy bullets
    ctx.fillStyle = '#ff3333';
    enemyBullets.forEach(bullet => {
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });
}

function gameLoop() {
    if (gameActive) {
        // Update game state
        if (window.updatePlayerPosition) window.updatePlayerPosition();
        updateBullets();
        updateEnemies();
        enemyFireBullet();
        
        // Draw everything
        draw();
    }
    
    // Continue the game loop
    animationId = requestAnimationFrame(gameLoop);
}

// Add listener for DOM content loaded to ensure buttons are properly accessible
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM fully loaded");
    // Double-check button accessibility
    const startButton = document.getElementById('startButton');
    if (startButton) {
        console.log("Start button confirmed available in DOM");
        startButton.addEventListener('click', startGame);
    }
});
