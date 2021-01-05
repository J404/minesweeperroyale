class Square {
    constructor(row, col, x, y) {
        this.row = row;
        this.col = col;
        this.x = x;
        this.y = y;
        this.numAdjacentMines = 0;
        this.isMine = false;
        this.isRevealed = false;
        this.isFlagged = false;
        this.textColor = "#9ea2a3";
        this.flagColor = '';
        this.hasBorder = false;
        this.borderColor = '';
        this.borderChanged = false;
    }

    flag(flagColor, clientPlayer) {
        // Check if it's another player trying to 'steal' a flag
        if (this.flagColor !== '' && flagColor !== this.flagColor)
            return;
        
        if (this.isFlagged) {
            this.isRevealed = false;
            this.isFlagged = false;
            this.flagColor = '';
            removeFromFlagArray(this);

            // Update score to negate if they end up removing the flag
            if (clientPlayer) {
                if (this.isMine)
                    sendScoreUpdate(-15);
                else
                    sendScoreUpdate(10);
            }
        } else if (!this.isRevealed) {
            this.isRevealed = true;
            this.isFlagged = true;
            this.flagColor = flagColor;
            addToFlagArray(this);

            // Update score if this flag was correct/incorrect
            // (only if the client placed the flag)
            if (clientPlayer) {
                if (this.isMine)
                    sendScoreUpdate(15);
                else
                    sendScoreUpdate(-10);
            }
        }
    }

    // When this square is (left) clicked, we must determine whether it is a mine or not
    // If not, we must determine the number of mines in adjacent squares
    // This method is NOT a pre-built event handler
    click(playerClick, clientPlayer, color) {
        // If it's a mine and not flagged, player loses
        if (this.isMine && !this.isFlagged) {
            if (clientPlayer) {
                playerAlive = false;
                sendDeath();
            }

            this.isRevealed = true;
            this.changeBorder(true, color);

            console.log("exploded");
            // Don't click if the tile is flagged
        } else if (!this.isFlagged) {
            // If the player is clicking on a square that's already been clicked on, reveal the adjacent squares
            if (this.isRevealed && playerClick)
                this.revealAdjacentSquares(clientPlayer, color);

            this.isRevealed = true;
            this.changeBorder(true, color);

            // If this square has 0 adjacent mines, reveal the adjacent squares
            if (this.numAdjacentMines == 0) {
                this.revealAdjacentSquares(clientPlayer, color);
                
                // Must reset border manually since it's already been 'set'
                this.hasBorder = false;
            }
        }
    }

    // Get adjacent squares and reveal them
    revealAdjacentSquares(clientPlayer, color) {
        const code = this.getAdjacentSquaresCode();
        const adjacentSquares = this.getAdjacentSquares(code);
        for (let s of adjacentSquares) {
            if (!s.isRevealed && !s.isFlagged)
                s.click(false, clientPlayer, color);
        }
    }

    // Get adjacent squares and count the mines 
    calculateAdjacentMines() {
        const code = this.getAdjacentSquaresCode();
        const adjacentSquares = this.getAdjacentSquares(code);
        let numMines = 0;

        for (let s of adjacentSquares) {
            if (s.isMine)
                numMines++;
        }
        this.numAdjacentMines = numMines;
        this.updateColor();
    }

    // Get code for the adjacent squares
    getAdjacentSquaresCode() {
        let code = [1, 1, 1, 1, 0, 1, 1, 1, 1];
        // This code represents which squares adjacent to the clicked square should be "selected"
        // Code is arranged in order below (with 0 being the clicked square's position):
        // 1  1  1    0 1 2
        // 1  0  1    3 4 5
        // 1  1  1    6 7 8

        // If it's on a the top/bottom, deselect the squares on the top/bottm rows
        if (this.row == 0) {
            code[0] = 0;
            code[1] = 0;
            code[2] = 0;
        } else if (this.row == numSquaresY - 1) {
            code[6] = 0;
            code[7] = 0;
            code[8] = 0;
        }

        // If it's on a wall, deselect the left/right columns
        if (this.col == 0) {
            code[0] = 0;
            code[3] = 0;
            code[6] = 0;
        } else if (this.col == numSquaresX - 1) {
            code[2] = 0;
            code[5] = 0;
            code[8] = 0;
        }

        return code;
    }

    // Returns an array of all the adjacent squares using the code
    getAdjacentSquares(code) {
        const adjacentSquares = [];
        let k = 0;
        for (let i = -1; i < 2; i++) {
            for (let j = -1; j < 2; j++) {
                if (code[k] == 1) {
                    adjacentSquares.push(board[this.row + i][this.col + j]);
                }

                k++;
            }
        }

        return adjacentSquares;
    }

    // Updates the text's color based on number of adjacent mines
    updateColor() {
        switch (this.numAdjacentMines) {
            case 0:
                this.textColor = "#9ea2a3";
                break;
            case 1:
                this.textColor = "#346beb";
                break;
            case 2:
                this.textColor = "#21a336";
                break;
            case 3:
                this.textColor = "#f20c14";
                break;
            case 4:
                this.textColor = "#54178a";
                break;
            case 5:
                this.textColor = "#8c1626";
                break;
            case 6:
                this.textColor = "#5991ab";
                break;
            case 7:
                this.textColor = "#1a4a35";
                break;
            default:
                this.textColor = "#000000";
                break;
        }
    }

    changeBorder(showBorder, color) {
        // Border shouldn't change after initially being set (prevents 'reclicks')
        if (this.borderChanged)
            return;

        this.hasBorder = showBorder;
        this.borderColor = color;
        this.borderChanged = true;
    }

    // Show the tile
    show() {
        // Draws the tile itself
        noStroke();
        fill("#afb2b3");
        rect(this.x, this.y, 20, 20);
        stroke(255);
        strokeWeight(1);
        line(this.x + 2, this.y + 2, this.x + 2, this.y + 18);
        line(this.x + 2, this.y + 2, this.x + 18, this.y + 2);
        noStroke();

        // Only display a symbol if the flag is revealed
        if (this.isRevealed) {
            if (this.isFlagged) {
                // Flag symbol
                fill(this.flagColor);
                triangle(this.x + 5, this.y + 5, this.x + 15, this.y + 8, this.x + 5, this.y + 11);
                stroke(0);
                strokeWeight(1);
                line(this.x + 5, this.y + 5, this.x + 5, this.y + 18);
            } else if (this.isMine) {
                // Simple circle for mine
                fill(0);
                ellipse(this.x + 10, this.y + 10, 10);
            } else {
                // Text
                fill("#9ea2a3");
                rect(this.x, this.y, 20, 20);

                fill(this.textColor);
                textAlign(CENTER, TOP);
                textSize(12);
                text(this.numAdjacentMines, this.x + 10, this.y + 5);
            }
        }

        // Show a border for color coding which player clicked it
        if (this.hasBorder) { 
            stroke(this.borderColor);
            strokeWeight(2);
            line(this.x + 1, this.y + 1, this.x + squareWidth - 1, this.y + 1);
            line(this.x + 1, this.y + 1, this.x + 1, this.y + squareHeight - 1);
            line(this.x + squareWidth - 1, this.y + 1, this.x + squareWidth - 1, 
                this.y + squareHeight - 1);
            line(this.x + 1, this.y + squareHeight - 1, 
                this.x + squareWidth - 1, this.y + squareHeight - 1);
        }
    }
}