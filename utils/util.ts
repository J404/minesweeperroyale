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

export const determineRankings = (room: Room): Player[] => {
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