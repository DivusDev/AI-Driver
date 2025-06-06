const maxVisionDistance = 150;

class Car {
  constructor(x, y, showVisionLines) {
    this.x = x;
    this.y = y;
    this.velx = 0;
    this.vely = 0;
    this.speed = 0;
    this.rotate = 0;
    this.width = 30;
    this.height = 20;
    this.VMax = 5;
    this.showVisionLines = showVisionLines;

    this.collisionDistances = [];
    this.collisionRays = [
      { rotation: -QUARTER_PI - HALF_PI, maxVisionDistance },
      { rotation: -QUARTER_PI, maxVisionDistance },
      { rotation: -QUARTER_PI / 2, maxVisionDistance: maxVisionDistance * 2 },
      { rotation: 0, maxVisionDistance: maxVisionDistance * 2 },
      { rotation: QUARTER_PI, maxVisionDistance },
      { rotation: QUARTER_PI / 2, maxVisionDistance: maxVisionDistance * 2 },
      { rotation: QUARTER_PI + HALF_PI, maxVisionDistance },
      { rotation: PI, maxVisionDistance },
    ];
  }

  showV2() {
    stroke(0);
    push();
    // move canvas to car position
    translate(this.x, this.y);
    rotate(this.rotate);
    // draw car
    rect(this.width / -2, this.height / -2, this.width, this.height);

    // draw vision
    if (this.showVisionLines) {
      fill("black");
      for (let index in this.collisionRays) {
        let rayDetail = this.collisionRays[index];
        let currentCollisionDistance =
          this.collisionDistances[index] ?? rayDetail.maxVisionDistance;
        let collisionXComponent = cos(rayDetail.rotation);
        let collisionYComponent = sin(rayDetail.rotation);
        line(
          0,
          0,
          collisionXComponent * rayDetail.maxVisionDistance,
          collisionYComponent * rayDetail.maxVisionDistance
        );
        rect(
          collisionXComponent * currentCollisionDistance - 2.5,
          collisionYComponent * currentCollisionDistance - 2.5,
          5,
          5
        );
      }
    }
    pop();
  }

  driveV2() {
    this.x += this.speed * cos(this.rotate);
    this.y += this.speed * sin(this.rotate);
  }

  accelerateV2(acceleration, rotation) {
    if (acceleration > 0) {
      const accelFactor = this.logisticResponse(acceleration);
      const accel = acceleration * accelFactor;
      this.speed += accel;
      this.speed = Math.min(this.speed, this.VMax);
    } else if (acceleration < 0) {
      this.speed += acceleration * 0.4;
      if (this.speed < 0) {
        this.speed = Math.max(this.speed, -1);
      }
    }
    this.rotate = this.rotate + rotation * 0.1;
  }

  logisticResponse(v) {
    // This returns a diminishing acceleration factor as speed increases
    return 1 / (1 + Math.exp((-10 * this.VMax) / 2 - v));
    // inflection around Vmax/2
  }

  /**
   * Computes cars vision against the track
   * @param {Track} track
   */
  see(track, carTrackIndex) {
    let collisionDistances = [null, null, null, null];
    let trackLength = track.trackValues.length;
    for (let i = -1; i < 3; i++) {
      const currTrack =
        track.trackValues[(carTrackIndex + i + trackLength) % trackLength];
      const trackVision = this.checkVisionAgainstTrackPiece(currTrack);
      for (let i in trackVision) {
        if (collisionDistances[i] == null) {
          collisionDistances[i] = trackVision[i];
        }
      }
    }
    this.collisionDistances = collisionDistances;
  }

  /**
   * Computes collision distances against all vision rays, returning null if no collision found
   *
   * @param {TrackPiece} trackPiece
   * @returns {[?Number]}
   */
  checkVisionAgainstTrackPiece(trackPiece) {
    const visionRaysToCheck = this.collisionRays.map((r) => ({
      x1: this.x,
      y1: this.y,
      x2: this.x + cos(this.rotate + r.rotation) * r.maxVisionDistance,
      y2: this.y + sin(this.rotate + r.rotation) * r.maxVisionDistance,
    }));
    let collisionDistances = visionRaysToCheck.map(
      (ray) =>
        trackPiece.walls
          .map((side) =>
            this.intersectionLength(
              ray.x1,
              ray.y1,
              ray.x2,
              ray.y2,
              side.x1,
              side.y1,
              side.x2,
              side.y2
            )
          )
          .find((a) => a != null) ?? null
    );

    return collisionDistances;
  }

  intersectionLength(ax1, ay1, ax2, ay2, bx1, by1, bx2, by2) {
    const dx1 = ax1 - ax2;
    const dy1 = ay1 - ay2;
    const dx2 = bx1 - bx2;
    const dy2 = by1 - by2;

    const denominator = dx1 * dy2 - dy1 * dx2;
    if (denominator === 0) return null; // parallel lines

    const s = ((ax1 - bx1) * dy2 - (ay1 - by1) * dx2) / denominator;
    const t = ((ax1 - bx1) * dy1 - (ay1 - by1) * dx1) / denominator;

    if (s < 0 || s > 1 || t < 0 || t > 1) {
      return null;
    }

    const ix = ax1 + s * dx1;
    const iy = ay1 + s * dy1;
    return Math.hypot(ix - ax1, iy - ay1);
  }
}
