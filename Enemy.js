import { Vector2 } from '../utils/Vector2.js';

const ENEMY_TYPES = {
  scout: {
    name: '侦察机',
    health: 30,
    speed: 3,
    damage: 10,
    size: 18,
    color: '#ff6666',
    fireRate: 2,
    pattern: 'straight'
  },
  fighter: {
    name: '战斗机',
    health: 60,
    speed: 2.5,
    damage: 15,
    size: 22,
    color: '#ff8800',
    fireRate: 1.5,
    pattern: 'snake'
  },
  bomber: {
    name: '轰炸机',
    health: 80,
    speed: 2,
    damage: 20,
    size: 28,
    color: '#aa44ff',
    fireRate: 3,
    pattern: 'straight',
    suicide: true
  },
  interceptor: {
    name: '拦截机',
    health: 40,
    speed: 4,
    damage: 12,
    size: 16,
    color: '#ffaa00',
    fireRate: 1,
    pattern: 'side'
  },
  elite: {
    name: '精英战机',
    health: 150,
    speed: 3,
    damage: 25,
    size: 30,
    color: '#ff00ff',
    fireRate: 0.8,
    pattern: 'scatter'
  },
  commander: {
    name: '指挥官机',
    health: 200,
    speed: 2.5,
    damage: 30,
    size: 35,
    color: '#ffffff',
    fireRate: 0.5,
    pattern: 'homing'
  }
};

export class Enemy {
  constructor(x, y, type, game) {
    this.game = game;
    this.type = type;
    this.config = ENEMY_TYPES[type] || ENEMY_TYPES.scout;
    
    this.position = new Vector2(x, y);
    this.size = this.config.size;
    this.radius = this.size * 0.6;
    
    this.maxHealth = this.config.health;
    this.health = this.maxHealth;
    this.speed = this.config.speed;
    this.damage = this.config.damage;
    this.collisionDamage = this.config.damage * 2;
    
    this.fireRate = this.config.fireRate;
    this.lastFireTime = Math.random() * this.fireRate;
    
    this.alive = true;
    this.patternData = {
      startTime: 0,
      startX: x,
      phase: 0
    };
    
    this.collider = {
      x: this.position.x - this.size,
      y: this.position.y - this.size,
      width: this.size * 2,
      height: this.size * 2
    };
  }

  update(deltaTime) {
    if (!this.alive) return;
    
    this.patternData.startTime += deltaTime;
    this.move(deltaTime);
    this.fire(deltaTime);
    this.updateCollider();
    
    if (this.position.y > 750) {
      this.alive = false;
      if (this.config.suicide) {
        this.game.createExplosion(this.position.x, this.position.y, 40);
      }
    }
  }

  move(deltaTime) {
    switch (this.config.pattern) {
      case 'straight':
        this.position.y += this.speed;
        break;
        
      case 'snake':
        this.position.y += this.speed;
        this.position.x = this.patternData.startX + Math.sin(this.patternData.startTime * 3) * 50;
        break;
        
      case 'side':
        this.position.y += this.speed * 0.5;
        this.position.x += this.speed * (this.position.x < 240 ? 1 : -1);
        break;
        
      case 'scatter':
        this.position.y += this.speed;
        this.position.x = this.patternData.startX + Math.sin(this.patternData.startTime * 2) * 80;
        break;
        
      case 'homing':
        this.position.y += this.speed;
        if (this.game.entities.player && this.game.entities.player.alive) {
          const dx = this.game.entities.player.position.x - this.position.x;
          this.position.x += dx * 0.02;
        }
        break;
    }
    
    this.position.x = Math.max(this.size, Math.min(this.game.width - this.size, this.position.x));
  }

  fire(deltaTime) {
    this.lastFireTime += deltaTime;
    
    if (this.lastFireTime >= this.fireRate) {
      if (this.config.pattern === 'scatter') {
        for (let i = -2; i <= 2; i++) {
          this.game.createBullet(
            this.position.x,
            this.position.y + this.size,
            i * 2, 5,
            this.damage,
            'enemy'
          );
        }
      } else if (this.config.pattern === 'homing') {
        const bullet = this.game.createBullet(
          this.position.x,
          this.position.y + this.size,
          0, 6,
          this.damage + 10,
          'enemy'
        );
        if (bullet) {
          bullet.isHoming = true;
          bullet.target = this.game.entities.player;
        }
      } else {
        this.game.createBullet(
          this.position.x,
          this.position.y + this.size,
          0, 5,
          this.damage,
          'enemy'
        );
      }
      
      this.lastFireTime = 0;
    }
  }

  updateCollider() {
    this.collider.x = this.position.x - this.size;
    this.collider.y = this.position.y - this.size;
  }

  takeDamage(damage) {
    this.health -= damage;
    
    if (this.health <= 0) {
      this.health = 0;
      this.die();
    }
  }

  die() {
    this.alive = false;
    this.game.createExplosion(this.position.x, this.position.y, this.size * 2);
    this.game.addScore(this.config.health * 10);
    
    if (Math.random() < 0.2) {
      this.game.createPowerUp(this.position.x, this.position.y);
    }
  }

  render(ctx) {
    if (!this.alive) return;
    
    ctx.save();
    ctx.translate(this.position.x, this.position.y);
    
    ctx.fillStyle = this.config.color;
    ctx.shadowColor = this.config.color;
    ctx.shadowBlur = 10;
    
    ctx.beginPath();
    ctx.moveTo(0, this.size);
    ctx.lineTo(-this.size * 0.7, -this.size * 0.7);
    ctx.lineTo(-this.size * 0.3, -this.size * 0.4);
    ctx.lineTo(this.size * 0.3, -this.size * 0.4);
    ctx.lineTo(this.size * 0.7, -this.size * 0.7);
    ctx.closePath();
    ctx.fill();
    
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(0, 0, this.size * 0.4, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, -this.size * 0.3, this.size * 0.2, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.shadowBlur = 0;
    
    if (this.health < this.maxHealth) {
      ctx.fillStyle = '#333';
      ctx.fillRect(-this.size, -this.size - 10, this.size * 2, 4);
      ctx.fillStyle = '#ff4444';
      ctx.fillRect(-this.size, -this.size - 10, this.size * 2 * (this.health / this.maxHealth), 4);
    }
    
    ctx.restore();
  }

  reset() {
    this.alive = false;
  }
}