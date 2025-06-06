class TrackPiece {
  //  (x1, y1)────────────(x2, y1)
  //     │                    │
  //     │                    │
  //     │                    │
  //  (x1, y2)────────────(x2, y2)

  constructor(x1, y1, x2, y2, sideTypes) {
    this.x1 = x1;
    this.x2 = x2;
    this.y1 = y1;
    this.y2 = y2;
    this.sideTypes = sideTypes;
    this.walls = [];
    this.goal = null;
    this.empty = [];
    for (let sideIndex in this.sideTypes) {
      var x1S, y1S, x2S, y2S;
      switch (sideIndex) {
        case "0": //top
          x1S = this.x1;
          y1S = this.y1;
          x2S = this.x2;
          y2S = this.y1;
          break;
        case "1": // right
          x1S = this.x2;
          y1S = this.y1;
          x2S = this.x2;
          y2S = this.y2;
          break;
        case "2": // bottom
          x1S = this.x1;
          y1S = this.y2;
          x2S = this.x2;
          y2S = this.y2;
          break;
        case "3": // left
          x1S = this.x1;
          y1S = this.y1;
          x2S = this.x1;
          y2S = this.y2;
      }
      let sideType = this.sideTypes[sideIndex];
      if (sideType === "wall") {
        this.walls.push({
          x1: x1S,
          y1: y1S,
          x2: x2S,
          y2: y2S,
        });
      } else if (sideType === "goal") {
        this.goal = {
          x1: x1S,
          y1: y1S,
          x2: x2S,
          y2: y2S,
        };
      } else {
        this.empty.push({
          x1: x1S,
          y1: y1S,
          x2: x2S,
          y2: y2S,
        });
      }
    }
  }

  draw() {
    noStroke(0);
    fill("white");
    rect(this.x1, this.y1, this.x2 - this.x1, this.y2 - this.y1);

    if (this.goal != null) {
      strokeWeight(4);
      stroke("green");
      line(this.goal.x1, this.goal.y1, this.goal.x2, this.goal.y2);
    }
    for (let wall of this.walls) {
      stroke(1);
      strokeWeight(1);
      line(wall.x1, wall.y1, wall.x2, wall.y2);
    }
  }
}

class Track {
  constructor(trackValues) {
    this.trackValues = trackValues;
    this.lastTrackIndex = null;
    this.score = 0;
  }

  draw() {
    for (let trackPiece of this.trackValues) {
      trackPiece.draw();
    }
  }

  /**
   * Builds and returns a straight piece of track in
   * the specified direction
   *
   * @param {string} direction up, down, left, right
   * @param {Number} x1 point
   * @param {Number} y1 point
   * @param {Number} length Optional, defaults to 100
   * @param {Number} width  Optional, defaults to 100
   * @returns {TrackPiece}
   */
  static buildStraight(direction, x1, y1, length = 100, width = 100) {
    let directionValue = Track.getDirectionValue(direction);
    let sideValues = ["wall", "goal", "wall", "empty"];
    sideValues.rotateRight(directionValue);
    return new TrackPiece(x1, y1, x1 + length, y1 + width, sideValues);
  }

  /**
   * Builds and returns a corner piece of track in
   * the specified direction
   *
   * @param {string} direction up, down, left, right
   * @param {Number} x1 point
   * @param {Number} y1 point
   * @param {Number} length Optional, defaults to 100
   * @param {Number} width  Optional, defaults to 100
   * @returns {TrackPiece}
   */
  static buildCorner(direction, x1, y1, length = 100, width = 100) {
    let directionValue = Track.getDirectionValue(direction);
    let sideValues = ["wall", "wall", "goal", "empty"];
    sideValues.rotateRight(directionValue);
    return new TrackPiece(x1, y1, x1 + length, y1 + width, sideValues);
  }

  static getDirectionValue(direction) {
    switch (direction) {
      case "right":
        return 0;
      case "up":
        return 1;
      case "left":
        return 2;
      case "down":
        return 3;
      default:
        return 0;
    }
  }

  // Returns the index of the trackpiece which the car is currently in
  // if not in a trackpiece then off track and returns null
  inTrack(x, y) {
    let lastTrackIndex = this.lastTrackIndex ?? 0;
    let trackCount = this.trackValues.length;
    // Start at the last track index found and loop around for performance
    for (
      let trackIndex = lastTrackIndex;
      trackIndex < trackCount + lastTrackIndex;
      trackIndex++
    ) {
      let curr = this.trackValues[trackIndex % trackCount];
      if (curr.x1 < x && x < curr.x2 && curr.y1 < y && y < curr.y2) {
        return trackIndex % trackCount;
      }
    }
    return null;
  }

  /**
   * Tracks and changes the score based on position
   *
   * @param {Number} nextTrackIndex
   */
  addScore(nextTrackIndex) {
    if (nextTrackIndex == null) {
      this.score = -1000000000;
      return;
    }
    if (
      nextTrackIndex === 0 &&
      this.lastTrackIndex === this.trackValues.length - 1 &&
      this.score > 5000
    ) {
      this.score = this.score * 100;
    } else if (nextTrackIndex > this.lastTrackIndex) {
      this.score += 1000;
    } else if (nextTrackIndex < this.lastTrackIndex) {
      this.score -= 2000;
    } else if (this.score % 1000 < 500) {
      this.score += 0.1;
    }
  }
}
