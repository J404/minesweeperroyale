import { Board } from './msutil';

export interface Room {
    roomCode: string;
    board: Board;
    players: Player[];
}

export interface Player {
    nickname: string;
    color: string;
    score: number;
    alive: boolean;
}

export const checkAllZero = (players: Player[]): boolean => {
    let allZero = true;

    for (let player of players) {
        if (player.score !== 0)
            allZero = false;
    }
    
    return allZero;
}

export const determineRankings = (room: Room): Player[] => {
    // First, we want to check if all players have 0 score and 1 is alive
    if (isGameOver(room) && checkAllZero(room.players)) {
        const players: Player[] = [];

        for (let i = 0; i < room.players.length; i++) {
            players[i] = room.players[i];

            // Check if this is the alive player
            if (players[i].alive) {
                // If so, we need to move them to the front of the array
                const firstPlayer = players[0];
                const alivePlayer = players[i];
                let temp: Player = {} as Player;

                temp = firstPlayer;
                players[0] = alivePlayer;
                players[i] = temp;
            }
        }

        return players;
    }
    // Otherwise, rank them on scores

    // Copy array (don't mutate arg directly)
    const rankedPlayers: Player[] = [];
    const toSort: number[] = [];

    for (let i = 0; i < room.players.length; i++) {
        toSort[i] = room.players[i].score;
    }

    let usedIndexes: number[] = [];

    // Definitely not the best way to sort array
    for (let i = 0; i < toSort.length; i++) {
        // Find the maximum value in the pile to be sorted
        let max = Number.MIN_SAFE_INTEGER;

        for (let j = 0; j < toSort.length; j++) {
            if (toSort[j] > max && usedIndexes.indexOf(j) < 0) {
                // If this isn't the 'first' round, we need to cut out the last 'max' number
                if (max !== Number.MIN_SAFE_INTEGER)
                    usedIndexes.pop();
                usedIndexes.push(j);

                max = toSort[j];
            }
        }

        // Get the player that was selected as the max this time
        const lastIndex = usedIndexes[usedIndexes.length - 1];
        const player = room.players[lastIndex];
        rankedPlayers.push(player);
    }

    return rankedPlayers;
}

export const isGameOver = (room: Room): boolean => {
    let numDead = 0;

    for (let i = 0; i < room.players.length; i++) {
        if (!room.players[i].alive)
            numDead++;
    }

    return numDead === room.players.length - 1;
}