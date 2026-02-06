/**
 * Enemy Class
 * Represents alien invaders that the player must destroy
 */

class Enemy {
    constructor(x, y, type = 'basic', wave = 1) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.wave = wave;
        
        // Determine enemy properties based on type and wave
        switch (type) {
            case 'fast':
                this.speed = 2 + wave * 0.3;
                this.radius = 12;
                this.health = 1;
                this.score = 50 + wave * 10;
                this.color = '#ff006e';
                break;
            case 'tank':
                this.speed = 0.5 + wave * 0.05;
                this.radius = 18;
                this.health = 3 + Math.floor(wave / 2);
                this.score = 100 + wave * 20;
                this.color = '#ffaa00';
                break;
            case 'basic':
            default:
                this.speed = 1 + wave * 0.2;
                this.radius = 10;
                this.health = 1;
                this.score = 25 + wave * 5;
                this.color = '#00d4ff';
                break;
        }

        this.maxHealth = this.health;
        this.direction = Math.random() * Math.PI * 2; // Random direction
        this.vx = Math.cos(this.direction) * this.speed;
        this.vy = Math.sin(this.direction) * this.speed;
        this.wobble = Math.random() * Math.PI * 2;
        this.wobbleSpeed = 0.05 + Math.random() * 0.05;
    }

    /**
     * Update enemy position
     */
    update(canvasWidth, canvasHeight) {
        // Add wobbling movement
        this.wobble += this.wobbleSpeed;
        this.x += this.vx + Math.sin(this.wobble) * 0.3;
        this.y += this.vy + Math.cos(this.wobble) * 0.3;

        // Bounce off edges
        if (this.x - this.radius < 0 || this.x + this.radius > canvasWidth) {
            this.vx *= -1;
            this.x = clamp(this.x, this.radius, canvasWidth - this.radius);
        }

        if (this.y - this.radius < 0 || this.y + this.radius > canvasHeight) {
            this.vy *= -1;
            this.y = clamp(this.y, this.radius, canvasHeight - this.radius);
        }
    }

    /**
     * Draw enemy on canvas
     */
    draw(ctx) {
        // Draw outer ring
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.stroke();

        // Draw inner design based on type
        if (this.type === 'tank') {
            // Draw armor plating for tank
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius - 4, 0, Math.PI * 2);
            ctx.stroke();
        }

        // Draw core with health indicator
        const healthPercent = this.health / this.maxHealth;
        const coreColor = healthPercent > 0.5 ? '#00ff88' : healthPercent > 0.25 ? '#ffaa00' : '#ff3333';
        
        ctx.fillStyle = coreColor;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 0.4, 0, Math.PI * 2);
        ctx.fill();

        // Draw eyes for character
        if (this.type !== 'tank') {
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.arc(this.x - 4, this.y - 2, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(this.x + 4, this.y - 2, 2, 0, Math.PI * 2);
            ctx.fill();
        }

        // Draw glow effect
        ctx.strokeStyle = `rgba(${this.type === 'fast' ? '255, 0, 110' : this.type === 'tank' ? '255, 170, 0' : '0, 212, 255'}, 0.5)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius + 5, 0, Math.PI * 2);
        ctx.stroke();
    }

    /**
     * Take damage from bullet
     */
    takeDamage(damage = 1) {
        this.health -= damage;
    }

    /**
     * Check if enemy is destroyed
     */
    isDestroyed() {
        return this.health <= 0;
    }

    /**
     * Check if enemy reached bottom of screen
     */
    hasReachedBottom(canvasHeight) {
        return this.y > canvasHeight + 50;
    }
}
