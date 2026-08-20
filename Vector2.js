export class Vector2 {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  add(v) {
    this.x += v.x;
    this.y += v.y;
    return this;
  }

  subtract(v) {
    this.x -= v.x;
    this.y -= v.y;
    return this;
  }

  multiply(scalar) {
    this.x *= scalar;
    this.y *= scalar;
    return this;
  }

  divide(scalar) {
    this.x /= scalar;
    this.y /= scalar;
    return this;
  }

  dot(v) {
    return this.x * v.x + this.y * v.y;
  }

  cross(v) {
    return this.x * v.y - this.y * v.x;
  }

  get length() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  normalize() {
    const len = this.length;
    if (len > 0) {
      this.divide(len);
    }
    return this;
  }

  distance(v) {
    const dx = this.x - v.x;
    const dy = this.y - v.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  clone() {
    return new Vector2(this.x, this.y);
  }

  static add(v1, v2) {
    return new Vector2(v1.x + v2.x, v1.y + v2.y);
  }

  static subtract(v1, v2) {
    return new Vector2(v1.x - v2.x, v1.y - v2.y);
  }

  static multiply(v, scalar) {
    return new Vector2(v.x * scalar, v.y * scalar);
  }

  static divide(v, scalar) {
    return new Vector2(v.x / scalar, v.y / scalar);
  }
}