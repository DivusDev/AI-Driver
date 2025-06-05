

function setup() {
  createCanvas(800, 1000);

  car = new Car(250, 150, true)
  track = new Track(
    [
      new TrackPiece(
        'tight-curve',
        200, 200,
        PI
      ),
      new TrackPiece(
        'Hstraight',
        200, 100,
        400
      ),
      new TrackPiece(
        'tight-curve',
        600, 200,
        HALF_PI * 3
      ),
      new TrackPiece(
        'Vstraight',
        600, 200,
        100
      ),
      new TrackPiece(
        'tight-curve',
        600, 300,
        0
      ),
      new TrackPiece(
        'Hstraight',
        500, 300,
        100
      ),
      new TrackPiece(
        'tight-curve',
        500, 400,
        PI
      ),
      new TrackPiece(
        'tight-curve',
        500, 400,
        HALF_PI
      ),
      new TrackPiece(
        'tight-curve',
        500, 500,
        HALF_PI * 3
      ),
      new TrackPiece(
        'Vstraight',
        500, 500,
        100
      ),
      new TrackPiece(
        'curve',
        500, 600,
        0
      ),
      new TrackPiece(
        'Hstraight',
        200, 700,
        200
      ),
      new TrackPiece(
        'curve',
        300, 600,
        HALF_PI
      ),
      new TrackPiece(
        'Vstraight',
        1, 500,
        100
      ),
      new TrackPiece(
        'tight-curve',
        101, 500,
        PI
      ),
      new TrackPiece(
        'tight-curve',
        101, 400,
        0
      ),
      new TrackPiece(
        'Vstraight',
        100, 200,
        200
      ),
    ]
  )

}

function draw() {
  background(220);
  track.draw()
  car.driveV2()
  car.accelerateV2(((keyIsDown(UP_ARROW) ?? false) - (keyIsDown(DOWN_ARROW) ?? false)) * 0.2, ((keyIsDown(LEFT_ARROW) ?? false) - (keyIsDown(RIGHT_ARROW) ?? false) * .8))
  let foundTrackIndex = track.inTrack(car.x + car.width/2, car.y + car.height/ 2)
  if (foundTrackIndex != -1) {
    fill('green');
  } else {
    fill('red');
  }
  car.checkWalls(track.trackValues[foundTrackIndex])
  car.showV2()
}



