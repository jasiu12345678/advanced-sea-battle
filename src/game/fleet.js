import { BOARD_SIZE, ORIENTATION, SHIPS } from "../constants";
import { canPlaceShip, createEmptyBoard, placeShip } from "./board";

const MAX_PLACEMENT_ATTEMPTS = 200;

const tryRandomFleet = () => {
    let board = createEmptyBoard();
    let fleet = [];
    for (const ship of SHIPS) {
        let placed = false;
        for (let attempt = 0; attempt < MAX_PLACEMENT_ATTEMPTS && !placed; attempt++) {
            const startIdx = Math.floor(Math.random() * BOARD_SIZE * BOARD_SIZE);
            const orientation = Math.random() < 0.5 ? ORIENTATION.HORIZONTAL : ORIENTATION.VERTICAL;
            if (canPlaceShip(board, startIdx, ship.size, orientation)) {
                ({ board, fleet } = placeShip(board, fleet, startIdx, ship, orientation));
                placed = true;
            }
        }
        if (!placed) return null;
    }
    return { board, fleet };
};

// Always returns a complete, valid fleet (retries from scratch if a ship got stuck).
export const generateRandomFleet = () => {
    let result = null;
    while (!result) result = tryRandomFleet();
    return result;
};

const H = ORIENTATION.HORIZONTAL;
const V = ORIENTATION.VERTICAL;

// Placements follow the order of SHIPS: [startIdx, orientation].
const buildFleet = (placements) => {
    let board = createEmptyBoard();
    let fleet = [];
    placements.forEach(([startIdx, orientation], i) => {
        ({ board, fleet } = placeShip(board, fleet, startIdx, SHIPS[i], orientation));
    });
    return { board, fleet };
};

export const PRESET_FLEETS = [
    {
        id: "preset-1",
        label: "Preset 1",
        ...buildFleet([[0, H], [21, H], [42, H], [67, H], [85, H], [79, V]]),
    },
    {
        id: "preset-2",
        label: "Preset 2",
        ...buildFleet([[0, V], [5, V], [9, V], [71, H], [90, H], [57, H]]),
    },
    {
        id: "preset-3",
        label: "Preset 3",
        ...buildFleet([[33, V], [6, H], [90, H], [58, V], [20, H], [15, V]]),
    },
];
