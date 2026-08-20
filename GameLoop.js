export class GameLoop {
  constructor(update, render) {
    this.update = update;
    this.render = render;
    this.lastTime = 0;
    this.deltaTime = 0;
    this.targetFPS = 60;
    this.frameInterval = 1000 / this.targetFPS;
    this.running = false;
  }

  start() {
    this.running = true;
    this.lastTime = performance.now();
    this.loop();
  }

  stop() {
    this.running = false;
  }

  loop() {
    if (!this.running) return;
    
    const currentTime = performance.now();
    this.deltaTime = currentTime - this.lastTime;
    
    if (this.deltaTime >= this.frameInterval) {
      this.update(this.deltaTime / 1000);
      this.render();
      this.lastTime = currentTime;
    }
    
    requestAnimationFrame(() => this.loop());
  }
}