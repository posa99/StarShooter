/**
 * Space Shooter - Main Game Engine
 * Complete arcade game with PWA support
 */

class SpaceShooterGame {
    constructor() {
        // Canvas setup
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();

        // Game state
        this.state = 'menu'; // menu, playing, paused, gameover
        this.score = 0;
        this.wave = 1;
        this.enemiesDestroyed = 0;
        this.difficulty = 'normal';
        this.lives = 3;
        this.combo = 1;
        this.maxCombo = 1;
        this.comboTimer = 0;

        // Game objects
        this.player = null;
        this.bullets = [];
        this.enemies = [];
        this.particles = [];
        this.powerups = [];
        this.achievements = [];
        this.floatingTexts = [];
        this.powerupsSpawnedThisWave = 0;

        // Input
        this.keys = {};
        this.mouse = { x: 0, y: 0 };
        this.touchActive = false;

        // Managers
        this.audio = new AudioManager();
        this.storage = new StorageManager();
        this.setupTheme();

        // Spawn timing
        this.enemySpawnTimer = 0;
        this.enemySpawnDelay = 80;
        this.waveTimer = 0;
        this.waveDuration = 3000;

        // Performance
        this.lastFrameTime = 0;
        this.fps = 0;

        this.setupEventListeners();
        this.setupPWA();
        this.startGameLoop();
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Keyboard
        window.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            if (e.key === ' ' || e.key === 'Enter') e.preventDefault();
        });
        window.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });

        // Mouse
        window.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
        });
        this.canvas.addEventListener('click', () => {
            if (this.state === 'menu') {
                this.startGame();
            }
        });

        // Touch
        window.addEventListener('touchstart', (e) => {
            this.touchActive = true;
            this.handleTouchStart(e);
        });
        window.addEventListener('touchmove', (e) => {
            this.handleTouchMove(e);
            e.preventDefault();
        });
        window.addEventListener('touchend', () => {
            this.touchActive = false;
            if (this.player) {
                this.player.isShooting = false;
            }
        });

        // Window resize
        window.addEventListener('resize', () => this.resizeCanvas());

        // UI Buttons
        document.getElementById('start-btn').addEventListener('click', () => this.startGame());
        document.getElementById('pause-btn').addEventListener('click', () => this.togglePause());
        document.getElementById('resume-btn').addEventListener('click', () => this.togglePause());
        document.getElementById('restart-btn').addEventListener('click', () => this.startGame());

        document.getElementById('menu-btn').addEventListener('click', () => this.goToMenu());
        document.getElementById('menu-btn-2').addEventListener('click', () => this.goToMenu());
        document.getElementById('settings-btn').addEventListener('click', () => this.showSettings());
        document.getElementById('back-btn').addEventListener('click', () => this.hideSettings());

        // Settings
        document.getElementById('sound-toggle').addEventListener('change', (e) => {
            this.audio.setSoundEnabled(e.target.checked);
        });

        document.getElementById('dark-mode-toggle').addEventListener('change', (e) => {
            this.storage.setDarkMode(e.target.checked);
            this.setupTheme();
        });

        document.getElementById('mobile-controls-toggle').addEventListener('change', (e) => {
            this.storage.setMobileControls(e.target.checked);
            this.updateMobileControls();
        });

        // Joystick and Attack Button Handlers
        this.setupJoystickControls();
        this.setupAttackButton();

        document.getElementById('clear-scores-btn').addEventListener('click', () => {
            if (confirm('Clear all high scores?')) {
                this.storage.clearHighScores();
                this.updateHighScoresList();
            }
        });

        // PWA Install
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredInstallPrompt = e;
            document.getElementById('install-btn').classList.remove('hidden');
        });

        document.getElementById('install-btn').addEventListener('click', () => {
            if (this.deferredInstallPrompt) {
                this.deferredInstallPrompt.prompt();
                this.deferredInstallPrompt.userChoice.then((choiceResult) => {
                    if (choiceResult.outcome === 'accepted') {
                        document.getElementById('install-btn').classList.add('hidden');
                    }
                });
            }
        });

        // Prevent context menu on mobile
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    /**
     * Handle touch start
     */
    handleTouchStart(e) {
        if (this.state === 'menu') {
            this.startGame();
            return;
        }

        const touch = e.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.x = touch.clientX - rect.left;
        this.mouse.y = touch.clientY - rect.top;
    }

    /**
     * Handle touch move
     */
    handleTouchMove(e) {
        if (this.state !== 'playing' || !this.player) return;

        const touch = e.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.x = touch.clientX - rect.left;
        this.mouse.y = touch.clientY - rect.top;

        this.player.handleTouch(e.touches, rect);
    }

    /**
     * Setup theme
     */
    setupTheme() {
        const darkMode = this.storage.getDarkMode();
        if (darkMode) {
            document.body.classList.remove('light-mode');
        } else {
            document.body.classList.add('light-mode');
        }
        document.getElementById('dark-mode-toggle').checked = darkMode;
    }

    /**
     * Setup joystick controls for mobile
     */
    setupJoystickControls() {
        const joystickBg = document.querySelector('.joystick-bg');
        const joystickStick = document.getElementById('joystick');
        let isJoystickActive = false;
        let joystickTouchId = null;

        if (!joystickBg) return;

        const handleJoystickMove = (e) => {
            if (!isJoystickActive) return;

            const rect = joystickBg.getBoundingClientRect();
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            let clientX, clientY;
            if (e.touches) {
                // Find the correct touch point
                let touchFound = false;
                for (let i = 0; i < e.touches.length; i++) {
                    const touch = e.touches[i];
                    if (joystickTouchId === null || touch.identifier === joystickTouchId) {
                        clientX = touch.clientX - rect.left;
                        clientY = touch.clientY - rect.top;
                        touchFound = true;
                        break;
                    }
                }
                if (!touchFound) return;
            } else {
                clientX = e.clientX - rect.left;
                clientY = e.clientY - rect.top;
            }

            const dx = clientX - centerX;
            const dy = clientY - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const maxDistance = rect.width / 2 - 20;

            let moveX = dx;
            let moveY = dy;

            if (distance > maxDistance) {
                const angle = Math.atan2(dy, dx);
                moveX = Math.cos(angle) * maxDistance;
                moveY = Math.sin(angle) * maxDistance;
            }

            joystickStick.style.transform = `translate(calc(-50% + ${moveX}px), calc(-50% + ${moveY}px))`;

            // Update player movement based on joystick position
            if (this.state === 'playing' && this.player) {
                const angle = Math.atan2(moveY, moveX);
                const magnitude = Math.min(distance / maxDistance, 1);
                this.player.setJoystickInput(angle, magnitude);
            }
        };

        const handleJoystickStart = (e) => {
            isJoystickActive = true;
            joystickStick.classList.add('active');
            if (e.touches) {
                joystickTouchId = e.touches[0].identifier;
            }
            handleJoystickMove(e);
        };

        const handleJoystickEnd = () => {
            isJoystickActive = false;
            joystickTouchId = null;
            joystickStick.classList.remove('active');
            joystickStick.style.transform = 'translate(-50%, -50%)';
            if (this.state === 'playing' && this.player) {
                this.player.setJoystickInput(0, 0);
            }
        };

        // Mouse events
        joystickBg.addEventListener('mousedown', handleJoystickStart);
        document.addEventListener('mousemove', handleJoystickMove);
        document.addEventListener('mouseup', handleJoystickEnd);

        // Touch events
        joystickBg.addEventListener('touchstart', handleJoystickStart);
        document.addEventListener('touchmove', handleJoystickMove, { passive: false });
        document.addEventListener('touchend', handleJoystickEnd);
        document.addEventListener('touchcancel', handleJoystickEnd);
    }

    /**
     * Setup attack button for mobile
     */
    setupAttackButton() {
        const attackBtn = document.getElementById('attack-btn');
        if (!attackBtn) return;

        attackBtn.addEventListener('mousedown', () => {
            if (this.state === 'playing' && this.player) {
                this.player.isShooting = true;
            }
        });

        attackBtn.addEventListener('mouseup', () => {
            if (this.player) {
                this.player.isShooting = false;
            }
        });

        attackBtn.addEventListener('mouseleave', () => {
            if (this.player) {
                this.player.isShooting = false;
            }
        });

        attackBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (this.state === 'playing' && this.player) {
                this.player.isShooting = true;
            }
        });

        attackBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            if (this.player) {
                this.player.isShooting = false;
            }
        });

        attackBtn.addEventListener('touchcancel', (e) => {
            e.preventDefault();
            if (this.player) {
                this.player.isShooting = false;
            }
        });
    }

    /**
     * Update mobile controls visibility
     */
    updateMobileControls() {
        const controls = document.getElementById('touch-controls');
        if (isMobileDevice()) {
            controls.classList.remove('hidden');
        } else {
            controls.classList.add('hidden');
        }
    }

    /**
     * Update high scores display
     */
    updateHighScoresList() {
        const scores = this.storage.getHighScores();
        const list = document.getElementById('high-scores-list');

        if (scores.length === 0) {
            list.innerHTML = '<p>No scores yet. Play to record your best!</p>';
            return;
        }

        let html = '';
        scores.forEach((score, index) => {
            html += `
                <div class="high-score-item">
                    <span>#${index + 1} - Score: ${formatNumber(score.score)}</span>
                    <span>${score.date}</span>
                </div>
            `;
        });
        list.innerHTML = html;
    }

    /**
     * Start the game
     */
    startGame() {
        this.difficulty = document.getElementById('difficulty').value;
        
        this.score = 0;
        this.wave = 1;
        this.enemiesDestroyed = 0;
        this.lives = 3;
        this.combo = 1;
        this.maxCombo = 1;
        this.comboTimer = 0;
        this.bullets = [];
        this.enemies = [];
        this.particles = [];
        this.powerups = [];
        this.achievements = [];
        this.powerupsSpawnedThisWave = 0;
        this.waveTimer = 0;
        this.enemySpawnTimer = 0;

        // Set difficulty parameters
        const difficultySettings = {
            easy: { spawnDelay: 120, enemySpeed: 0.5, playerHealth: 150 },
            normal: { spawnDelay: 80, enemySpeed: 1, playerHealth: 100 },
            hard: { spawnDelay: 50, enemySpeed: 1.5, playerHealth: 80 },
            extreme: { spawnDelay: 30, enemySpeed: 2, playerHealth: 60 }
        };

        const settings = difficultySettings[this.difficulty];
        this.baseSpawnDelay = settings.spawnDelay;
        this.enemySpeedMultiplier = settings.enemySpeed;

        this.player = new Player(this.canvas.width, this.canvas.height);
        this.player.maxHealth = settings.playerHealth;
        this.player.health = settings.playerHealth;

        this.state = 'playing';
        hideAllScreens();
        document.getElementById('game-screen').classList.add('active');
        this.updateMobileControls();
        this.audio.playSound('level-up');
    }

    /**
     * Show level-up pop-up notification
     */
    showLevelUpPopup() {
        const popup = document.getElementById('levelup-popup');
        const waveNum = document.getElementById('popup-wave-num');
        
        waveNum.textContent = this.wave;
        popup.classList.remove('hidden');
        
        // Hide popup after 1.5 seconds
        setTimeout(() => {
            popup.classList.add('hidden');
        }, 1500);
    }

    /**
     * Toggle pause
     */
    togglePause() {
        if (this.state === 'playing') {
            this.state = 'paused';
            showScreen('pause-screen');
        } else if (this.state === 'paused') {
            this.state = 'playing';
            hideAllScreens();
            document.getElementById('game-screen').classList.add('active');
        }
    }

    /**
     * Go to menu
     */
    goToMenu() {
        this.state = 'menu';
        this.player = null;
        this.bullets = [];
        this.enemies = [];
        this.particles = [];
        showScreen('start-screen');
    }

    /**
     * Show settings
     */
    showSettings() {
        showScreen('settings-screen');
        this.updateHighScoresList();
    }

    /**
     * Hide settings
     */
    hideSettings() {
        showScreen('start-screen');
    }

    /**
     * Apply power-up effect
     */
    applyPowerUp(type) {
        if (type === 'shield') {
            this.player.maxHealth = Math.min(this.player.maxHealth + 30, 200);
            this.player.health = this.player.maxHealth;
            document.getElementById('shield-indicator').classList.remove('hidden');
            setTimeout(() => {
                document.getElementById('shield-indicator').classList.add('hidden');
            }, 5000);
        } else if (type === 'rapidfire') {
            this.player.shootDelay = Math.max(2, this.player.shootDelay - 3);
            document.getElementById('rapidfire-indicator').classList.remove('hidden');
            setTimeout(() => {
                document.getElementById('rapidfire-indicator').classList.add('hidden');
                this.player.shootDelay = 8;
            }, 8000);
        }
    }

    /**
     * Reset combo multiplier
     */
    resetCombo() {
        this.combo = 1;
        this.comboTimer = 0;
    }

    /**
     * Check achievements
     */
    checkAchievements() {
        const achievements = [];
        
        if (this.score >= 5000 && !this.achievements.includes('bigspender')) {
            achievements.push({ id: 'bigspender', name: 'Big Spender', desc: 'Reach 5,000 points' });
            this.achievements.push('bigspender');
        }
        
        if (this.score >= 20000 && !this.achievements.includes('legend')) {
            achievements.push({ id: 'legend', name: 'Legend', desc: 'Reach 20,000 points' });
            this.achievements.push('legend');
        }
        
        if (this.wave >= 10 && !this.achievements.includes('wavemaster')) {
            achievements.push({ id: 'wavemaster', name: 'Wave Master', desc: 'Reach wave 10' });
            this.achievements.push('wavemaster');
        }
        
        if (this.maxCombo >= 3 && !this.achievements.includes('onfire')) {
            achievements.push({ id: 'onfire', name: 'On Fire', desc: 'Reach 3x combo' });
            this.achievements.push('onfire');
        }
        
        if (this.enemiesDestroyed >= 500 && !this.achievements.includes('terminator')) {
            achievements.push({ id: 'terminator', name: 'Terminator', desc: 'Destroy 500 enemies' });
            this.achievements.push('terminator');
        }

        return achievements;
    }

    /**
     * Game over
     */
    gameOver() {
        this.state = 'gameover';
        const isNewHighScore = this.storage.saveScore(this.score, this.wave, this.enemiesDestroyed);

        document.getElementById('final-score').textContent = formatNumber(this.score);
        document.getElementById('final-wave').textContent = this.wave;
        document.getElementById('enemies-destroyed').textContent = formatNumber(this.enemiesDestroyed);
        document.getElementById('highest-combo').textContent = 'x' + this.maxCombo.toFixed(1);

        if (isNewHighScore) {
            document.getElementById('high-score-message').classList.remove('hidden');
        } else {
            document.getElementById('high-score-message').classList.add('hidden');
        }

        // Display achievements
        const newAchievements = this.checkAchievements();
        if (newAchievements.length > 0) {
            document.getElementById('achievements-earned').classList.remove('hidden');
            const list = document.getElementById('achievements-list');
            list.innerHTML = newAchievements.map(a => 
                `<div class="achievement-item"><strong>${a.name}</strong> - ${a.desc}</div>`
            ).join('');
        } else {
            document.getElementById('achievements-earned').classList.add('hidden');
        }

        showScreen('gameover-screen');
        this.audio.playSound('gameover');
    }

    /**
     * Spawn enemies for current wave
     */
    spawnWaveEnemies() {
        const enemyCount = 3 + Math.floor(this.wave / 2);
        const types = ['basic', 'fast', 'tank'];

        for (let i = 0; i < enemyCount; i++) {
            const type = this.wave < 3 ? 'basic' : types[Math.floor(Math.random() * types.length)];
            const x = randomInt(this.player.radius + 20, this.canvas.width - this.player.radius - 20);
            const y = randomInt(-150, -50);
            this.enemies.push(new Enemy(x, y, type, this.wave));
        }
    }

    /**
     * Create floating text (score popup)
     */
    createFloatingText(x, y, text, color) {
        this.floatingTexts.push({
            x: x,
            y: y,
            text: text,
            color: color,
            lifetime: 60,
            age: 0,
            vx: random(-1, 1),
            vy: -2
        });
    }

    /**
     * Create explosion particle effect
     */
    createExplosion(x, y, count = 10) {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count;
            const speed = random(2, 6);
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                lifetime: 30,
                age: 0,
                radius: random(2, 5),
                color: Math.random() > 0.5 ? '#ff006e' : '#ffaa00'
            });
        }
    }

    /**
     * Update game state
     */
    update() {
        if (this.state !== 'playing' || !this.player) return;

        // Update player input
        this.player.handleKeyboard(this.keys);
        if (!this.touchActive) {
            this.player.handlePointer(this.mouse.x, this.mouse.y);
        }
        this.player.update();

        // Handle shooting
        const newBullet = this.player.shoot();
        if (newBullet) {
            this.bullets.push(newBullet);
            this.audio.playSound('shoot');
        }

        // Update bullets
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            this.bullets[i].update();
            if (this.bullets[i].isOutOfBounds(this.canvas.width, this.canvas.height) ||
                this.bullets[i].isExpired()) {
                this.bullets.splice(i, 1);
            }
        }

        // Spawn wave enemies
        this.enemySpawnTimer++;
        if (this.enemies.length < 3 + Math.floor(this.wave / 2) && 
            this.enemySpawnTimer > this.enemySpawnDelay) {
            this.spawnWaveEnemies();
            this.enemySpawnTimer = 0;
        }

        // Update enemies
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            enemy.update(this.canvas.width, this.canvas.height);

            // Check if enemy reached bottom (player hit)
            if (enemy.hasReachedBottom(this.canvas.height)) {
                this.player.takeDamage(10);
                this.enemies.splice(i, 1);
                this.audio.playSound('hit');
                this.resetCombo();
                continue;
            }

            // Check bullet collisions
            for (let j = this.bullets.length - 1; j >= 0; j--) {
                if (checkCollision(enemy, this.bullets[j])) {
                    enemy.takeDamage(1);
                    this.bullets.splice(j, 1);
                    this.audio.playSound('hit');

                    if (enemy.isDestroyed()) {
                        const pointsEarned = enemy.score * this.combo;
                        this.score += pointsEarned;
                        this.enemiesDestroyed++;
                        this.combo = Math.min(this.combo + 0.1, 5);
                        this.maxCombo = Math.max(this.maxCombo, this.combo);
                        this.comboTimer = 300;
                        this.createExplosion(enemy.x, enemy.y, 15);
                        this.audio.playSound('hit');
                        
                        // Create floating score text
                        this.createFloatingText(enemy.x, enemy.y, '+' + pointsEarned, '#ffaa00');
                        
                        // Spawn power-up with guaranteed spawn per wave
                        const totalEnemiesInWave = 3 + Math.floor(this.wave / 2);
                        const baseSpawnChance = Math.min(0.25, 0.1 + (this.powerupsSpawnedThisWave / (totalEnemiesInWave * 0.5)));
                        
                        if (Math.random() < baseSpawnChance || this.powerupsSpawnedThisWave === 0) {
                            const powerupType = Math.random() < 0.5 ? 'shield' : 'rapidfire';
                            this.powerups.push({
                                x: enemy.x,
                                y: enemy.y,
                                type: powerupType,
                                radius: 8,
                                vx: random(-2, 2),
                                vy: random(1, 3),
                                lifetime: 300,
                                age: 0
                            });
                            this.powerupsSpawnedThisWave++;
                        }
                        
                        this.enemies.splice(i, 1);
                    }
                    break;
                }
            }
        }

        // Update particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.age++;
            if (p.age >= p.lifetime) {
                this.particles.splice(i, 1);
            }
        }

        // Update floating texts
        for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
            const text = this.floatingTexts[i];
            text.x += text.vx;
            text.y += text.vy;
            text.age++;
            if (text.age >= text.lifetime) {
                this.floatingTexts.splice(i, 1);
            }
        }

        // Update power-ups
        for (let i = this.powerups.length - 1; i >= 0; i--) {
            const powerup = this.powerups[i];
            powerup.x += powerup.vx;
            powerup.y += powerup.vy;
            powerup.age++;
            
            if (powerup.age >= powerup.lifetime) {
                this.powerups.splice(i, 1);
                continue;
            }

            // Check player collision
            if (checkCollision(this.player, powerup)) {
                this.applyPowerUp(powerup.type);
                this.createExplosion(powerup.x, powerup.y, 8);
                this.audio.playSound('level-up');
                this.powerups.splice(i, 1);
            }
        }

        // Update combo timer
        if (this.comboTimer > 0) {
            this.comboTimer--;
        } else {
            this.resetCombo();
        }

        // Wave progression
        this.waveTimer++;
        if (this.enemies.length === 0 && this.waveTimer > 120) {
            this.wave++;
            this.waveTimer = 0;
            this.powerupsSpawnedThisWave = 0;
            this.enemySpawnDelay = Math.max(30, this.enemySpawnDelay - 5);
            this.audio.playSound('level-up');
            this.audio.playSound('pop');
            this.showLevelUpPopup();
        }

        // Update UI
        document.getElementById('score').textContent = formatNumber(this.score);
        document.getElementById('wave').textContent = this.wave;
        document.getElementById('scaling').textContent = (1 + (this.wave - 1) * 0.2).toFixed(1) + 'x';
        document.getElementById('lives').textContent = this.lives;
        document.getElementById('combo').textContent = 'x' + this.combo.toFixed(1);
        const healthPercent = (this.player.health / this.player.maxHealth) * 100;
        document.getElementById('health-fill').style.width = healthPercent + '%';

        // Check game over
        if (!this.player.isAlive()) {
            this.lives--;
            if (this.lives <= 0) {
                this.gameOver();
            } else {
                this.player.reset(this.canvas.width, this.canvas.height);
                this.resetCombo();
            }
        }
    }

    /**
     * Draw game
     */
    draw() {
        // Clear canvas
        this.ctx.fillStyle = 'rgba(10, 10, 46, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw background grid
        this.drawGrid();

        if (this.state === 'playing' && this.player) {
            // Draw player
            this.player.draw(this.ctx);

            // Draw bullets
            this.bullets.forEach(bullet => bullet.draw(this.ctx));

            // Draw enemies
            this.enemies.forEach(enemy => enemy.draw(this.ctx));

            // Draw power-ups
            this.powerups.forEach(powerup => {
                const color = powerup.type === 'shield' ? '#00ff88' : '#ffaa00';
                const symbol = powerup.type === 'shield' ? 'S' : 'RF';
                
                this.ctx.fillStyle = color;
                this.ctx.globalAlpha = 0.3;
                this.ctx.beginPath();
                this.ctx.arc(powerup.x, powerup.y, powerup.radius * 3, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.globalAlpha = 1;

                this.ctx.fillStyle = color;
                this.ctx.beginPath();
                this.ctx.arc(powerup.x, powerup.y, powerup.radius, 0, Math.PI * 2);
                this.ctx.fill();

                this.ctx.fillStyle = '#000000';
                this.ctx.font = 'bold 10px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText(symbol, powerup.x, powerup.y);
            });

            // Draw particles
            this.particles.forEach(p => {
                this.ctx.fillStyle = p.color;
                const alpha = 1 - (p.age / p.lifetime);
                this.ctx.globalAlpha = alpha;
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.globalAlpha = 1;
            });

            // Draw floating texts
            this.floatingTexts.forEach(text => {
                const alpha = 1 - (text.age / text.lifetime);
                this.ctx.fillStyle = text.color;
                this.ctx.globalAlpha = alpha;
                this.ctx.font = 'bold 24px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.shadowColor = 'rgba(0,0,0,0.8)';
                this.ctx.shadowBlur = 4;
                this.ctx.shadowOffsetX = 2;
                this.ctx.shadowOffsetY = 2;
                this.ctx.fillText(text.text, text.x, text.y);
                this.ctx.globalAlpha = 1;
                this.ctx.shadowColor = 'transparent';
            });
        }

        // Draw FPS (debug)
        // this.drawDebugInfo();
    }

    /**
     * Draw background grid
     */
    drawGrid() {
        const gridSize = 50;
        this.ctx.strokeStyle = 'rgba(0, 212, 255, 0.05)';
        this.ctx.lineWidth = 1;

        for (let x = 0; x < this.canvas.width; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }

        for (let y = 0; y < this.canvas.height; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }

    /**
     * Draw debug info
     */
    drawDebugInfo() {
        this.ctx.fillStyle = '#00ff88';
        this.ctx.font = '12px monospace';
        this.ctx.fillText(`FPS: ${this.fps.toFixed(0)}`, 10, 20);
        this.ctx.fillText(`Enemies: ${this.enemies.length}`, 10, 35);
        this.ctx.fillText(`Bullets: ${this.bullets.length}`, 10, 50);
        this.ctx.fillText(`Particles: ${this.particles.length}`, 10, 65);
    }

    /**
     * Resize canvas
     */
    resizeCanvas() {
        const size = getCanvasSize();
        this.canvas.width = size.width;
        this.canvas.height = size.height;
    }

    /**
     * Main game loop
     */
    startGameLoop() {
        const gameLoop = (currentTime) => {
            // Calculate FPS
            if (this.lastFrameTime) {
                this.fps = 1000 / (currentTime - this.lastFrameTime);
            }
            this.lastFrameTime = currentTime;

            // Update and draw
            this.update();
            this.draw();

            requestAnimationFrame(gameLoop);
        };

        requestAnimationFrame(gameLoop);
    }

    /**
     * Setup PWA features
     */
    setupPWA() {
        // Check if app is installed
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
        });

        window.addEventListener('appinstalled', () => {
            console.log('✅ App installed successfully!');
        });
    }
}

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const game = new SpaceShooterGame();
    showScreen('start-screen');
});
