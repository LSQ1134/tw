import { Vector2 } from '../utils/Vector2.js';

export class Bullet {
  constructor(x, y, vx, vy, damage, owner) {
    this.position = new Vector2(x, y);
    this.velocity = new Vector2(vx, vy);
    this.damage = damage;
    this.owner = owner;
    this.size = owner === 'player' ? 6 : 8;
    this.radius = this.size / 2;
    this.alive = true;
    
    this.collider = {
      x: this.position.x - this.size,
      y: this.position.y - this.size,
      width: this.size * 2,
      height: this.size * 2
    };
    
    this.target = null;
    if (owner !== 'player' && damage >= 25) {
      this.isHoming = true;
    } else {
      this.isHoming = false;
    }
  }

  update(deltaTime, game) {
    if (!this.alive) return;
    
    if (this.isHoming && this.target) {
      const dx = this.target.position.x - this.position.x;
      const dy = this.target.position.y - this.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance > 0) {
        this.velocity.x += (dx / distance) * 0.5;
        this.velocity.y += (dy / distance) * 0.5;
        
        const speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
        if (speed > 6) {
          this.velocity.x = (this.velocity.x / speed) * 6;
          this.velocity.y = (this.velocity.y / speed) * 6;
        }
      }
    }
    
    this.position.add(this.velocity);
    this.updateCollider();
    
    if (this.position.y < -50 || this.position.y > 770 ||
        this.position.x < -50 || this.position.x > 530) {
      this.alive = false;
    }
  }

  updateCollider() {
    this.collider.x = this.position.x - this.size;
    this.collider.y = this.position.y - this.size;
  }

  destroy() {
    this.alive = false;
  }

  render(ctx) {
    if (!this.alive) return;
    
    ctx.save();
    
    ctx.translate(this.position.x, this.position.y);
    
    if (this.owner === 'player') {
      ctx.fillStyle = '#00ffff';
      ctx.shadowColor = '#00ffff';
      ctx.shadowBlur = 10;
      
      ctx.beginPath();
      ctx.moveTo(0, -this.size);
      ctx.lineTo(-this.size * 0.5, this.size * 0.5);
      ctx.lineTo(this.size * 0.5, this.size * 0.5);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.fillStyle = '#ff00ff';
      ctx.shadowColor = '#ff00ff';
      ctx.shadowBlur = 10;
      
      ctx.beginPath();
      ctx.arc(0, 0, this.size, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, this.size * 0.4, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.restore();
  }

  reset() {
    this.alive = false;
    this.target = null;
  }
}