class Matrix {
  constructor(rows, cols) {
    this.rows = rows;
    this.cols = cols;
    this.cellWidth = WIDTH / cols;
    this.cellHeight = HEIGHT / rows;
    this.data = Array.from({ length: rows }, () => Array(cols).fill(0));
  }

  set(i, j, val) {
    if (i >= 0 && i < this.rows && j >= 0 && j < this.cols) {
      this.data[i][j] = val;
    }
  }

  get(i, j) {
    return (i >= 0 && i < this.rows && j >= 0 && j < this.cols) ? this.data[i][j] : 0;
  }

  toggleCell(i, j) {
    if (i >= 0 && i < this.rows && j >= 0 && j < this.cols) {
      this.data[i][j] = 1 - this.data[i][j];
    }
  }

  showMatrix() {
    noStroke();
    rectMode(CENTER);
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        const isAlive = this.data[i][j] === 1;
        fill(isAlive ? [128, 238, 120] : [129, 178, 154]);

        rect(
          (j + 0.5) * this.cellWidth,
          (i + 0.5) * this.cellHeight,
          this.cellWidth * 0.95,
          this.cellHeight * 0.95
        );
      }
    }
  }


  randomise(chance = 0.5) {
    this.data = this.data.map(row =>
      row.map(() => Math.random() < chance ? 1 : 0)
    );
  }

  countNeighbors(x, y) {
    let sum = 0;

    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        if (i === 0 && j === 0) continue;
        let wrappedRow = (x + i + this.rows) % this.rows;
        let wrappedCol = (y + j + this.cols) % this.cols;
        sum += this.get(wrappedRow, wrappedCol);
      }
    }

    return sum;
  }

  print() {
    console.table(this.data);
  }
}
let windowWidth = window.innerWidth;
let windowHeight = window.innerHeight;
let sizeFactor = 0.8;
let WIDTH = Math.min(windowWidth * sizeFactor, windowHeight * sizeFactor);
let HEIGHT = Math.min(windowWidth * sizeFactor, windowHeight * sizeFactor);
let gridSize = 20;
let liveDeadRatio = 0;
let worldGrid, nextGrid;
let running = false;
let numOfCells = 0;
let simSpeed = 1;

function setup() {
  frameRate(120);
  createCanvas(WIDTH, HEIGHT);
  initializeGrid(gridSize, liveDeadRatio);
  setupControls();
  numOfCells = numberAlive(worldGrid);
}

function windowResized() {
  if (!running) {


    windowWidth = window.innerWidth;
    windowHeight = window.innerHeight;
    WIDTH = Math.min(windowWidth * sizeFactor, windowHeight * sizeFactor);
    HEIGHT = Math.min(windowWidth * sizeFactor, windowHeight * sizeFactor);
    resizeCanvas(WIDTH, HEIGHT);
    worldGrid.cellWidth = WIDTH / worldGrid.cols;
    worldGrid.cellHeight = HEIGHT / worldGrid.rows;

  }
}
function draw() {
  background(51);
  for (let i = 0; i < simSpeed; i++) {
    if (running) {
      for (let i = 0; i < worldGrid.rows; i++) {
        for (let j = 0; j < worldGrid.cols; j++) {
          let state = worldGrid.get(i, j);
          let neighbors = worldGrid.countNeighbors(i, j);

          if (state === 0 && neighbors === 3) {
            nextGrid.set(i, j, 1);
          } else if (state === 1 && (neighbors < 2 || neighbors > 3)) {
            nextGrid.set(i, j, 0);
          } else {
            nextGrid.set(i, j, state);
          }
        }
      }

      [worldGrid, nextGrid] = [nextGrid, worldGrid];
    }
  }
  numOfCells = numberAlive(worldGrid);
  worldGrid.showMatrix();
  fill(255)
  textSize(32);
  textAlign(CENTER, CENTER);
  text(`Number of cells: ${numOfCells}`, 150, HEIGHT - 30);
}

function initializeGrid(size, liveDeadRatio) {
  const rows = parseInt(size);
  const cols = parseInt(size);
  worldGrid = new Matrix(rows, cols);
  nextGrid = new Matrix(rows, cols);
  worldGrid.randomise(liveDeadRatio);
  // worldGrid.print();
}

function setupControls() {
  const gridSizeSlider = document.getElementById('gridSize');
  const populationSlider = document.getElementById('population');
  const playPauseButton = document.getElementById('playPause');

  gridSizeSlider.addEventListener('input', function () {
    document.getElementById('gridSizeValue').innerText = this.value;
    initializeGrid(this.value, parseInt(populationSlider.value) / 100);
  });

  populationSlider.addEventListener('input', function () {
    document.getElementById('populationValue').innerText = `${this.value}%`;
    initializeGrid(parseInt(gridSizeSlider.value), this.value / 100);
  });

  playPauseButton.addEventListener('click', function () {
    running = !running;
    playPauseButton.innerText = running ? 'Pause' : 'Start';

    // if (!running) {
    //   gridSize = parseInt(gridSizeSlider.value);
    //   liveDeadRatio = parseInt(populationSlider.value) / 100;
    //   initializeGrid(gridSize, liveDeadRatio);
    // }
  });

  function updateControlsState() {
    gridSizeSlider.disabled = running;
    populationSlider.disabled = running;
  }

  setInterval(updateControlsState, 100);
}

function numberAlive(grid) {
  let numOfCells = 0;
  grid.data.forEach(row => {
    row.forEach(cell => {
      if (cell === 1) {
        numOfCells++;
      }
    });
  });
  return numOfCells;
}

function mousePressed() {
  const x = Math.floor(mouseX / (WIDTH / worldGrid.cols));
  const y = Math.floor(mouseY / (HEIGHT / worldGrid.rows));
  if (x >= 0 && x < worldGrid.cols && y >= 0 && y < worldGrid.rows) {
    worldGrid.toggleCell(y, x);
    //worldGrid.print();
  }
}

function mouseDragged() {
  const x = Math.floor(mouseX / (WIDTH / worldGrid.cols));
  const y = Math.floor(mouseY / (HEIGHT / worldGrid.rows));
  if (x >= 0 && x < worldGrid.cols && y >= 0 && y < worldGrid.rows) {
    worldGrid.set(y, x, 1);
    //worldGrid.print();
  }
}
