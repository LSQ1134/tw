import { Vector2 } from '../utils/Vector2.js';

const POWER_UP_TYPES = {
  weapon: {
    name: '武器升级',
    color: '#ffff00',
    glowColor: '#ffff00',
    symbol: 'W',
    apply: (player, game) => {
      player.upgradeWeapon();
      game.addScore(100);
    }
  },
  shield: {
    name: '护盾',
    color: '#4488ff',
    glowColor: '#4488ff',
    symbol: 'S',
    apply: (player, game) => {
      player.addShield(50);
      game.addScore(50);
    }
  },
  health: {
    name: '生命恢复',
    color: '#00ff00',
    glowColor: '#00ff00',
    symbol: '+',
    apply: (player, game) => {
      player.addHealth(30);
      game.addScore(50);
    }
  },
  wingman: {
    name: '僚机',
    color: '#aa00ff',
    glowColor: '#aa00ff',
    symbol: 'L',
    apply: (player, game) => {
      player.addWingman('攻击型');
      game.addScore(200);
    }
  },
  speed: {
    name: '加速',
    color: '#ff4400',
    glowColor: '#ff4400',
    symbol: '⚡',
    apply: (player, game) => {
      player.speed = 9;
      setTimeout(() => { player.speed = 6; }, 10000);
      game.addScore(50);
    }
  },
  invincible: {
    name: '无敌',
    color: '#ffd700',
    glowColor: '#ffd700',
    symbol: '★',
    apply: (player, game) => {
      player.invincible = true;
      player.invincibleTime = 5;
      game.addScore(100);
    }
  },
  bomb: {
    name: '炸弹',
    color: '#ff6600',
    glowColor: '#ff6600',
    symbol: '✸',
    apply: (player, game) => {
      game.clearEnemies();
      game.addScore(500);
    }
  }
};

export class PowerUp {
  constructor(x, y, type = null) {
    this.position = new Vector2(x, y);
    this.type = type || this.getRandomType();
    this.config = POWER_UP_TYPES[this.type];
    
    this.size = 20;
    this.radius = 12;
    this.speed = 2;
    
    this.alive = true;
    this.bobOffset = Math.random() * Math.PI * 2;
    this.bobSpeed = 2;
    
    this.collider = {
      x: this.position.x - this.size,
      y: this.position.y - this.size,
      width: this.size * 2,
      height: this.size * 2
    };
  }

  getRandomType() {
    const types = ['weapon', 'shield', 'health', 'wingman', 'speed', 'invincible', 'bomb'];
    const weights = [30, 25, 20, 10, 8, 5, 2];
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let random = Math.random() * totalWeight;
    
    for (let i = 0; i < types.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        return types[i];
      }
    }
    return 'weapon';
  }

  update(deltaTime) {
    if (!this.alive) return;
    
    this.position.y += this.speed;
    this.bobOffset += this.bobSpeed * deltaTime;
    
    this.updateCollider();
    
    if (this.position.y > 750) {
      this.alive = false;
    }
  }

  updateCollider() {
    this.collider.x = this.position.x - this.size;
    this.collider.y = this.position.y - this.size;
  }

  applyEffect(player, game) {
    if (this.config.apply) {
      this.config.apply(player, game);
    }
  }

  destroy() {
    this.alive = false;
  }

  render(ctx) {
    if (!this.alive) return;
    
    ctx.save();
    
    const bobY = Math.sin(this.bobOffset) * 5;
    ctx.translate(this.position.x, this.position.y + bobY);
    
    ctx.fillStyle = this.config.color;
    ctx.shadowColor = this.config.glowColor;
    ctx.shadowBlur = 15;
    
    ctx.beginPath();
    ctx.arc(0, 0, this.size, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 5;
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.config.symbol, 0, 0);
    
    ctx.restore();
  }

  reset() {
    this.alive = false;
  }
}