const SIZE_X = 800;
const SIZE_Y = 1000;

numCars = 100;
currentCars = [];
savedCars = [];

generationCounter = 0;

function setup() {
  createCanvas(SIZE_X, SIZE_Y);

  for (let i = 0; i < numCars; i++) {
    currentCars.push(Car.createCar());
  }
  playerCar = Car.createCar(true, true);

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
}
framecount = 0;

function draw() {
  // drawPlayer();
  drawAI();
}

function drawPlayer() {
  background(220);

  track.draw();
  playerCar.drive(
    keyIsDown(UP_ARROW),
    keyIsDown(DOWN_ARROW),
    keyIsDown(RIGHT_ARROW),
    keyIsDown(LEFT_ARROW)
  );
  let foundTrackIndex = track.inTrack(
    playerCar.x + playerCar.width / 2,
    playerCar.y + playerCar.height / 2
  );
  playerCar.lastTrackIndex = foundTrackIndex;
  playerCar.move();
  playerCar.see(track, foundTrackIndex);
  if (playerCar.lastTrackIndex != null && playerCar.score > -2000) {
    fill("rgba(0, 122, 0, 0.2)");
  } else {
    fill("red");
    playerCar.crash();
  }
  playerCar.draw();
}

function drawAI() {
  background(220);

  track.draw();

  for (let i = 0; i < currentCars.length; i++) {
    let currCar = currentCars[i];
    if (!currCar.crashed) {
      currCar.thinkAndDrive();
      currCar.move();

      let foundTrackIndex = track.inTrack(
        currCar.x + currCar.width / 2,
        currCar.y + currCar.height / 2
      );
      track.calculateScore(currCar, foundTrackIndex);
      currCar.lastTrackIndex = foundTrackIndex;
      currCar.see(track, foundTrackIndex);
      if (currCar.lastTrackIndex != null && currCar.score > -2000) {
        fill("rgba(0, 122, 0, 0.2)");
      } else {
        fill("red");
        currCar.crash();
      }
      currCar.draw();
    }
  }
  if (currentCars.filter((c) => !c.crashed).length < 1) {
    newCarEvolution();
    generationCounter++;
  }
  drawGeneration();
}

function drawGeneration() {
  // Draw score
  fill("white");
  rect(SIZE_X / 2 - 150, SIZE_Y / 2 - 40, 300, 80);
  textSize(24);
  fill("black");
  text(`Generation: ${generationCounter}`, SIZE_X / 2 - 125, SIZE_Y / 2);
  text(
    `Alive drivers: ${currentCars.filter((c) => !c.crashed).length}`,
    SIZE_X / 2 - 125,
    SIZE_Y / 2 + 25
  );
}

function newCarEvolution() {
  const bestCarCount = 1;
  bestCars = currentCars
    .sort((a, b) => b.score - a.score)
    .slice(0, bestCarCount);
  for (let i = 0; i < bestCarCount; i++) {
    currentCars.shift();
  }
  for (let i = 0; i < currentCars.length; i++) {
    currentCars[i].dispose();
  }
  currentCars = [...bestCars];
  while (currentCars.length < numCars) {
    if (Math.random() > 0.1) {
      const chosenDriver = bestCars[Math.floor(Math.random() * bestCarCount)];
      currentCars.push(chosenDriver.copyDriver());
    } else {
      currentCars.push(Car.createCar());
    }
  }
}
