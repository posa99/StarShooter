/**
 * Player Class
 * Represents the player's spaceship
 */

class Player {
    constructor(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        
        // Position
        this.x = canvasWidth / 2;
        this.y = canvasHeight - 60;
        this.radius = 12;
        
        // Movement
        this.vx = 0;
        this.vy = 0;
        this.speed = 6;
        
        // Shooting
        this.shootCooldown = 0;
        this.shootDelay = 8;
        this.isShooting = false;
        
        // Health
        this.health = 100;
        this.maxHealth = 100;
        
        // Animation
        this.rotation = 0;
        this.targetRotation = 0;
    }

    /**
     * Handle keyboard input
     */
    handleKeyboard(keys) {
        this.vx = 0;
        this.vy = 0;

        if (keys['ArrowLeft'] || keys['a'] || keys['A']) {
            this.vx = -this.speed;
        }
        if (keys['ArrowRight'] || keys['d'] || keys['D']) {
            this.vx = this.speed;
        }
        if (keys['ArrowUp'] || keys['w'] || keys['W']) {
            this.vy = -this.speed;
        }
        if (keys['ArrowDown'] || keys['s'] || keys['S']) {
            this.vy = this.speed;
        }

        this.isShooting = keys[' '] || keys['Enter'];
    }

    /**
     * Handle mouse/touch input
     */
    handlePointer(mouseX, mouseY) {
        // Smooth movement towards mouse
        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 50) {
            this.vx = 0;
            this.vy = 0;
        } else {
            const speed = Math.min(this.speed, distance / 10);
            this.vx = (dx / distance) * speed;
            this.vy = (dy / distance) * speed;
        }

        // Rotate to face mouse
        this.targetRotation = Math.atan2(dy, dx);
    }

    /**
     * Handle touch input for mobile
     */
    handleTouch(touches, canvasRect) {
        if (touches.length === 0) return;

        const touch = touches[0];
        const x = touch.clientX - canvasRect.left;
        const y = touch.clientY - canvasRect.top;

        this.handlePointer(x, y);
        this.isShooting = true;
    }

    /**
     * Update player state
     */
    update() {
        // Update position
        this.x += this.vx;
        this.y += this.vy;

        // Keep player in bounds
        this.x = clamp(this.x, this.radius, this.canvasWidth - this.radius);
        this.y = clamp(this.y, this.radius, this.canvasHeight - this.radius);

        // Update rotation (smooth interpolation)
        const rotationDiff = this.targetRotation - this.rotation;
        if (Math.abs(rotationDiff) > 0.05) {
            this.rotation += rotationDiff * 0.1;
        } else {
            this.rotation = this.targetRotation;
        }

        // Update shoot cooldown
        if (this.shootCooldown > 0) {
            this.shootCooldown--;
        }
    }

    /**
     * Draw player on canvas
     */
    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        // Draw main body (triangle)
        ctx.fillStyle = '#00d4ff';
        ctx.beginPath();
        ctx.moveTo(15, 0); // Front point
        ctx.lineTo(-10, -12); // Left back
        ctx.lineTo(-5, 0); // Middle back
        ctx.lineTo(-10, 12); // Right back
        ctx.closePath();
        ctx.fill();

        // Draw energy core
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-2, 0, 5, 0, Math.PI * 2);
        ctx.fill();

        // Draw glow
        ctx.strokeStyle = 'rgba(0, 212, 255, 0.6)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius + 3, 0, Math.PI * 2);
        ctx.stroke();

        // Draw exhaust flame if moving
        if (Math.abs(this.vx) > 0 || Math.abs(this.vy) > 0) {
            const flameLength = 12 + Math.random() * 5;
            ctx.strokeStyle = 'rgba(255, 170, 0, 0.8)';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(-5, -5);
            ctx.lineTo(-5 - flameLength, -5 - Math.random() * 3);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(-5, 5);
            ctx.lineTo(-5 - flameLength, 5 + Math.random() * 3);
            ctx.stroke();
        }

        ctx.restore();

        // Draw health bar below player
        const barWidth = 40;
        const barHeight = 4;
        const barX = this.x - barWidth / 2;
        const barY = this.y + this.radius + 10;

        // Background
        ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
        ctx.fillRect(barX, barY, barWidth, barHeight);

        // Health bar
        const healthPercent = this.health / this.maxHealth;
        const healthColor = healthPercent > 0.5 ? '#00ff88' : healthPercent > 0.25 ? '#ffaa00' : '#ff3333';
        ctx.fillStyle = healthColor;
        ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);

        // Border
        ctx.strokeStyle = '#00d4ff';
        ctx.lineWidth = 1;
        ctx.strokeRect(barX, barY, barWidth, barHeight);
    }

    /**
     * Shoot a bullet
     */
    shoot() {
        if (this.shootCooldown > 0 || !this.isShooting) {
            return null;
        }

        this.shootCooldown = this.shootDelay;

        // Create bullet in front of player
        const bulletDistance = 15;
        const bulletX = this.x + Math.cos(this.rotation) * bulletDistance;
        const bulletY = this.y + Math.sin(this.rotation) * bulletDistance;

        return new Bullet(bulletX, bulletY, this.rotation);
    }

    /**
     * Take damage
     */
    takeDamage(damage) {
        this.health = Math.max(0, this.health - damage);
    }

    /**
     * Heal
     */
    heal(amount) {
        this.health = Math.min(this.maxHealth, this.health + amount);
    }

    /**
     * Check if player is alive
     */
    isAlive() {
        return this.health > 0;
    }

    /**
     * Reset player state
     */
    reset(canvasWidth, canvasHeight) {
        this.x = canvasWidth / 2;
        this.y = canvasHeight - 60;
        this.vx = 0;
        this.vy = 0;
        this.health = this.maxHealth;
        this.shootCooldown = 0;
    }
}
