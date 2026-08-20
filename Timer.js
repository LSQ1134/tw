export class Timer {
  constructor(duration, callback, autoStart = false) {
    this.duration = duration;
    this.callback = callback;
    this.currentTime = 0;
    this.running = false;
    this.looping = false;
    if (autoStart) {
      this.start();
    }
  }

  start() {
    this.currentTime = 0;
    this.running = true;
  }

  stop() {
    this.running = false;
  }

  reset() {
    this.currentTime = 0;
    this.running = false;
  }

  update(deltaTime) {
    if (!this.running) return;
    
    this.currentTime += deltaTime;
    
    if (this.currentTime >= this.duration) {
      if (this.callback) {
        this.callback();
      }
      
      if (this.looping) {
        this.currentTime -= this.duration;
      } else {
        this.running = false;
      }
    }
  }

  get progress() {
    return Math.min(this.currentTime / this.duration, 1);
  }

  get remaining() {
    return Math.max(this.duration - this.currentTime, 0);
  }
}