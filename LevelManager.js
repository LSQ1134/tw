export class LevelManager {
  constructor(game) {
    this.game = game;
    this.level = 1;
    this.gameTime = 0;
    this.spawnTimer = 0;
    this.spawnInterval = 2;
    this.bossSpawned = false;
    this.bossWarningShown = false;
  }

  update(deltaTime) {
    this.gameTime += deltaTime;
    this.updateDifficulty();
    
    if (!this.game.hasBoss) {
      this.spawnTimer += deltaTime;
      if (this.spawnTimer >= this.spawnInterval) {
        this.spawnEnemy();
        this.spawnTimer = 0;
      }
    }
    
    this.checkBossSpawn();
  }

  updateDifficulty() {
    const time = this.gameTime;
    
    if (time < 30) {
      this.spawnInterval = 2;
    } else if (time < 60) {
      this.spawnInterval = 1.5;
    } else if (time < 90) {
      this.spawnInterval = 1.2;
    } else if (time < 120) {
      this.spawnInterval = 1;
    } else if (time < 180) {
      this.spawnInterval = 0.8;
    } else {
      this.spawnInterval = 0.6;
    }
  }

  spawnEnemy() {
    const time = this.gameTime;
    let types = ['scout'];
    
    if (time > 20) {
      types.push('fighter');
    }
    if (time > 30) {
      types.push('interceptor');
    }
    if (time > 40) {
      types.push('bomber');
    }
    if (time > 60 && Math.random() < 0.1) {
      types.push('elite');
    }
    if (time > 150 && Math.random() < 0.05) {
      types.push('commander');
    }
    
    const type = types[Math.floor(Math.random() * types.length)];
    const x = Math.random() * (this.game.width - 100) + 50;
    
    this.game.createEnemy(x, -50, type);
  }

  checkBossSpawn() {
    if (!this.bossSpawned && this.gameTime >= 180) {
      if (!this.bossWarningShown) {
        this.showBossWarning();
        this.bossWarningShown = true;
      }
    }
  }

  showBossWarning() {
    const warning = document.getElementById('boss-warning');
    warning.style.display = 'block';
    
    this.game.audioSystem.playBossWarning();
    
    setTimeout(() => {
      warning.style.display = 'none';
      this.game.spawnBoss();
      this.bossSpawned = true;
    }, 3000);
  }

  bossDefeated() {
    this.bossSpawned = false;
    this.bossWarningShown = false;
    this.level++;
    this.spawnInterval = 0.5;
    
    setTimeout(() => {
      this.gameTime = 0;
    }, 1000);
  }

  reset() {
    this.level = 1;
    this.gameTime = 0;
    this.spawnTimer = 0;
    this.spawnInterval = 2;
    this.bossSpawned = false;
    this.bossWarningShown = false;
  }
}