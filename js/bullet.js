/**
 * Bullet Class
 * Represents projectiles fired by the player
 */

class Bullet {
    constructor(x, y, angle, speed = 7) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.speed = speed;
        this.radius = 3;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.lifetime = 300; // frames until bullet disappears
        this.age = 0;
    }

    /**
     * Update bullet position
     */
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.age++;
    }

    /**
     * Draw bullet on canvas
     */
    draw(ctx) {
        // Create glow effect
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius * 2);
        gradient.addColorStop(0, 'rgba(0, 212, 255, 0.8)');
        gradient.addColorStop(1, 'rgba(0, 212, 255, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 2, 0, Math.PI * 2);
        ctx.fill();

        // Draw core
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // Draw trail
        ctx.strokeStyle = 'rgba(0, 212, 255, 0.6)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x - this.vx * 5, this.y - this.vy * 5);
        ctx.stroke();
    }

    /**
     * Check if bullet is out of bounds
     */
    isOutOfBounds(canvasWidth, canvasHeight) {
        return this.x < -10 || this.x > canvasWidth + 10 || 
               this.y < -10 || this.y > canvasHeight + 10;
    }

    /**
     * Check if bullet has expired
     */
    isExpired() {
        return this.age > this.lifetime;
    }
}
