import { Vector2 } from '../utils/Vector2.js';

export class Player {
  constructor(x, y, game) {
    this.game = game;
    this.position = new Vector2(x, y);
    this.size = 25;
    this.radius = 15;
    
    this.maxHealth = 100;
    this.health = this.maxHealth;
    this.maxShield = 100;
    this.shield = 0;
    
    this.speed = 6;
    this.invincible = false;
    this.invincibleTime = 0;
    
    this.weapon = {
      name: '激光',
      level: 1,
      damage: 10,
      fireRate: 0.1,
      bulletCount: 1,
      spread: 0
    };
    
    this.lastFireTime = 0;
    this.wingman = null;
    
    this.alive = true;
    this.flash = 0;
    
    this.collider = {
      x: this.position.x - this.size,
      y: this.position.y - this.size,
      width: this.size * 2,
      height: this.size * 2
    };
  }

  update(deltaTime) {
    if (!this.alive) return;
    
    this.handleMovement();
    this.handleFiring(deltaTime);
    this.updateInvincible(deltaTime);
    this.updateCollider();
    
    if (this.wingman) {
      this.wingman.update(deltaTime, this);
    }
  }

  handleMovement() {
    const input = this.game.input;
    const speed = this.speed;
    
    if (input.isKeyPressed('ArrowUp') || input.isKeyPressed('KeyW')) {
      this.position.y -= speed;
    }
    if (input.isKeyPressed('ArrowDown') || input.isKeyPressed('KeyS')) {
      this.position.y += speed;
    }
    if (input.isKeyPressed('ArrowLeft') || input.isKeyPressed('KeyA')) {
      this.position.x -= speed;
    }
    if (input.isKeyPressed('ArrowRight') || input.isKeyPressed('KeyD')) {
      this.position.x += speed;
    }
    
    const targetX = input.touch.active ? input.touch.x : input.mouse.x;
    const targetY = input.touch.active ? input.touch.y : input.mouse.y;
    
    const dx = targetX - this.position.x;
    const dy = targetY - this.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > 5) {
      this.position.x += (dx / distance) * speed;
      this.position.y += (dy / distance) * speed;
    }
    
