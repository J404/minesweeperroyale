export type Board = Square[][];

export interface Square {
    i: number;
    j: number;
    x: number;
    y: number;
    isMine: boolean;
}

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

// MUTATES ORIGINAL ARRAY
const setMines = (board: Board): void => {
    let numMines = startingMines;

    while (numMines > 0) {
        const i = Math.floor(Math.random() * numSquaresY);
        const j = Math.floor(Math.random() * numSquaresX);

        if (!board[i][j].isMine) {
            board[i][j].isMine = true;
            numMines--;
        }
    }
}

export function createBoard(): Board {
    const board: Board = [];

    for (let i = 0; i < numSquaresY; i++) {
        board[i] = [];
        for (let j = 0; j < numSquaresX; j++) {
            board[i][j] = {
                i, j,
                x: j * xIncrement,
                y: i * yIncrement + headerHeight,
                isMine: false,
            };
        }
    }

    setMines(board);
    return board;
}