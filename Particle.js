import { Vector2 } from '../utils/Vector2.js';

export class Particle {
  constructor(x, y, color, speed, life) {
    this.position = new Vector2(x, y);
    this.color = color;
    this.speed = speed;
    this.life = life;
    this.maxLife = life;
    this.alive = true;
    
    const angle = Math.random() * Math.PI * 2;
    this.velocity = new Vector2(
      Math.cos(angle) * this.speed,
      Math.sin(angle) * this.speed
    );
    
    this.size = Math.random() * 4 + 2;
  }

  update(deltaTime) {
    if (!this.alive) return;
    
    this.position.add(this.velocity);
    this.life -= deltaTime;
    this.size *= 0.98;
    
    if (this.life <= 0) {
      this.alive = false;
    }
  }

  render(ctx) {
    if (!this.alive) return;
    
    ctx.save();
    
    const alpha = this.life / this.maxLife;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 10;
    
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  }

  reset() {
    this.alive = false;
  }
}