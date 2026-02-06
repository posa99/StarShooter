/**
 * Utility Functions for Space Shooter Game
 * Handles sound, storage, and helper functions
 */

// ===================================
// Audio Manager
// ===================================

class AudioManager {
    constructor() {
        this.enabled = this.loadSoundSetting();
        this.audioContext = null;
        this.initAudioContext();
    }

    initAudioContext() {
        // Initialize Web Audio API context
        if (!this.audioContext && typeof (window.AudioContext || window.webkitAudioContext) !== 'undefined') {
            try {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            } catch (e) {
                console.log('Web Audio API not supported');
            }
        }
    }

    // Play a sound using Web Audio API (no external files needed)
    playSound(type) {
        if (!this.enabled || !this.audioContext) return;

        const ctx = this.audioContext;
        const now = ctx.currentTime;

        try {
            switch (type) {
                case 'shoot':
                    this.playShootSound(ctx, now);
                    break;
                case 'hit':
                    this.playHitSound(ctx, now);
                    break;
                case 'explosion':
                    this.playExplosionSound(ctx, now);
                    break;
                case 'level-up':
                    this.playLevelUpSound(ctx, now);
                    break;
                case 'pop':
                    this.playPopSound(ctx, now);
                    break;
                case 'gameover':
                    this.playGameOverSound(ctx, now);
                    break;
            }
        } catch (e) {
            console.log('Audio playback error:', e);
        }
    }

    playShootSound(ctx, now) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.05);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        
        osc.start(now);
        osc.stop(now + 0.05);
    }

    playHitSound(ctx, now) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.1);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        
        osc.start(now);
        osc.stop(now + 0.1);
    }

    playExplosionSound(ctx, now) {
        const noise = ctx.createBufferSource();
        const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.2, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < buffer.length; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
        noise.buffer = buffer;
        
        const gain = ctx.createGain();
        noise.connect(gain);
        gain.connect(ctx.destination);
        
        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        
        noise.start(now);
        noise.stop(now + 0.3);
    }

    playLevelUpSound(ctx, now) {
        const notes = [523.25, 659.25, 783.99];
        notes.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            osc.frequency.setValueAtTime(freq, now + i * 0.1);
            gain.gain.setValueAtTime(0.2, now + i * 0.1);
            gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.15);
            
            osc.start(now + i * 0.1);
            osc.stop(now + i * 0.1 + 0.15);
        });
    }

    playPopSound(ctx, now) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.05);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.1);
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        
        osc.start(now);
        osc.stop(now + 0.1);
    }

    playGameOverSound(ctx, now) {
        const notes = [392, 349.23, 329.63, 293.66];
        notes.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            osc.frequency.setValueAtTime(freq, now + i * 0.2);
            gain.gain.setValueAtTime(0.3, now + i * 0.2);
            gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.2 + 0.3);
            
            osc.start(now + i * 0.2);
            osc.stop(now + i * 0.2 + 0.3);
        });
    }

    setSoundEnabled(enabled) {
        this.enabled = enabled;
        localStorage.setItem('soundEnabled', enabled ? 'true' : 'false');
    }

    loadSoundSetting() {
        const saved = localStorage.getItem('soundEnabled');
        return saved === null ? true : saved === 'true';
    }
}

// ===================================
// Storage Manager
// ===================================

class StorageManager {
    constructor() {
        this.prefix = 'spaceshooter_';
    }

    getHighScores() {
        const data = localStorage.getItem(this.prefix + 'highscores');
        return data ? JSON.parse(data) : [];
    }

    saveScore(score, wave, enemiesDestroyed) {
        const scores = this.getHighScores();
        scores.push({
            score: score,
            wave: wave,
            enemiesDestroyed: enemiesDestroyed,
            date: new Date().toLocaleDateString()
        });
        scores.sort((a, b) => b.score - a.score);
        scores.splice(10); // Keep only top 10
        localStorage.setItem(this.prefix + 'highscores', JSON.stringify(scores));
        return scores[0].score === score; // Return true if new high score
    }

    getHighScore() {
        const scores = this.getHighScores();
        return scores.length > 0 ? scores[0].score : 0;
    }

    clearHighScores() {
        localStorage.removeItem(this.prefix + 'highscores');
    }

    setDarkMode(enabled) {
        localStorage.setItem(this.prefix + 'darkmode', enabled ? 'true' : 'false');
    }

    getDarkMode() {
        const saved = localStorage.getItem(this.prefix + 'darkmode');
        return saved === null ? true : saved === 'true';
    }

    setMobileControls(enabled) {
        localStorage.setItem(this.prefix + 'mobilecontrols', enabled ? 'true' : 'false');
    }

    getMobileControls() {
        const saved = localStorage.getItem(this.prefix + 'mobilecontrols');
        return saved === null ? true : saved === 'true';
    }
}

// ===================================
// Math & Physics Helpers
// ===================================

/**
 * Calculate distance between two points
 */
function distance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Check if two circles collide
 */
function checkCollision(obj1, obj2) {
    const dist = distance(obj1.x, obj1.y, obj2.x, obj2.y);
    return dist < obj1.radius + obj2.radius;
}

/**
 * Get angle from point A to point B (in radians)
 */
function getAngle(x1, y1, x2, y2) {
    return Math.atan2(y2 - y1, x2 - x1);
}

/**
 * Clamp value between min and max
 */
function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

/**
 * Linear interpolation
 */
function lerp(a, b, t) {
    return a + (b - a) * t;
}

/**
 * Get random number between min and max
 */
function random(min, max) {
    return Math.random() * (max - min) + min;
}

/**
 * Get random integer between min and max
 */
function randomInt(min, max) {
    return Math.floor(random(min, max + 1));
}

// ===================================
// Screen Size Helpers
// ===================================

/**
 * Check if device is mobile
 */
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Get optimal canvas size
 */
function getCanvasSize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    // Maintain 16:9 aspect ratio
    const ratio = 16 / 9;
    let canvasWidth = width;
    let canvasHeight = height;
    
    if (width / height > ratio) {
        canvasWidth = height * ratio;
    } else {
        canvasHeight = width / ratio;
    }
    
    return {
        width: Math.floor(canvasWidth),
        height: Math.floor(canvasHeight)
    };
}

// ===================================
// UI Helpers
// ===================================

/**
 * Show a screen
 */
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    const screen = document.getElementById(screenId);
    if (screen) {
        screen.classList.add('active');
    }
}

/**
 * Hide all screens
 */
function hideAllScreens() {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
}

/**
 * Format number with thousand separators
 */
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
