import { CELL_STATES } from "../constants";

// Resolves a shot without mutating the inputs.
// result: { hit, sunk, alreadyShot }
export const processShot = (board, fleet, idx) => {
    const cell = board[idx];

    if (cell.state === CELL_STATES.WATER) {
        const newBoard = board.map((c, i) => (i === idx ? { ...c, state: CELL_STATES.MISS } : c));
        return { board: newBoard, fleet, result: { hit: false, sunk: false, alreadyShot: false } };
    }

    if (cell.state === CELL_STATES.SHIP) {
        const newFleet = fleet.map((s) => (s.id === cell.shipId ? { ...s, hits: s.hits + 1 } : s));
        const ship = newFleet.find((s) => s.id === cell.shipId);
        const sunk = ship.hits === ship.size;

        const newBoard = board.map((c, i) => {
            if (sunk && ship.cells.includes(i)) return { ...c, state: CELL_STATES.SUNK };
            if (i === idx) return { ...c, state: CELL_STATES.HIT };
            return c;
        });
        return { board: newBoard, fleet: newFleet, result: { hit: true, sunk, alreadyShot: false } };
    }

    return { board, fleet, result: { hit: false, sunk: false, alreadyShot: true } };
};

export const isFleetDestroyed = (fleet) => fleet.length > 0 && fleet.every((s) => s.hits === s.size);
