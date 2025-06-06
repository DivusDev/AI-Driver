const SIZE_X = 800;
const SIZE_Y = 1000;

const train_xs = tf.tensor2d([
  [0, 0],
  [1, 0],
  [0, 1],
  [1, 1],
]);
const train_ys = tf.tensor2d([[0], [1], [1], [0]]);

function setup() {
  createCanvas(SIZE_X, SIZE_Y);

  car = new Car(250, 150, true);
  track = new Track([
    Track.buildStraight("right", 200, 100),
    Track.buildStraight("right", 300, 100),
    Track.buildStraight("right", 400, 100),
    Track.buildStraight("right", 500, 100),
    Track.buildCorner("right", 600, 100),
    Track.buildStraight("down", 600, 200),
    Track.buildStraight("down", 600, 300),
    Track.buildStraight("down", 600, 400),
    Track.buildStraight("down", 600, 500),
    Track.buildStraight("down", 600, 600),
    Track.buildStraight("down", 600, 700),
    Track.buildCorner("down", 600, 800),
    Track.buildStraight("left", 500, 800),
    Track.buildStraight("left", 400, 800),
    Track.buildStraight("left", 300, 800),
    Track.buildStraight("left", 200, 800),
    Track.buildCorner("left", 100, 800),
    Track.buildStraight("up", 100, 700),
    Track.buildStraight("up", 100, 600),
    Track.buildStraight("up", 100, 500),
    Track.buildStraight("up", 100, 400),
    Track.buildStraight("up", 100, 300),
    Track.buildStraight("up", 100, 200),
    Track.buildCorner("up", 100, 100),
  ]);

  // xs = tf.tensor2d(inputs);

  model = tf.sequential();
  let hidden1 = tf.layers.dense({
    inputShape: [8],
    units: 16,
    activation: "sigmoid",
  });
  let output = tf.layers.dense({
    units: 4,
    activation: "sigmoid",
  });
  model.add(hidden1);
  model.add(output);

  const optimizer = tf.train.adam(0.2);
  model.compile({
    optimizer: optimizer,
    loss: "meanSquaredError",
  });
}

function train() {
  trainModel().then((result) => {
    ///console.log(result.history.loss[0]);
    setTimeout(train, 10);
  });
}

function trainModel() {
  return model.fit(train_xs, train_ys, {
    shuffle: true,
    epochs: 1,
  });
}

function draw() {
  background(220);
  track.draw();
  car.driveV2();
  if (
    keyIsDown(UP_ARROW) ||
    keyIsDown(DOWN_ARROW) ||
    keyIsDown(LEFT_ARROW) ||
    keyIsDown(RIGHT_ARROW)
  ) {
    car.accelerateV2(
      ((keyIsDown(UP_ARROW) ?? false) - (keyIsDown(DOWN_ARROW) ?? false)) * 0.2,
      ((keyIsDown(RIGHT_ARROW) ?? false) - (keyIsDown(LEFT_ARROW) ?? false)) *
        0.8
    );
  } else {
    car.accelerateV2(-0.1 * car.speed, 0);
  }
  let foundTrackIndex = track.inTrack(
    car.x + car.width / 2,
    car.y + car.height / 2
  );
  if (foundTrackIndex != null) {
    fill("green");
  } else if (foundTrackIndex == null) {
    fill("red");
  }
  track.addScore(foundTrackIndex);
  track.lastTrackIndex = foundTrackIndex;
  car.see(track, foundTrackIndex);
  car.showV2();

  // Draw score
  fill("white");
  rect(SIZE_X / 2 - 150, SIZE_Y / 2 - 40, 300, 80);
  textSize(24);
  fill("black");
  text(
    `Score: ${Math.floor(track.score * 100) / 100}`,
    SIZE_X / 2 - 125,
    SIZE_Y / 2 + 10
  );
}

/**
 * This function is called when the mouse is clicked.
 * @param {MouseEvent} event - The `MouseEvent` that is passed as an argument.
 */
function mouseClicked(event) {
  console.log(mouseX, mouseY);
}
