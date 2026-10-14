import { BOARD_SIZE, CELL_STATES, ORIENTATION } from "../constants";

export const createEmptyBoard = () =>
    Array.from({ length: BOARD_SIZE * BOARD_SIZE }, () => ({ state: CELL_STATES.WATER, shipId: null }));

export const toRowCol = (idx) => ({ row: Math.floor(idx / BOARD_SIZE), col: idx % BOARD_SIZE });

export const toIndex = (row, col) => row * BOARD_SIZE + col;

export const isInside = (row, col) => row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;

export const getNeighbors = (idx) => {
    const { row, col } = toRowCol(idx);
    return [[-1, 0], [1, 0], [0, -1], [0, 1]]
        .filter(([dr, dc]) => isInside(row + dr, col + dc))
        .map(([dr, dc]) => toIndex(row + dr, col + dc));
};

// Cells covered by a ship starting at `startIdx`. Stops at the board edge,
// so the result is shorter than `size` when the ship does not fit.
export const getShipCells = (startIdx, size, orientation) => {
    const { row, col } = toRowCol(startIdx);
    const horizontal = orientation === ORIENTATION.HORIZONTAL;
    const cells = [];
    for (let i = 0; i < size; i++) {
        const r = horizontal ? row : row + i;
        const c = horizontal ? col + i : col;
        if (!isInside(r, c)) break;
        cells.push(toIndex(r, c));
    }
    return cells;
};

export const canPlaceShip = (board, startIdx, size, orientation) => {
    const cells = getShipCells(startIdx, size, orientation);
    return cells.length === size && cells.every((i) => board[i].state === CELL_STATES.WATER);
};

export const placeShip = (board, fleet, startIdx, ship, orientation) => {
    const id = fleet.length;
    const cells = getShipCells(startIdx, ship.size, orientation);
    const newBoard = board.map((cell, idx) =>
        cells.includes(idx) ? { state: CELL_STATES.SHIP, shipId: id } : cell
    );
    const newFleet = [...fleet, { id, name: ship.name, size: ship.size, cells, hits: 0 }];
    return { board: newBoard, fleet: newFleet };
};

// A cell that has not been shot at yet.
export const isShootable = (board, idx) => {
    const cell = board[idx];
    return cell !== undefined && (cell.state === CELL_STATES.WATER || cell.state === CELL_STATES.SHIP);
};
