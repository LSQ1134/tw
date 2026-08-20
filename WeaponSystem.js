export class WeaponSystem {
  constructor(game) {
    this.game = game;
    this.weapons = {
      laser: {
        name: '激光',
        level: 1,
        damage: 10,
        fireRate: 0.1,
        bulletCount: 1,
        spread: 0
      },
      double: {
        name: '双连发',
        level: 2,
        damage: 8,
        fireRate: 0.07,
        bulletCount: 2,
        spread: 0
      },
      scatter: {
        name: '散射炮',
        level: 3,
        damage: 6,
        fireRate: 0.12,
        bulletCount: 5,
        spread: 10
      },
      missile: {
        name: '追踪导弹',
        level: 4,
        damage: 25,
        fireRate: 0.5,
        bulletCount: 1,
        spread: 0,
        homing: true
      },
      charge: {
        name: '蓄力炮',
        level: 5,
        damage: 100,
        fireRate: 1.0,
        bulletCount: 1,
        spread: 0,
        charge: true
      }
    };
  }

  getWeaponByLevel(level) {
    const levels = [null, 'laser', 'double', 'scatter', 'missile', 'charge'];
    return this.weapons[levels[level]] || this.weapons.laser;
  }

  upgradeWeapon(player) {
    if (player.weapon.level < 5) {
      player.weapon.level++;
      const weaponConfig = this.getWeaponByLevel(player.weapon.level);
      Object.assign(player.weapon, weaponConfig);
    }
  }
}