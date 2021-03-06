let canvas;
const CANVASNAME = 'defaultCanvas0';

// Player vars
let playerName = '';
let playerColor = '';

// Server game vars
let canPlay = false;

// Set up variables, vals should not be changed
let board = [];

let placedFlags = [];
let numPlacedFlags = 0;

let firstClick = true;
let playerAlive = true;
let endMessageShown = false;

// Constants, vals can be played around with
// Default values for 30x16 board (standard) is square length of 20, board width of 630, board height of 336
// DEPRECATED: Now receives these values from server side
const squareWidth = 20;
const squareHeight = 20;

const xIncrement = squareWidth + 1;
const yIncrement = squareHeight + 1;

let boardWidth = 800;
let boardHeight = 500;

let headerWidth = boardWidth;
const headerHeight = 50;

let numSquaresX = 40;
let numSquaresY = 30;

const startingMines = 150;

//setNumSquaresFromDimensions();
setDimensionsFromNumSquares();


// Creates a timer and increments it every second
let time = 300;
let timer;

function startTimer() {
  timer = setInterval(() => {
    if (playerAlive && !checkWin())
      time--;
  }, 1000);
}

function endTimer() {
  clearInterval(timer);
}

function resetTimer() {
  time = 300;
  startTimer();
}

// setup is a custom p5 js function that runs once at the program's start and does not repeat
// Sets up the board of mines
function setup() {
  canvas = createCanvas((boardWidth > headerWidth) ? boardWidth : headerWidth, boardHeight + headerHeight);
  canvas.parent('game-canvas');
  // createBoard();
}

// draw is a custom p5 js function that loops continually throughout the program's operation
// Loop through board and show each square
function draw() {
  background("#616363");
  
  // Show each square on the board
  if (board.length > 0) {
    for (let i = 0; i < numSquaresY; i++) {
      for (let j = 0; j < numSquaresX; j++) {
        board[i][j].show();
      }
    }
  }
  
  // Tell them if they are waiting for the game to be over
  if (!canPlay) {
    app.status = 'Please wait for the game to be over or the host to start the game.';
  }
    
  // Checks if the player has won/lost
  if (checkWin() && !endMessageShown) {
    sendGameOver();
    endMessageShown = true;
  } else if (!playerAlive && !endMessageShown) {
    app.showModal('You\'ve died!',
    'You can still win, so stick around to the end!',
    false, '',
    'Exit');
    
    endMessageShown = true;
  }
  
  // Check if time is up
  if (time <= 0 && !endMessageShown) {
    sendGameOver();
    endTimer();
  }

  // Displays number of remaining mines and the time
  textSize(50);
  textAlign(LEFT, BASELINE);
  fill(255, 0, 0);
  text(startingMines - numPlacedFlags, 50, headerHeight - 5);
  text(time, width - 100, headerHeight - 5);
}

// Custom p5 js event handler
// Activates whenever mouse is pressed
function mousePressed() {
  if (!playerAlive || !canPlay)
    return;

  // First, check if mouse is within bounds of board
  if (mouseX <= width && mouseY <= height && mouseY > headerHeight) {
    // Use x and y of mouse to determine which square the mouse is over
    const i = floor((mouseY - headerHeight) / yIncrement);
    const j = floor(mouseX / xIncrement);
    
    // Select correct square from array
    const clickedSquare = board[i][j];
    
    // Left click = click the square
    if (mouseButton == LEFT) {
      // if (firstClick)
        // setMines(j, i);
      
      clickedSquare.click(true, true, playerColor);
      sendExplore(i, j);
      
    // Right click = flag the square
    } else if (mouseButton == RIGHT) {
      clickedSquare.flag(playerColor, true);
      sendFlag(i, j);
    }
  }
}

// Custom p5 js event handler that activates every key press
function keyPressed() {
}

// Checks if the player has won
function checkWin() {
  // Determines if the # of placed flags equals the # of mines
  const allFlags = numPlacedFlags == startingMines;
  
  // Checks if all flags are correctly placed
  const correctFlags = checkFlagPosition();
  
  // Only returns true if both conditions are met
  return allFlags && correctFlags;
}

// Checks if all the placed flags are in the correct position
function checkFlagPosition() {
  let allFlagsCorrect = true;
  
  for (let f of placedFlags) {
    if (!f.isMine)
      allFlagsCorrect = false;
  }
  
  return allFlagsCorrect;
}

// Set the board full of empty squares, 
// then fills it with mines and calculates number of adjacent mines for each square
// DEPRECATED: now runs on server side and is sent to clients
function createBoard() {
  for (let i = 0; i < numSquaresY; i++) {
    board[i] = [];
    for (let j = 0; j < numSquaresX; j++) {
      board[i][j] = new Square(i, j, j * xIncrement, i * yIncrement + headerHeight);
    }
  }
}

// Randomly places startingMines # of mines throughout the board
function setMines(safeCol, safeRow) {
  let numMines = startingMines;
  while (numMines > 0) {
    const i = floor(random(0, numSquaresY));
    const j = floor(random(0, numSquaresX));

    if (!board[i][j].isMine && (Math.abs(i - safeRow) > 1 || Math.abs(j - safeCol) > 1)) {
      board[i][j].isMine = true;
      numMines--;
    }
  }
  
  findMines();
}

// Increments through each square and calculates adjacent mines for that square
function findMines() {
  for (let i = 0; i < numSquaresY; i++) {
    for (let j = 0; j < numSquaresX; j++) {
      board[i][j].calculateAdjacentMines();
    }
  }
}

// Resets the board and starts a new game
function restart() {
  firstClick = true;
  playerAlive = true;
  
  placedFlags = [];
  numPlacedFlags = 0;
  
  time = 0;
  
  createBoard();
}

// Adds a flag to the array of placed flags
function addToFlagArray(square) {
  placedFlags.push(square);
  numPlacedFlags++;
}

// Removes a flag from the array of placed flags
function removeFromFlagArray(square) {
  const index = placedFlags.indexOf(square);
  const temp = placedFlags[placedFlags.length - 1];
  placedFlags[placedFlags.length - 1] = placedFlags[index];
  placedFlags[index] = temp;
  placedFlags.pop();
  numPlacedFlags--;
}

// Sets the number of squares on the board based on predetermined dimensions
function setNumSquaresFromDimensions() {
  while (numSquaresX * xIncrement + xIncrement < boardWidth) {
    numSquaresX++;
  }

  while (numSquaresY * yIncrement + yIncrement < boardHeight) {
    numSquaresY++;
  }
}

// Sets the board's dimensions based on the number of squares 
function setDimensionsFromNumSquares() {
  boardWidth = numSquaresX * xIncrement;
  headerWidth = boardWidth;
  boardHeight = numSquaresY * yIncrement;
}



// This event listener prevents the normal right-click menu from opening when you flag a square
document.addEventListener("contextmenu", e => {
  e.preventDefault();
});