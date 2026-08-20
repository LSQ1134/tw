export class Renderer {
  constructor(game) {
    this.game = game;
    this.ctx = game.ctx;
    this.width = game.width;
    this.height = game.height;
    
    this.stars = [];
    this.initStars();
    
    this.shake = { x: 0, y: 0, duration: 0 };
  }

  initStars() {
    for (let i = 0; i < 200; i++) {
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: Math.random() * 2 + 0.5,
        speed: Math.random() * 2 + 1,
        brightness: Math.random() * 0.5 + 0.5
      });
    }
  }

  render() {
    this.ctx.save();
    
    if (this.shake.duration > 0) {
      this.shake.duration--;
      this.shake.x = (Math.random() - 0.5) * 8;
      this.shake.y = (Math.random() - 0.5) * 8;
      this.ctx.translate(this.shake.x, this.shake.y);
    }
    
    this.renderBackground();
    this.renderEntities();
    this.renderUI();
    
    this.ctx.restore();
  }

  renderBackgroundOnly() {
    this.ctx.save();
    this.renderBackground();
    this.ctx.restore();
  }

  renderBackground() {
    this.ctx.fillStyle = '#0a0a1a';
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    this.stars.forEach(star => {
      star.y += star.speed;
      if (star.y > this.height) {
        star.y = 0;
        star.x = Math.random() * this.width;
      }
      
      this.ctx.fillStyle = `rgba(255, 255, 255, ${star.brightness})`;
      this.ctx.beginPath();
      this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      this.ctx.fill();
    });
  }

  renderEntities() {
    const { player, enemies, bullets, powerUps, particles } = this.game.entities;
    
    if (player && player.alive) {
      player.render(this.ctx);
    }
    
    enemies.forEach(enemy => {
      if (enemy.alive) {
        enemy.render(this.ctx);
      }
    });
    
    bullets.forEach(bullet => {
      if (bullet.alive) {
        bullet.render(this.ctx);
      }
    });
    
    powerUps.forEach(powerUp => {
      if (powerUp.alive) {
        powerUp.render(this.ctx);
      }
    });
    
    particles.forEach(particle => {
      if (particle.alive) {
        particle.render(this.ctx);
      }
    });
  }

  renderUI() {
    const { player } = this.game.entities;
    
    if (player) {
      const healthPercent = (player.health / player.maxHealth) * 100;
      const shieldPercent = (player.shield / player.maxShield) * 100;
      
      const healthBar = document.querySelector('#health-bar .fill');
      const shieldBar = document.querySelector('#shield-bar .fill');
      const healthValue = document.querySelector('#health-bar .value');
      const shieldValue = document.querySelector('#shield-bar .value');
      const weaponValue = document.querySelector('#weapon-display .value');
      const wingmanValue = document.querySelector('#wingman-display .value');
      
      healthBar.style.width = `${healthPercent}%`;
      shieldBar.style.width = `${shieldPercent}%`;
      healthValue.textContent = `${Math.floor(player.health)}/${player.maxHealth}`;
      shieldValue.textContent = `${Math.floor(player.shield)}/${player.maxShield}`;
      weaponValue.textContent = `${player.weapon.name} Lv.${player.weapon.level}`;
      wingmanValue.textContent = player.wingman ? player.wingman.type : '无';
    }
    
    const scoreDisplay = document.getElementById('score-display');
    const timeDisplay = document.getElementById('time-display');
    
    scoreDisplay.textContent = `得分: ${this.game.score}`;
    
    const minutes = Math.floor(this.game.gameTime / 60);
    const seconds = Math.floor(this.game.gameTime % 60);
    timeDisplay.textContent = `时间: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  setShake(duration = 10) {
    this.shake.duration = duration;
  }
}