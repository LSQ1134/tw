export class Input {
  constructor(game) {
    this.game = game;
    this.keys = {};
    this.mouse = { x: 0, y: 0, left: false };
    this.touch = { x: 0, y: 0, active: false };
    
    this.setupEventListeners();
  }

  setupEventListeners() {
    document.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
      
      if (e.code === 'Space') {
        e.preventDefault();
      }
      if (e.code === 'Escape') {
        this.handleEscape();
      }
    });

    document.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });

    const canvas = this.game.canvas;
    
    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      this.mouse.x = (e.clientX - rect.left) * scaleX;
      this.mouse.y = (e.clientY - rect.top) * scaleY;
    });

    canvas.addEventListener('mousedown', (e) => {
      if (e.button === 0) {
        this.mouse.left = true;
      }
    });

    canvas.addEventListener('mouseup', (e) => {
      if (e.button === 0) {
        this.mouse.left = false;
      }
    });

    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const touch = e.touches[0];
      this.touch.x = (touch.clientX - rect.left) * scaleX;
      this.touch.y = (touch.clientY - rect.top) * scaleY;
      this.touch.active = true;
    });

    canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const touch = e.touches[0];
      this.touch.x = (touch.clientX - rect.left) * scaleX;
      this.touch.y = (touch.clientY - rect.top) * scaleY;
    });

    canvas.addEventListener('touchend', () => {
      this.touch.active = false;
    });
  }

  handleEscape() {
    if (this.game.gameState === 'playing') {
      this.game.pause();
    } else if (this.game.gameState === 'paused') {
      this.game.resume();
    }
  }

  isKeyPressed(key) {
    return this.keys[key] || false;
  }

  update() {}
}