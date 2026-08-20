import { Vector2 } from '../utils/Vector2.js';

export class Boss {
  constructor(game) {
    this.game = game;
    this.position = new Vector2(game.width / 2, -150);
    this.targetY = 150;
    this.size = 80;
    this.radius = 50;
    
    this.maxHealth = 5000;
    this.health = this.maxHealth;
    
    this.phase = 1;
    this.lastPhaseChange = 0;
    
    this.moveDirection = 1;
    this.moveTime = 0;
    
    this.fireTime = 0;
    this.attackPattern = 0;
    
    this.alive = true;
    this.entering = true;
    
    this.collider = {
      x: this.position.x - this.size,
      y: this.position.y - this.size,
      width: this.size * 2,
      height: this.size * 2
    };
    
    this.weakPoints = [
      { x: 0, y: -30, radius: 15, active: true },
      { x: -40, y: 20, radius: 12, active: false },
      { x: 40, y: 20, radius: 12, active: false }
    ];
  }

  update(deltaTime) {
    if (!this.alive) return;
    
    if (this.entering) {
      this.position.y += 2;
      if (this.position.y >= this.targetY) {
        this.position.y = this.targetY;
        this.entering = false;
      }
      return;
    }
    
    this.move(deltaTime);
    this.fire(deltaTime);
    this.updatePhase();
    this.updateCollider();
  }

  move(deltaTime) {
    this.moveTime += deltaTime;
    
    if (this.phase === 1) {
      this.position.x += Math.sin(this.moveTime * 2) * 3;
    } else if (this.phase === 2) {
      this.position.x += this.moveDirection * 4;
      if (this.position.x > this.game.width - this.size || this.position.x < this.size) {
        this.moveDirection *= -1;
      }
    } else if (this.phase === 3) {
      if (this.moveTime > 0.5) {
        this.position.x = Math.random() * (this.game.width - this.size * 2) + this.size;
        this.moveTime = 0;
      }
    }
  }

  fire(deltaTime) {
    this.fireTime += deltaTime;
    
    const patterns = [
      () => this.fireStraight(),
      () => this.fireScatter(),
      () => this.fireSpiral(),
      () => this.fireCircle(),
      () => this.fireHoming()
    ];
    
    let fireInterval = 0.5;
    
    switch (this.phase) {
      case 1:
        fireInterval = 0.5;
        if (this.fireTime >= fireInterval) {
          patterns[0]();
          if (Math.random() < 0.5) patterns[1]();
          this.fireTime = 0;
        }
        break;
        
      case 2:
        fireInterval = 0.3;
        if (this.fireTime >= fireInterval) {
          patterns[2]();
          if (Math.random() < 0.3) patterns[3]();
          this.fireTime = 0;
        }
        break;
        
      case 3:
        fireInterval = 0.2;
        if (this.fireTime >= fireInterval) {
          patterns[4]();
          if (Math.random() < 0.5) patterns[2]();
          if (this.fireTime > 1.0) {
            this.fireCircle();
            this.fireTime = 0;
          }
        }
        break;
    }
  }

  fireStraight() {
    for (let i = -2; i <= 2; i++) {
      this.game.createBullet(
        this.position.x + i * 30,
        this.position.y + this.size,
        0, 5,
        15,
        'enemy'
      );
    }
  }

  fireScatter() {
    const count = 8;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI / count) * i + Math.PI * 0.5;
      this.game.createBullet(
        this.position.x,
        this.position.y + this.size,
        Math.cos(angle) * 4,
        Math.sin(angle) * 4,
        12,
        'enemy'
      );
    }
  }

  fireSpiral() {
    const count = 6;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 / count) * i + this.fireTime * 10;
      this.game.createBullet(
        this.position.x,
        this.position.y,
        Math.cos(angle) * 3,
        Math.sin(angle) * 3 + 2,
        10,
        'enemy'
      );
    }
  }

  fireCircle() {
    const count = 16;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 / count) * i;
      this.game.createBullet(
        this.position.x,
        this.position.y,
        Math.cos(angle) * 5,
        Math.sin(angle) * 5,
        20,
        'enemy'
      );
    }
    this.game.renderer.setShake(20);
  }

  fireHoming() {
    if (this.game.entities.player && this.game.entities.player.alive) {
      const bullet = this.game.createBullet(
        this.position.x,
        this.position.y + this.size,
        0, 4,
        30,
        'enemy'
      );
      if (bullet) {
        bullet.isHoming = true;
        bullet.target = this.game.entities.player;
      }
    }
  }

  updatePhase() {
    const healthPercent = this.health / this.maxHealth;
    
    if (healthPercent < 0.4 && this.phase === 2) {
      this.phase = 3;
      this.game.renderer.setShake(30);
    } else if (healthPercent < 0.7 && this.phase === 1) {
      this.phase = 2;
      this.weakPoints[1].active = true;
      this.weakPoints[2].active = true;
      this.game.renderer.setShake(25);
    }
  }

  updateCollider() {
    this.collider.x = this.position.x - this.size;
    this.collider.y = this.position.y - this.size;
  }

  takeDamage(damage) {
    if (this.phase === 3) {
      damage *= 2;
    }
    
    this.health -= damage;
    
    if (this.health <= 0) {
      this.health = 0;
      this.die();
    }
  }

  die() {
    this.alive = false;
    this.game.createExplosion(this.position.x, this.position.y, 100);
    this.game.addScore(5000);
    this.game.bossDefeated();
  }

  render(ctx) {
    if (!this.alive) return;
    
    ctx.save();
    ctx.translate(this.position.x, this.position.y);
    
    ctx.fillStyle = '#ff4444';
    ctx.shadowColor = '#ff4444';
    ctx.shadowBlur = 20;
    
    ctx.beginPath();
    ctx.moveTo(0, this.size);
    ctx.lineTo(-this.size, -this.size * 0.3);
    ctx.lineTo(-this.size * 0.5, -this.size);
    ctx.lineTo(this.size * 0.5, -this.size);
    ctx.lineTo(this.size, -this.size * 0.3);
    ctx.closePath();
    ctx.fill();
    
    ctx.fillStyle = '#aa0000';
    ctx.beginPath();
    ctx.moveTo(0, this.size * 0.5);
    ctx.lineTo(-this.size * 0.6, -this.size * 0.2);
    ctx.lineTo(-this.size * 0.3, -this.size * 0.5);
    ctx.lineTo(this.size * 0.3, -this.size * 0.5);
    ctx.lineTo(this.size * 0.6, -this.size * 0.2);
    ctx.closePath();
    ctx.fill();
    
    ctx.fillStyle = '#ff0000';
    ctx.beginPath();
    ctx.arc(0, -this.size * 0.3, this.size * 0.3, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, -this.size * 0.3, this.size * 0.15, 0, Math.PI * 2);
    ctx.fill();
    
    this.weakPoints.forEach(point => {
      if (point.active) {
        ctx.fillStyle = '#00ffff';
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(point.x, point.y, point.radius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(point.x, point.y, point.radius + 3, 0, Math.PI * 2);
        ctx.stroke();
      }
    });
    
    ctx.shadowBlur = 0;
    
    ctx.fillStyle = '#333';
    ctx.fillRect(-this.size * 1.5, -this.size - 25, this.size * 3, 10);
    ctx.fillStyle = '#ff4444';
    ctx.fillRect(-this.size * 1.5, -this.size - 25, this.size * 3 * (this.health / this.maxHealth), 10);
    
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`BOSS Phase ${this.phase}`, 0, -this.size - 30);
    
    ctx.restore();
  }

  reset() {
    this.alive = false;
  }
}