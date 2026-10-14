import { BOARD_SIZE, CELL_STATES } from "../constants";
import { toIndex } from "./board";

// Picks a random 2x2 area that contains at least one intact ship cell, or null if none is left.
export const findRadarArea = (board) => {
    const areas = [];
    for (let row = 0; row < BOARD_SIZE - 1; row++) {
        for (let col = 0; col < BOARD_SIZE - 1; col++) {
            const area = [
                toIndex(row, col),
                toIndex(row, col + 1),
                toIndex(row + 1, col),
                toIndex(row + 1, col + 1),
            ];
            if (area.some((i) => board[i].state === CELL_STATES.SHIP)) areas.push(area);
        }
    }
    if (areas.length === 0) return null;
    return areas[Math.floor(Math.random() * areas.length)];
};
