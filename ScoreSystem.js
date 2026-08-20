export class ScoreSystem {
  constructor(game) {
    this.game = game;
    this.score = 0;
    this.highScores = this.loadHighScores();
  }

  addScore(points) {
    this.score += points;
  }

  reset() {
    this.score = 0;
  }

  saveHighScore() {
    this.highScores.push({
      score: this.score,
      date: new Date().toISOString()
    });
    
    this.highScores.sort((a, b) => b.score - a.score);
    this.highScores = this.highScores.slice(0, 10);
    
    localStorage.setItem('starFighterHighScores', JSON.stringify(this.highScores));
  }

  loadHighScores() {
    const saved = localStorage.getItem('starFighterHighScores');
    return saved ? JSON.parse(saved) : [
      { score: 10000, date: '2024-01-01' },
      { score: 5000, date: '2024-01-01' },
      { score: 2000, date: '2024-01-01' }
    ];
  }

  getHighScores() {
    return this.highScores;
  }

  isHighScore() {
    if (this.highScores.length < 10) return true;
    return this.score > this.highScores[this.highScores.length - 1].score;
  }
}