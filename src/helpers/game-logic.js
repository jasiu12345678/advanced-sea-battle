import { SHIPS, BOARD_SIZE, CELL_STATES } from "../constants";

export const createEmptyBoard = () => Array.from({length: BOARD_SIZE * BOARD_SIZE}, () => ({state: CELL_STATES.WATER, shipId: null}));

export const canPlaceShip = (board, startIdx, size, orientation) => {
    const startRow = Math.floor(startIdx / BOARD_SIZE);
    const startCol = startIdx % BOARD_SIZE;

    for (let i=0;i < size; i++) {
        let idx;

        if (orientation === 'horizontal') {
            if (startCol + i >= BOARD_SIZE) return false;
            idx = startIdx + i;
        } else {
            if (startRow + i >= BOARD_SIZE) return false;
            idx = startIdx + i * BOARD_SIZE;
        }

        if (board[idx].state !== CELL_STATES.WATER) return false;
    }
    return true;
}

export const placeShip = (board, fleet, startIdx, size, orientation, name) => {
    const cells = getShipCells(startIdx, size, orientation);
    
    const shipId = fleet.length;

    const newBoard = board.map((cell,idx) =>
        cells.includes(idx) ? { state: CELL_STATES.SHIP, shipId } : cell
    );
    const newFleet = [...fleet, { id: shipId, size, name, cells, hits: 0}];
    return { board: newBoard, fleet: newFleet };
}

export const generateRandomFleet = () => {
    let board = createEmptyBoard();
    let fleet = [];
    for (const ship of SHIPS) {
        let placed = false;
        let attempts = 0;
        while (!placed && attempts < 1000) {
            const startIdx = Math.floor(Math.random() * BOARD_SIZE * BOARD_SIZE);
            const orientation = Math.random() < 0.5 ? "horizontal" : "vertical";
            if (canPlaceShip(board, startIdx, ship.size, orientation)) {
                const result = placeShip(board, fleet, startIdx, ship.size, orientation, ship.name)
                board = result.board;
                fleet = result.fleet;
                placed = true;
            }
            attempts++;
        }
    }
    return { board, fleet };
}

export const processShot = (board, fleet, idx) => {
    const cell = board[idx];
    if (cell.state === CELL_STATES.WATER) {
        const newBoard = board.map((c, i) => i === idx ? { ...c, state: CELL_STATES.MISS} : c);
        return { board: newBoard, fleet, result: {hit: false, sunk: false, ship: null}};
    }
    if (cell.state === CELL_STATES.SHIP) {
        const shipId = cell.shipId;
        const newFleet = fleet.map(s => s.id === shipId ? { ...s, hits: s.hits + 1} : s);
        const newShip = newFleet.find(s => s.id === shipId);
        const isSunk = newShip.hits === newShip.size;

        const newBoard = board.map((c,i) => {
            if (i === idx) return { ...c, state: CELL_STATES.HIT};
            return c;
        }).map((c,i) => {
            if (isSunk && newShip.cells.includes(i)) return { ...c, state: CELL_STATES.SUNK };
            return c;
        })
        return { board: newBoard, fleet: newFleet, result: { hit: true, sunk: isSunk, ship: newShip }};
    }
    return { board, fleet, result: { hit:false, sunk:false, ship: null, alreadyShot:true }};
}

export const isFleetDestroyed = (fleet) => fleet.length > 0 && fleet.every(s => s.hits === s.size);

export const getShipCells = (startIdx, size, orientation) => {
    const cells = [];
    for (let i =0; i< size; i++) {
        cells.push(
            orientation === "horizontal"
        ? startIdx + i
        : startIdx + i * BOARD_SIZE
        );
    }
    return cells;
}