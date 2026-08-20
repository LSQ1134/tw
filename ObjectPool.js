export class ObjectPool {
  constructor(createFn, maxSize = 100) {
    this.createFn = createFn;
    this.maxSize = maxSize;
    this.pool = [];
  }

  get() {
    if (this.pool.length > 0) {
      return this.pool.pop();
    }
    return this.createFn();
  }

  release(obj) {
    if (this.pool.length < this.maxSize) {
      obj.reset();
      this.pool.push(obj);
    }
  }

  clear() {
    this.pool = [];
  }
}