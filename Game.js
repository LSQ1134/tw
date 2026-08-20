import { GameLoop } from './GameLoop.js';
import { Input } from './Input.js';
import { Renderer } from './Renderer.js';
import { Collision } from './Collision.js';
import { Player } from '../entities/Player.js';
import { Enemy } from '../entities/Enemy.js';
import { Boss } from '../entities/Boss.js';
import { Bullet } from '../entities/Bullet.js';
import { PowerUp } from '../entities/PowerUp.js';
import { Particle } from '../entities/Particle.js';
import { ScoreSystem } from '../systems/ScoreSystem.js';
import { AudioSystem } from '../systems/AudioSystem.js';
import { LevelManager } from '../levels/LevelManager.js';
import { ObjectPool } from '../utils/ObjectPool.js';

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = canvas.width;
    this.height = canvas.height;
    
    this.gameState = 'menu';
    this.score = 0;
    this.gameTime = 0;
    this.hasBoss = false;
    
    this.entities = {
      player: null,
      enemies: [],
      bullets: [],
      powerUps: [],
      particles: []
    };
    
    this.objectPools = {
      bullets: new ObjectPool(() => new Bullet(0, 0, 0, 0, 0, 'player'), 200),
      particles: new ObjectPool(() => new Particle(0, 0, '#ffffff', 1, 1), 300)
    };
    
    this.input = new Input(this);
    this.renderer = new Renderer(this);
    this.scoreSystem = new ScoreSystem(this);
    this.audioSystem = new AudioSystem();
    this.levelManager = new LevelManager(this);
    
    this.gameLoop = new GameLoop(
      (deltaTime) => this.update(deltaTime),
      () => this.render()
    );
    
    this.setupUI();
  }

  setupUI() {
    document.getElementById('start-btn').addEventListener('click', () => this.startGame());
    document.getElementById('high-score-btn').addEventListener('click', () => this.showHighScores());
    document.getElementById('close-score-btn').addEventListener('click', () => this.hideHighScores());
    document.getElementById('resume-btn').addEventListener('click', () => this.resume());
    document.getElementById('quit-btn').addEventListener('click', () => this.returnToMenu());
    document.getElementById('restart-btn').addEventListener('click', () => this.restart());
    document.getElementById('main-menu-btn').addEventListener('click', () => this.returnToMenu());
  }

  start() {
    this.gameLoop.start();
  }

  startGame() {
    this.gameState = 'playing';
    this.score = 0;
    this.gameTime = 0;
    this.hasBoss = false;
    
    this.entities = {
      player: new Player(this.width / 2, this.height - 100, this),
      enemies: [],
      bullets: [],
      powerUps: [],
      particles: []
    };
    
    this.scoreSystem.reset();
    this.levelManager.reset();
    
    this.hideMenu();
    this.hidePause();
    this.hideGameOver();
  }

  update(deltaTime) {
    if (this.gameState !== 'playing') return;
    
    this.gameTime += deltaTime;
    
    if (this.entities.player) {
      this.entities.player.update(deltaTime);
    }
    
    this.entities.enemies.forEach(enemy => {
      if (enemy.alive) {
        enemy.update(deltaTime);
      }
    });
    
    this.entities.bullets.forEach(bullet => {
      if (bullet.alive) {
        bullet.update(deltaTime, this);
      }
    });
    
    this.entities.powerUps.forEach(powerUp => {
      if (powerUp.alive) {
        powerUp.update(deltaTime);
      }
    });
    
    this.entities.particles.forEach(particle => {
      if (particle.alive) {
        particle.update(deltaTime);
      }
    });
    
    this.levelManager.update(deltaTime);
    Collision.checkAll(this);
    
    this.cleanupEntities();
  }

  render() {
    if (this.gameState === 'menu') {
      this.renderer.renderBackgroundOnly();
    } else {
      this.renderer.render();
    }
  }

  cleanupEntities() {
    this.entities.enemies = this.entities.enemies.filter(e => e.alive);
    this.entities.bullets = this.entities.bullets.filter(b => b.alive);
    this.entities.powerUps = this.entities.powerUps.filter(p => p.alive);
    this.entities.particles = this.entities.particles.filter(p => p.alive);
  }

  createBullet(x, y, vx, vy, damage, owner) {
    const bullet = this.objectPools.bullets.get();
    bullet.position.x = x;
    bullet.position.y = y;
    bullet.velocity.x = vx;
    bullet.velocity.y = vy;
    bullet.damage = damage;
    bullet.owner = owner;
    bullet.alive = true;
    
    this.entities.bullets.push(bullet);
    return bullet;
  }

  createEnemy(x, y, type) {
    const enemy = new Enemy(x, y, type, this);
    this.entities.enemies.push(enemy);
    return enemy;
  }

  spawnBoss() {
    const boss = new Boss(this);
    this.entities.enemies.push(boss);
    this.hasBoss = true;
  }

  createPowerUp(x, y, type) {
    const powerUp = new PowerUp(x, y, type);
    this.entities.powerUps.push(powerUp);
    return powerUp;
  }

  createExplosion(x, y, size) {
    const particleCount = Math.floor(size / 2);
    for (let i = 0; i < particleCount; i++) {
      const particle = this.objectPools.particles.get();
      particle.position.x = x;
      particle.position.y = y;
      
      const colors = ['#ff6600', '#ffaa00', '#ffff00', '#ffffff'];
      particle.color = colors[Math.floor(Math.random() * colors.length)];
      particle.speed = Math.random() * 5 + 2;
      particle.life = Math.random() * 0.5 + 0.3;
      particle.maxLife = particle.life;
      particle.alive = true;
      
      this.entities.particles.push(particle);
    }
    
    this.audioSystem.playExplosion();
    this.renderer.setShake(10);
  }

  addScore(points) {
    this.score += points;
    this.scoreSystem.addScore(points);
  }

  clearEnemies() {
    this.entities.enemies.forEach(enemy => {
      if (enemy.alive && !(enemy instanceof Boss)) {
        enemy.die();
      }
    });
    
    this.entities.bullets.forEach(bullet => {
      if (bullet.owner === 'enemy') {
        bullet.destroy();
      }
    });
    
    this.createExplosion(this.width / 2, this.height / 2, 200);
  }

  bossDefeated() {
    this.hasBoss = false;
    this.levelManager.bossDefeated();
  }

  pause() {
    this.gameState = 'paused';
    this.showPause();
  }

  resume() {
    this.gameState = 'playing';
    this.hidePause();
  }

  gameOver() {
    this.gameState = 'gameover';
    
    if (this.scoreSystem.isHighScore()) {
      this.scoreSystem.saveHighScore();
    }
    
    document.getElementById('final-score').textContent = `最终得分: ${this.score}`;
    this.showGameOver();
  }

  restart() {
    this.startGame();
  }

  returnToMenu() {
    this.gameState = 'menu';
    this.showMenu();
    this.hidePause();
    this.hideGameOver();
  }

  showHighScores() {
    const list = document.getElementById('score-list');
    list.innerHTML = '';
    
    this.scoreSystem.getHighScores().forEach((score, index) => {
      const div = document.createElement('div');
      div.textContent = `${index + 1}. ${score.score}分`;
      list.appendChild(div);
    });
    
    document.getElementById('high-score-screen').style.display = 'flex';
  }

  hideHighScores() {
    document.getElementById('high-score-screen').style.display = 'none';
  }

  showMenu() {
    document.getElementById('menu-screen').style.display = 'flex';
  }

  hideMenu() {
    document.getElementById('menu-screen').style.display = 'none';
  }

  showPause() {
    document.getElementById('pause-screen').style.display = 'flex';
  }

  hidePause() {
    document.getElementById('pause-screen').style.display = 'none';
  }

  showGameOver() {
    document.getElementById('game-over-screen').style.display = 'flex';
  }

  hideGameOver() {
    document.getElementById('game-over-screen').style.display = 'none';
  }
}