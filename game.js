function drawBunkers() {
    ctx.fillStyle = '#33ff33';
    
    bunkers.forEach(bunker => {
      bunker.blocks.forEach(block => {
        ctx.fillRect(block.x, block.y, block.width, block.height);
      });
    });
  }
  
  function drawEnemies() {
    enemies.forEach(enemy => {
      // Different enemy colors based on type
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
  }
  
  function drawBullets() {
    // Player bullets
    ctx.fillStyle = '#33ff33';
    playerBullets.forEach(bullet => {
      ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });
    
    // Enemy bullets
    ctx.fillStyle = '#ff3333';
    enemyBullets.forEach(bullet => {
      ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });
    
    // Bonus ship bombs
    ctx.fillStyle = '#ff33ff';
    bonusShipBombs.forEach(bomb => {
      ctx.fillRect(bomb.x, bomb.y, bomb.width, bomb.height);
    });
  }
  
  // Add simple tests
  function testBunkers() {
    createBunkers();
    console.assert(bunkers.length === BUNKER_COUNT, "Correct number of bunkers created");
    
    const testBullet = {
      x: bunkers[0].blocks[0].x,
      y: bunkers[0].blocks[0].y,
      width: BULLET_WIDTH,
      height: BULLET_HEIGHT
    };
    
    const blockCount = bunkers[0].blocks.length;
    const collisionResult = checkBunkerCollisions(testBullet, true);
    
    console.assert(collisionResult === true, "Collision detection works for bunkers");
    console.assert(bunkers[0].blocks.length === blockCount - 1, "Block was removed after hit");
    
    console.log("Bunker tests completed");
  }
  
  function testPlayerRocketDraw() {
    player = {
      x: CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2,
      y: CANVAS_HEIGHT - PLAYER_HEIGHT - 20,
      width: PLAYER_WIDTH,
      height: PLAYER_HEIGHT,
      invulnerable: false
    };
    
    drawPlayer();
    console.log("Player rocket ship drawing test completed");
  }
  
  function testBonusShip() {
    bonusShip = {
      x: CANVAS_WIDTH / 2 - BONUS_SHIP_WIDTH / 2,
      y: BONUS_SHIP_Y_POSITION,
      width: BONUS_SHIP_WIDTH,
      height: BONUS_SHIP_HEIGHT,
      speed: 3,
      points: 150
    };
    
    drawBonusShip();
    console.log("Bonus ship drawing test completed");
  }
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
  const ENEMY_FIRE_RATE = 0.01;
  const PLAYER_FIRE_DELAY = 300;
  
  // Bunker constants
  const BUNKER_COUNT = 3;
  const BUNKER_WIDTH = 80;
  const BUNKER_HEIGHT = 60;
  const BUNKER_BLOCK_SIZE = 10;
  const BUNKER_Y_POSITION = CANVAS_HEIGHT - 150;
  
  // Bonus spaceship constants
  const BONUS_SHIP_WIDTH = 60;
  const BONUS_SHIP_HEIGHT = 25;
  const BONUS_SHIP_MIN_SPEED = 2;
  const BONUS_SHIP_MAX_SPEED = 6;
  const BONUS_SHIP_Y_POSITION = 30;
  const BONUS_SHIP_MIN_INTERVAL = 10000;
  const BONUS_SHIP_MAX_INTERVAL = 30000;
  const BONUS_SHIP_BOMB_RATE = 0.01;
  
  // Game state
  let canvas, ctx;
  let player, enemies, playerBullets, enemyBullets, bunkers;
  let bonusShip = null;
  let bonusShipBombs = [];
  let nextBonusShipTime = 0;
  let score, lives;
  let gameActive = false;
  let lastPlayerShot = 0;
  let enemyDirection = 1;
  let animationId;
  let sounds = {};
  let gameControls = {
    left: false,
    right: false,
    fire: false
  };
  
  // DOM elements
  let scoreElement, livesElement, startScreen, gameOverScreen, finalScoreElement;
  
  // Initialize when document is ready
  document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM loaded");
    initGame();
  });
  
  function initGame() {
    // Get canvas and create context
    canvas = document.getElementById('gameCanvas');
    if (!canvas) {
      console.error("Canvas element not found");
      return;
    }
    
    ctx = canvas.getContext('2d');
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    
    // Get UI elements
    scoreElement = document.getElementById('score');
    livesElement = document.getElementById('lives');
    startScreen = document.getElementById('startScreen');
    gameOverScreen = document.getElementById('gameOverScreen');
    finalScoreElement = document.getElementById('finalScore');
    
    // Setup button listeners - IMPORTANT - this is where the start button is fixed
    setupButtonListeners();
    
    // Setup keyboard controls
    setupKeyboardControls();
    
    // Initialize sounds
    initSounds();
    
    // Draw initial welcome screen
    drawInitialScreen();
  }
  
  function setupButtonListeners() {
    // Set up start button
    const startButton = document.getElementById('startButton');
    if (startButton) {
      startButton.onclick = function(e) {
        e.preventDefault();
        console.log("Start button clicked");
        startGame();
      };
    } else {
      console.error("Start button not found");
    }
    
    // Set up restart button
    const restartButton = document.getElementById('restartButton');
    if (restartButton) {
      restartButton.onclick = function(e) {
        e.preventDefault();
        console.log("Restart button clicked");
        startGame();
      };
    } else {
      console.error("Restart button not found");
    }
  }
  
  function setupKeyboardControls() {
    window.addEventListener('keydown', (e) => {
      switch(e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          gameControls.left = true;
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          gameControls.right = true;
          break;
        case ' ':
          gameControls.fire = true;
          if (gameActive) {
            e.preventDefault();
            fireBullet();
          }
          break;
      }
    });
    
    window.addEventListener('keyup', (e) => {
      switch(e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          gameControls.left = false;
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          gameControls.right = false;
          break;
        case ' ':
          gameControls.fire = false;
          break;
      }
    });
  }
  
  function initSounds() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const audioCtx = new AudioContext();
      
      // Simple factory function for creating sounds
      function createSound(type, frequency, duration, volume = 0.3) {
        return {
          play: function() {
            try {
              const oscillator = audioCtx.createOscillator();
              const gainNode = audioCtx.createGain();
              
              oscillator.type = type;
              oscillator.frequency.setValueAtTime(frequency.start, audioCtx.currentTime);
              if (frequency.end) {
                oscillator.frequency.exponentialRampToValueAtTime(frequency.end, audioCtx.currentTime + duration);
              }
              
              gainNode.gain.setValueAtTime(volume, audioCtx.currentTime);
              gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
              
              oscillator.connect(gainNode);
              gainNode.connect(audioCtx.destination);
              
              oscillator.start();
              oscillator.stop(audioCtx.currentTime + duration);
            } catch (error) {
              console.error("Error playing sound:", error);
            }
          }
        };
      }
      
      // Create game sounds
      sounds.enemyDeath = createSound('square', {start: 150, end: 40}, 0.2);
      sounds.playerShoot = createSound('square', {start: 800, end: 300}, 0.1, 0.2);
      sounds.playerDeath = createSound('sawtooth', {start: 300, end: 30}, 0.5, 0.4);
      
      // UFO sound (continuous)
      sounds.bonusShip = {
        oscillator: null,
        gainNode: null,
        lfo: null,
        playing: false,
        play: function() {
          if (this.playing) return;
          try {
            this.oscillator = audioCtx.createOscillator();
            this.gainNode = audioCtx.createGain();
            this.lfo = audioCtx.createOscillator();
            const lfoGain = audioCtx.createGain();
            
            this.oscillator.type = 'sine';
            this.oscillator.frequency.setValueAtTime(600, audioCtx.currentTime);
            
            this.lfo.type = 'sine';
            this.lfo.frequency.value = 2;
            lfoGain.gain.value = 100;
            
            this.lfo.connect(lfoGain);
            lfoGain.connect(this.oscillator.frequency);
            
            this.gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
            
            this.oscillator.connect(this.gainNode);
            this.gainNode.connect(audioCtx.destination);
            
            this.oscillator.start();
            this.lfo.start();
            this.playing = true;
          } catch (error) {
            console.error("Error playing UFO sound:", error);
          }
        },
        stop: function() {
          if (!this.playing) return;
          try {
            if (this.gainNode) {
              this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, audioCtx.currentTime);
              this.gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
              
              setTimeout(() => {
                if (this.oscillator) {
                  this.oscillator.stop();
                  this.oscillator = null;
                }
                if (this.lfo) {
                  this.lfo.stop();
                  this.lfo = null;
                }
                this.playing = false;
              }, 500);
            }
          } catch (error) {
            console.error("Error stopping UFO sound:", error);
            this.playing = false;
          }
        }
      };
      
    } catch (error) {
      console.error("Error initializing sounds:", error);
      // Fallback empty sound objects
      sounds = {
        enemyDeath: { play: function() {} },
        playerShoot: { play: function() {} },
        playerDeath: { play: function() {} },
        bonusShip: { play: function() {}, stop: function() {}, playing: false }
      };
    }
  }
  
  function drawInitialScreen() {
    if (ctx) {
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.fillStyle = "#33ff33";
      ctx.font = "24px 'Courier New', Courier, monospace";
      ctx.fillText("Space Invaders Ready!", CANVAS_WIDTH/2 - 150, CANVAS_HEIGHT/2);
    }
  }
  
  function startGame() {
    console.log("Starting game");
    
    // Reset game state
    score = 0;
    lives = 3;
    playerBullets = [];
    enemyBullets = [];
    bonusShipBombs = [];
    bonusShip = null;
    lastPlayerShot = 0;
    
    // Schedule first bonus ship
    scheduleBonusShip();
    
    // Update UI
    if (scoreElement) scoreElement.textContent = score;
    if (livesElement) livesElement.textContent = lives;
    
    // Hide start screen, show game
    if (startScreen) startScreen.style.display = 'none';
    if (gameOverScreen) gameOverScreen.style.display = 'none';
    
    // Create player
    player = {
      x: (CANVAS_WIDTH - PLAYER_WIDTH) / 2,
      y: CANVAS_HEIGHT - PLAYER_HEIGHT - 20,
      width: PLAYER_WIDTH,
      height: PLAYER_HEIGHT
    };
    
    // Create enemies and bunkers
    createEnemies();
    createBunkers();
    
    // Start game loop
    gameActive = true;
    if (animationId) {
      cancelAnimationFrame(animationId);
    }
    
    gameLoop();
  }
  
  function createBunkers() {
    bunkers = [];
    
    const spacing = (CANVAS_WIDTH - BUNKER_COUNT * BUNKER_WIDTH) / (BUNKER_COUNT + 1);
    
    for (let i = 0; i < BUNKER_COUNT; i++) {
      const bunkerX = spacing + i * (BUNKER_WIDTH + spacing);
      
      const bunker = {
        x: bunkerX,
        y: BUNKER_Y_POSITION,
        width: BUNKER_WIDTH,
        height: BUNKER_HEIGHT,
        blocks: []
      };
      
      // Create the bunker blocks
      for (let row = 0; row < BUNKER_HEIGHT / BUNKER_BLOCK_SIZE; row++) {
        for (let col = 0; col < BUNKER_WIDTH / BUNKER_BLOCK_SIZE; col++) {
          // Skip blocks to create the arch shape
          if (
            // Create arch in the middle bottom
            (row >= BUNKER_HEIGHT / BUNKER_BLOCK_SIZE - 3 && 
             col >= (BUNKER_WIDTH / BUNKER_BLOCK_SIZE) / 3 && 
             col < (BUNKER_WIDTH / BUNKER_BLOCK_SIZE) * 2/3) ||
            // Skip corners for rounded appearance
            (row === 0 && col === 0) ||
            (row === 0 && col === BUNKER_WIDTH / BUNKER_BLOCK_SIZE - 1) ||
            (row === 1 && col === 0) ||
            (row === 1 && col === BUNKER_WIDTH / BUNKER_BLOCK_SIZE - 1)
          ) {
            continue;
          }
          
          bunker.blocks.push({
            x: bunkerX + col * BUNKER_BLOCK_SIZE,
            y: BUNKER_Y_POSITION + row * BUNKER_BLOCK_SIZE,
            width: BUNKER_BLOCK_SIZE,
            height: BUNKER_BLOCK_SIZE,
            health: 1 // Single hit to destroy
          });
        }
      }
      
      bunkers.push(bunker);
    }
  }
  
  function createEnemies() {
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
    enemyDirection = 1;
  }
  
  function scheduleBonusShip() {
    const delay = Math.random() * (BONUS_SHIP_MAX_INTERVAL - BONUS_SHIP_MIN_INTERVAL) + BONUS_SHIP_MIN_INTERVAL;
    nextBonusShipTime = Date.now() + delay;
  }
  
  function createBonusShip() {
    const direction = Math.random() > 0.5 ? 1 : -1;
    const speed = Math.random() * (BONUS_SHIP_MAX_SPEED - BONUS_SHIP_MIN_SPEED) + BONUS_SHIP_MIN_SPEED;
    const pointValue = Math.floor(speed * 50);
    
    bonusShip = {
      x: direction > 0 ? -BONUS_SHIP_WIDTH : CANVAS_WIDTH,
      y: BONUS_SHIP_Y_POSITION,
      width: BONUS_SHIP_WIDTH,
      height: BONUS_SHIP_HEIGHT,
      speed: speed * direction,
      points: pointValue
    };
    
    // Start bonus ship sound
    if (sounds.bonusShip && !sounds.bonusShip.playing) {
      sounds.bonusShip.play();
    }
  }
  
  function fireBullet() {
    const now = Date.now();
    if (now - lastPlayerShot < PLAYER_FIRE_DELAY) return;
    
    playerBullets.push({
      x: player.x + PLAYER_WIDTH / 2 - BULLET_WIDTH / 2,
      y: player.y - BULLET_HEIGHT,
      width: BULLET_WIDTH,
      height: BULLET_HEIGHT
    });
    
    lastPlayerShot = now;
    sounds.playerShoot.play();
  }
  
  function gameLoop() {
    if (gameActive) {
      updateGameState();
      drawGame();
    }
    
    animationId = requestAnimationFrame(gameLoop);
  }
  
  function updateGameState() {
    updatePlayer();
    updateBullets();
    updateEnemies();
    updateBonusShip();
    updateBonusShipBombs();
    enemyFireBullet();
  }
  
  function updatePlayer() {
    if (gameControls.left) {
      player.x = Math.max(0, player.x - PLAYER_SPEED);
    }
    if (gameControls.right) {
      player.x = Math.min(CANVAS_WIDTH - PLAYER_WIDTH, player.x + PLAYER_SPEED);
    }
  }
  
  function updateBullets() {
    // Player bullets
    for (let i = playerBullets.length - 1; i >= 0; i--) {
      playerBullets[i].y -= BULLET_SPEED;
      
      // Remove off-screen bullets
      if (playerBullets[i].y < 0) {
        playerBullets.splice(i, 1);
        continue;
      }
      
      // Check bunker collisions
      if (checkBunkerCollisions(playerBullets[i], true)) {
        playerBullets.splice(i, 1);
        continue;
      }
      
      // Check enemy collisions
      let hitSomething = false;
      for (let j = enemies.length - 1; j >= 0; j--) {
        if (checkCollision(playerBullets[i], enemies[j])) {
          score += enemies[j].type * 10;
          scoreElement.textContent = score;
          enemies.splice(j, 1);
          playerBullets.splice(i, 1);
          sounds.enemyDeath.play();
          hitSomething = true;
          break;
        }
      }
      
      if (hitSomething) continue;
      
      // Check bonus ship collision
      if (bonusShip && checkCollision(playerBullets[i], bonusShip)) {
        score += bonusShip.points;
        scoreElement.textContent = score;
        
        // Visual feedback
        showPointsText(bonusShip.x + bonusShip.width/2, bonusShip.y, bonusShip.points);
        
        // Reset bonus ship
        bonusShip = null;
        playerBullets.splice(i, 1);
        
        // Stop sound
        if (sounds.bonusShip && sounds.bonusShip.playing) {
          sounds.bonusShip.stop();
        }
        
        // Schedule next bonus ship
        scheduleBonusShip();
        
        // Play special sound
        sounds.enemyDeath.play();
        break;
      }
    }
    
    // Enemy bullets
    for (let i = enemyBullets.length - 1; i >= 0; i--) {
      enemyBullets[i].y += ENEMY_BULLET_SPEED;
      
      // Remove off-screen bullets
      if (enemyBullets[i].y > CANVAS_HEIGHT) {
        enemyBullets.splice(i, 1);
        continue;
      }
      
      // Check bunker collisions
      if (checkBunkerCollisions(enemyBullets[i], false)) {
        enemyBullets.splice(i, 1);
        continue;
      }
      
      // Check player collision
      if (gameActive && checkCollision(enemyBullets[i], player)) {
        enemyBullets.splice(i, 1);
        playerHit();
      }
    }
  }
  
  function showPointsText(x, y, points) {
    const pointsText = document.createElement('div');
    pointsText.textContent = `+${points}`;
    pointsText.style.position = 'absolute';
    pointsText.style.left = `${x}px`;
    pointsText.style.top = `${y}px`;
    pointsText.style.color = '#ff33ff';
    pointsText.style.fontFamily = "'Courier New', Courier, monospace";
    pointsText.style.fontSize = '20px';
    pointsText.style.fontWeight = 'bold';
    pointsText.style.zIndex = '100';
    document.querySelector('.game-container').appendChild(pointsText);
    
    // Animate and remove
    let opacity = 1;
    let animInterval = setInterval(() => {
      opacity -= 0.05;
      pointsText.style.opacity = opacity;
      pointsText.style.top = `${parseFloat(pointsText.style.top) - 1}px`;
      
      if (opacity <= 0) {
        clearInterval(animInterval);
        pointsText.remove();
      }
    }, 50);
  }
  
  function enemyFireBullet() {
    // Find bottom-most enemy in each column
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
    
    // Random chance to fire
    if (Math.random() < ENEMY_FIRE_RATE) {
      const shooter = bottomEnemies[Math.floor(Math.random() * bottomEnemies.length)];
      
      enemyBullets.push({
        x: shooter.x + ENEMY_WIDTH / 2 - BULLET_WIDTH / 2,
        y: shooter.y + ENEMY_HEIGHT,
        width: BULLET_WIDTH,
        height: BULLET_HEIGHT
      });
    }
  }
  
  function updateEnemies() {
    if (enemies.length === 0) {
      createEnemies();
      return;
    }
    
    // Calculate speed based on remaining enemies
    const speedMultiplier = 1 + (1 - enemies.length / (ENEMY_ROW_COUNT * ENEMY_COL_COUNT)) * 2;
    const currentSpeed = ENEMY_BASE_SPEED * speedMultiplier;
    
    // Find edge enemies
    let leftMost = CANVAS_WIDTH;
    let rightMost = 0;
    
    enemies.forEach(enemy => {
      leftMost = Math.min(leftMost, enemy.x);
      rightMost = Math.max(rightMost, enemy.x + ENEMY_WIDTH);
    });
    
    // Check if direction change needed
    let moveDown = false;
    
    if (rightMost >= CANVAS_WIDTH - 20 && enemyDirection > 0) {
      enemyDirection = -1;
      moveDown = true;
    } else if (leftMost <= 20 && enemyDirection < 0) {
      enemyDirection = 1;
      moveDown = true;
    }
    
    // Update positions
    enemies.forEach(enemy => {
      enemy.x += currentSpeed * enemyDirection;
      if (moveDown) {
        enemy.y += ENEMY_DESCEND;
      }
      
      // Check if reached player level
      if (enemy.y + ENEMY_HEIGHT >= player.y) {
        gameOver();
      }
    });
  }
  
  function updateBonusShip() {
    if (!bonusShip) {
      // Create new bonus ship if it's time
      if (gameActive && Date.now() >= nextBonusShipTime) {
        createBonusShip();
      }
      return;
    }
    
    // Move bonus ship
    bonusShip.x += bonusShip.speed;
    
    // Check if off-screen
    if ((bonusShip.speed > 0 && bonusShip.x > CANVAS_WIDTH) || 
        (bonusShip.speed < 0 && bonusShip.x < -BONUS_SHIP_WIDTH)) {
      // Remove and schedule next
      bonusShip = null;
      if (sounds.bonusShip && sounds.bonusShip.playing) {
        sounds.bonusShip.stop();
      }
      scheduleBonusShip();
      return;
    }
    
    // Random chance to drop bombs
    if (Math.random() < BONUS_SHIP_BOMB_RATE) {
      bonusShipBombs.push({
        x: bonusShip.x + bonusShip.width / 2 - BULLET_WIDTH / 2,
        y: bonusShip.y + bonusShip.height,
        width: BULLET_WIDTH,
        height: BULLET_HEIGHT
      });
    }
  }
  
  function updateBonusShipBombs() {
    for (let i = bonusShipBombs.length - 1; i >= 0; i--) {
      bonusShipBombs[i].y += ENEMY_BULLET_SPEED * 1.5;
      
      // Remove if off-screen
      if (bonusShipBombs[i].y > CANVAS_HEIGHT) {
        bonusShipBombs.splice(i, 1);
        continue;
      }
      
      // Check bunker collisions
      if (checkBunkerCollisions(bonusShipBombs[i], false)) {
        bonusShipBombs.splice(i, 1);
        continue;
      }
      
      // Check player collision
      if (gameActive && checkCollision(bonusShipBombs[i], player)) {
        bonusShipBombs.splice(i, 1);
        playerHit();
      }
    }
  }
  
  function checkBunkerCollisions(bullet, isPlayerBullet) {
    for (let i = 0; i < bunkers.length; i++) {
      for (let j = 0; j < bunkers[i].blocks.length; j++) {
        const block = bunkers[i].blocks[j];
        
        if (checkCollision(bullet, block)) {
          // Damage block and remove
          bunkers[i].blocks.splice(j, 1);
          return true;
        }
      }
    }
    return false;
  }
  
  function playerHit() {
    lives--;
    livesElement.textContent = lives;
    sounds.playerDeath.play();
    
    if (lives <= 0) {
      gameOver();
    } else {
      // Brief invulnerability
      player.invulnerable = true;
      setTimeout(() => {
        player.invulnerable = false;
      }, 1500);
    }
  }
  
  function gameOver() {
    gameActive = false;
    
    // Stop bonus ship sound
    if (sounds.bonusShip && sounds.bonusShip.playing) {
      sounds.bonusShip.stop();
    }
    
    finalScoreElement.textContent = score;
    gameOverScreen.style.display = 'block';
  }
  
  function checkCollision(obj1, obj2) {
    return obj1.x < obj2.x + obj2.width &&
           obj1.x + obj1.width > obj2.x &&
           obj1.y < obj2.y + obj2.height &&
           obj1.y + obj1.height > obj2.y;
  }
  
  function drawGame() {
    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Draw bonus ship
    if (bonusShip) {
      drawBonusShip();
    }
    
    // Draw player
    drawPlayer();
    
    // Draw bunkers
    drawBunkers();
    
    // Draw enemies
    drawEnemies();
    
    // Draw bullets
    drawBullets();
  }
  
  function drawPlayer() {
    // Main body
    ctx.fillStyle = player.invulnerable ? '#ff6666' : '#33ff33';
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    // Rocket nose cone
    ctx.beginPath();
    ctx.moveTo(player.x + player.width / 2, player.y - 10);
    ctx.lineTo(player.x + player.width * 0.3, player.y);
    ctx.lineTo(player.x + player.width * 0.7, player.y);
    ctx.closePath();
    ctx.fill();
    
    // Left fin
    ctx.beginPath();
    ctx.moveTo(player.x, player.y + player.height);
    ctx.lineTo(player.x - 10, player.y + player.height + 10);
    ctx.lineTo(player.x, player.y + player.height - 5);
    ctx.closePath();
    ctx.fill();
    
    // Right fin
    ctx.beginPath();
    ctx.moveTo(player.x + player.width, player.y + player.height);
    ctx.lineTo(player.x + player.width + 10, player.y + player.height + 10);
    ctx.lineTo(player.x + player.width, player.y + player.height - 5);
    ctx.closePath();
    ctx.fill();
    
    // Rocket flame (animated)
    const flameHeight = 10 + Math.random() * 5;
    ctx.beginPath();
    ctx.moveTo(player.x + player.width * 0.3, player.y + player.height);
    ctx.lineTo(player.x + player.width * 0.5, player.y + player.height + flameHeight);
    ctx.lineTo(player.x + player.width * 0.7, player.y + player.height);
    ctx.closePath();
    ctx.fillStyle = '#ff9933';
    ctx.fill();
  }
  
  function drawBonusShip() {
    if (!bonusShip) return;
    
    // Main body (oval shape)
    ctx.fillStyle = '#ff33ff';
    
    // Draw oval body safely
    ctx.beginPath();
    const centerX = bonusShip.x + bonusShip.width / 2;
    const centerY = bonusShip.y + bonusShip.height / 2;
    const radiusX = bonusShip.width / 2;
    const radiusY = bonusShip.height / 2;
    
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.scale(1, radiusY / radiusX);
    ctx.arc(0, 0, radiusX, 0, Math.PI * 2);
    ctx.restore();
    ctx.fill();
    
    // Draw dome on top
    ctx.fillStyle = '#33ffff';
    ctx.beginPath();
    const domeX = bonusShip.x + bonusShip.width / 2;
    const domeY = bonusShip.y + bonusShip.height / 3;
    const domeRadiusX = bonusShip.width / 4;
    
    ctx.arc(domeX, domeY, domeRadiusX, Math.PI, 0, true);
    ctx.closePath();
    ctx.fill();
    
    // Draw lights (animated)
    const time = Date.now() / 200;
    for (let i = 0; i < 3; i++) {
      const lightX = bonusShip.x + bonusShip.width * (0.3 + 0.2 * i);
      const lightY = bonusShip.y + bonusShip.height * 0.8 + Math.sin(time + i) * 2;
      
      ctx.fillStyle = (Math.floor(time + i) % 2 === 0) ? '#ffff33' : '#33ffff';
      ctx.beginPath();
      ctx.arc(lightX, lightY, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }