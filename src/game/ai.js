import { CELL_STATES } from "../constants";
import { getNeighbors, isInside, isShootable, toIndex, toRowCol } from "./board";

export const INITIAL_AI_MEMORY = { mode: "hunt", targetQueue: [] };

const pickRandom = (list) => list[Math.floor(Math.random() * list.length)];

const unique = (list) => [...new Set(list)];

// Hunt mode: shoot on a checkerboard pattern. The smallest ship covers 2 cells,
// so every ship is crossed by a "black" square and half of the board can be skipped.
const huntShot = (board) => {
    const open = board.flatMap((_, i) => (isShootable(board, i) ? [i] : []));
    if (open.length === 0) return null;
    const onParity = open.filter((i) => {
        const { row, col } = toRowCol(i);
        return (row + col) % 2 === 0;
    });
    return pickRandom(onParity.length > 0 ? onParity : open);
};

export const nextAiShot = (board, memory) => {
    if (memory.mode === "target") {
        const next = memory.targetQueue.find((idx) => isShootable(board, idx));
        if (next !== undefined) return next;
    }
    return huntShot(board);
};

// First cell beyond the run of HIT cells that starts next to `idx` in direction (dr, dc).
const walkPastHits = (board, idx, dr, dc) => {
    let { row, col } = toRowCol(idx);
    do {
        row += dr;
        col += dc;
        if (!isInside(row, col)) return null;
    } while (board[toIndex(row, col)].state === CELL_STATES.HIT);
    return toIndex(row, col);
};

// When two or more hits line up, both ends of that line are the best next shots.
const lineEnds = (board, idx) => {
    const { row, col } = toRowCol(idx);
    const ends = [];
    for (const [dr, dc] of [[0, 1], [1, 0]]) {
        const hasHitOnAxis = [1, -1].some((s) => {
            const r = row + dr * s;
            const c = col + dc * s;
            return isInside(r, c) && board[toIndex(r, c)].state === CELL_STATES.HIT;
        });
        if (!hasHitOnAxis) continue;
        ends.push(walkPastHits(board, idx, dr, dc), walkPastHits(board, idx, -dr, -dc));
    }
    return ends.filter((i) => i !== null && isShootable(board, i));
};

const enqueueNeighbors = (queue, board, idx) =>
    unique([...queue, ...getNeighbors(idx).filter((n) => isShootable(board, n))]);

// After a ship sinks, keep going after any other ship that is hit but still afloat.
const queueFromOpenHits = (board) => {
    let queue = [];
    board.forEach((cell, idx) => {
        if (cell.state === CELL_STATES.HIT) queue = enqueueNeighbors(queue, board, idx);
    });
    return queue;
};

// `board` is the board *after* the shot.
export const updateAiMemory = (memory, idx, result, board) => {
    if (result.sunk) {
        const targetQueue = queueFromOpenHits(board);
        return { mode: targetQueue.length > 0 ? "target" : "hunt", targetQueue };
    }
    if (result.hit) {
        const pending = memory.mode === "target" ? memory.targetQueue : [];
        const targetQueue = enqueueNeighbors([...lineEnds(board, idx), ...pending], board, idx);
        return { mode: "target", targetQueue };
    }
    return memory;
};
