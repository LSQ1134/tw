export class ShieldSystem {
  constructor(game) {
    this.game = game;
  }

  addShield(player, amount) {
    player.shield = Math.min(player.shield + amount, player.maxShield);
  }

  takeDamage(player, damage) {
    if (player.shield > 0) {
      const shieldDamage = Math.min(player.shield, damage);
      player.shield -= shieldDamage;
      return damage - shieldDamage;
    }
    return damage;
  }

  isActive(player) {
    return player.shield > 0;
  }
}