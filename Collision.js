export class Collision {
  static checkAABB(rect1, rect2) {
    return (
      rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.y + rect1.height > rect2.y
    );
  }

  static checkCircle(circle1, circle2) {
    const dx = circle1.x - circle2.x;
    const dy = circle1.y - circle2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < circle1.radius + circle2.radius;
  }

  static checkAll(game) {
    const { player, enemies, bullets, powerUps } = game.entities;
    
    if (!player || !player.alive) return;
    
    bullets.forEach(bullet => {
      if (!bullet.alive) return;
      
      if (bullet.owner !== 'player') {
        if (this.checkAABB(player.collider, bullet.collider)) {
          if (this.checkCircle(player, bullet)) {
            player.takeDamage(bullet.damage);
            bullet.destroy();
            game.renderer.setShake(15);
          }
        }
      } else {
        enemies.forEach(enemy => {
          if (!enemy.alive) return;
          
          if (this.checkAABB(enemy.collider, bullet.collider)) {
            if (this.checkCircle(enemy, bullet)) {
              enemy.takeDamage(bullet.damage);
              bullet.destroy();
            }
          }
        });
      }
    });
    
    enemies.forEach(enemy => {
      if (!enemy.alive) return;
      
      if (this.checkAABB(player.collider, enemy.collider)) {
        if (this.checkCircle(player, enemy)) {
          player.takeDamage(enemy.collisionDamage);
          game.renderer.setShake(20);
        }
      }
    });
    
    powerUps.forEach(powerUp => {
      if (!powerUp.alive) return;
      
      if (this.checkAABB(player.collider, powerUp.collider)) {
        if (this.checkCircle(player, powerUp)) {
          powerUp.applyEffect(player, game);
          powerUp.destroy();
        }
      }
    });
  }
}