    this.position.x = Math.max(this.size, Math.min(this.game.width - this.size, this.position.x));
    this.position.y = Math.max(this.size, Math.min(this.game.height - this.size, this.position.y));
  }

  handleFiring(deltaTime) {
    const input = this.game.input;
    
    if (input.isKeyPressed('Space') || input.mouse.left || input.touch.active) {
      this.lastFireTime += deltaTime;
      
      if (this.lastFireTime >= this.weapon.fireRate) {
        this.fire();
        this.lastFireTime = 0;
      }
    }
  }

  fire() {
    const centerX = this.position.x;
    const topY = this.position.y - this.size;
    
    if (this.weapon.bulletCount === 1) {
      this.game.createBullet(centerX, topY, 0, -10, this.weapon.damage, 'player');
    } else if (this.weapon.bulletCount === 2) {
      this.game.createBullet(centerX - 8, topY, 0, -10, this.weapon.damage, 'player');
      this.game.createBullet(centerX + 8, topY, 0, -10, this.weapon.damage, 'player');
    } else if (this.weapon.bulletCount >= 5) {
      for (let i = -2; i <= 2; i++) {
        this.game.createBullet(centerX + i * 10, topY, i * 0.5, -10, this.weapon.damage, 'player');
      }
    }
    
    if (this.wingman && this.wingman.type === '攻击型') {
      this.wingman.fire();
    }
  }

  updateInvincible(deltaTime) {
    if (this.invincible) {
      this.invincibleTime -= deltaTime;
      this.flash = Math.sin(this.invincibleTime * 20) * 0.5 + 0.5;
      
      if (this.invincibleTime <= 0) {
        this.invincible = false;
        this.flash = 0;
      }
    }
  }

  updateCollider() {
    this.collider.x = this.position.x - this.size;
    this.collider.y = this.position.y - this.size;
  }

  takeDamage(damage) {
    if (this.invincible) return;
    
    if (this.shield > 0) {
      const shieldDamage = Math.min(this.shield, damage);
      this.shield -= shieldDamage;
      damage -= shieldDamage;
    }
    
    this.health -= damage;
    this.invincible = true;
    this.invincibleTime = 1.5;
    
    if (this.health <= 0) {
      this.health = 0;
      this.die();
    }
  }

  die() {
    this.alive = false;
    this.game.createExplosion(this.position.x, this.position.y, 50);
    this.game.gameOver();
  }

  addHealth(amount) {
    this.health = Math.min(this.health + amount, this.maxHealth);
  }

  addShield(amount) {
    this.shield = Math.min(this.shield + amount, this.maxShield);
  }

  upgradeWeapon() {
    if (this.weapon.level < 5) {
      this.weapon.level++;
      
      if (this.weapon.level === 2) {
        this.weapon.name = '双连发';
        this.weapon.bulletCount = 2;
        this.weapon.fireRate = 0.07;
      } else if (this.weapon.level === 3) {
        this.weapon.name = '散射炮';
        this.weapon.bulletCount = 5;
        this.weapon.fireRate = 0.12;
      } else if (this.weapon.level === 4) {
        this.weapon.name = '追踪导弹';
        this.weapon.bulletCount = 1;
        this.weapon.damage = 25;
        this.weapon.fireRate = 0.5;
      } else if (this.weapon.level === 5) {
        this.weapon.name = '蓄力炮';
        this.weapon.damage = 100;
        this.weapon.fireRate = 1.0;
      }
    }
  }

  addWingman(type) {
    if (!this.wingman) {
      this.wingman = {
        type: type,
        level: 1,
        fireRate: 0.3,
        lastFireTime: 0,
        update: (deltaTime, player) => {
          if (this.type === '攻击型') {
            this.lastFireTime += deltaTime;
            if (this.lastFireTime >= this.fireRate) {
              this.fire();
              this.lastFireTime = 0;
            }
          } else if (this.type === '支援型') {
            if (player.health < player.maxHealth && Math.random() < 0.01) {
              player.addHealth(1);
            }
          }
        },
        fire: () => {
          this.game.createBullet(
            this.type === '攻击型' ? this.game.entities.player.position.x - 30 : this.game.entities.player.position.x + 30,
            this.game.entities.player.position.y,
            0, -8, 15, 'player'
          );
        }
      };
    }
  }

  render(ctx) {
    if (!this.alive) return;
    
    ctx.save();
    
    if (this.flash > 0.5) {
      ctx.globalAlpha = 0.5;
    }
    
    ctx.translate(this.position.x, this.position.y);
    
    ctx.fillStyle = '#00ffff';
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 15;
    
    ctx.beginPath();
    ctx.moveTo(0, -this.size);
    ctx.lineTo(-this.size * 0.7, this.size * 0.7);
    ctx.lineTo(-this.size * 0.3, this.size * 0.4);
    ctx.lineTo(this.size * 0.3, this.size * 0.4);
    ctx.lineTo(this.size * 0.7, this.size * 0.7);
    ctx.closePath();
    ctx.fill();
    
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.shadowBlur = 0;
    
    ctx.fillStyle = '#0066ff';
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(-3 + i * 3, this.size * 0.5);
      ctx.lineTo(-5 + i * 3, this.size * 0.9 + Math.random() * 5);
      ctx.lineTo(2 + i * 3, this.size * 0.5);
      ctx.closePath();
      ctx.fill();
    }
    
    if (this.shield > 0) {
      ctx.strokeStyle = `rgba(68, 136, 255, ${0.3 + (this.shield / this.maxShield) * 0.5})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, this.size + 10, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    ctx.restore();
  }

  reset() {
    this.health = this.maxHealth;
    this.shield = 0;
    this.weapon = {
      name: '激光',
      level: 1,
      damage: 10,
      fireRate: 0.1,
      bulletCount: 1,
      spread: 0
    };
    this.wingman = null;
    this.alive = true;
    this.invincible = false;
  }
}