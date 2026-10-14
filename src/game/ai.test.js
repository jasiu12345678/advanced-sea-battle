import { describe, it, expect } from "vitest";
import { INITIAL_AI_MEMORY, nextAiShot, updateAiMemory } from "./ai";
import { createEmptyBoard, placeShip } from "./board";
import { generateRandomFleet } from "./fleet";
import { isFleetDestroyed, processShot } from "./combat";
import { BOARD_SIZE, CELL_STATES, ORIENTATION, SHIPS } from "../constants";

const { HORIZONTAL } = ORIENTATION;
const [, , CRUISER, , DESTROYER] = SHIPS;

// Fires `indices` in order, feeding every result to the AI memory.
const fire = (board, fleet, indices, memory = INITIAL_AI_MEMORY) => {
    for (const idx of indices) {
        const shot = processShot(board, fleet, idx);
        ({ board, fleet } = shot);
        memory = updateAiMemory(memory, idx, shot.result, board);
    }
    return { board, fleet, memory };
};

describe("hunt / target AI", () => {
    it("switches to target mode and queues orthogonal neighbours after a hit", () => {
        const { board, fleet } = placeShip(createEmptyBoard(), [], 44, CRUISER, HORIZONTAL);
        const { memory } = fire(board, fleet, [44]);
        expect(memory.mode).toBe("target");
        expect([...memory.targetQueue].sort((a, b) => a - b)).toEqual([34, 43, 45, 54]);
    });

    it("does not queue cells outside the board", () => {
        const { board, fleet } = placeShip(createEmptyBoard(), [], 0, DESTROYER, HORIZONTAL);
        const { memory } = fire(board, fleet, [0]);
        expect([...memory.targetQueue].sort((a, b) => a - b)).toEqual([1, 10]);
    });

    it("returns to hunt mode once the ship is sunk", () => {
        const { board, fleet } = placeShip(createEmptyBoard(), [], 0, DESTROYER, HORIZONTAL);
        expect(fire(board, fleet, [0, 1]).memory).toEqual(INITIAL_AI_MEMORY);
    });

    it("keeps going after a neighbouring ship that was hit before another one sank", () => {
        // destroyer at 0-1, cruiser at 11-13 (cell 11 touches cell 1)
        let r = placeShip(createEmptyBoard(), [], 0, DESTROYER, HORIZONTAL);
        r = placeShip(r.board, r.fleet, 11, CRUISER, HORIZONTAL);
        const { memory } = fire(r.board, r.fleet, [11, 0, 1]);
        expect(memory.mode).toBe("target");
        expect(memory.targetQueue).toContain(12);
    });

    it("extends the line once two hits are aligned", () => {
        const { board, fleet } = placeShip(createEmptyBoard(), [], 44, SHIPS[0], HORIZONTAL); // 44..48
        const { board: after, memory } = fire(board, fleet, [45, 46]);
        const next = nextAiShot(after, memory);
        expect([44, 47]).toContain(next);
    });

    it("hunts on a checkerboard pattern", () => {
        const board = createEmptyBoard();
        for (let i = 0; i < 100; i++) {
            const idx = nextAiShot(board, INITIAL_AI_MEMORY);
            expect(((Math.floor(idx / BOARD_SIZE)) + (idx % BOARD_SIZE)) % 2).toBe(0);
        }
    });

    it("never shoots the same cell twice and always finishes the game", () => {
        for (let game = 0; game < 50; game++) {
            let { board, fleet } = generateRandomFleet();
            let memory = INITIAL_AI_MEMORY;
            const shot = new Set();
            while (!isFleetDestroyed(fleet)) {
                const idx = nextAiShot(board, memory);
                expect(idx).not.toBeNull();
                expect(shot.has(idx)).toBe(false);
                shot.add(idx);
                const res = processShot(board, fleet, idx);
                ({ board, fleet } = res);
                memory = updateAiMemory(memory, idx, res.result, board);
            }
            expect(shot.size).toBeLessThanOrEqual(BOARD_SIZE * BOARD_SIZE);
            expect(board.some((c) => c.state === CELL_STATES.HIT)).toBe(false); // everything hit is sunk
        }
    });

    it("needs clearly fewer shots than a purely random shooter", () => {
        const play = (smart) => {
            let { board, fleet } = generateRandomFleet();
            let memory = INITIAL_AI_MEMORY;
            let shots = 0;
            while (!isFleetDestroyed(fleet)) {
                const open = board.flatMap((c, i) =>
                    c.state === CELL_STATES.WATER || c.state === CELL_STATES.SHIP ? [i] : []);
                const idx = smart ? nextAiShot(board, memory) : open[Math.floor(Math.random() * open.length)];
                const res = processShot(board, fleet, idx);
                ({ board, fleet } = res);
                memory = updateAiMemory(memory, idx, res.result, board);
                shots++;
            }
            return shots;
        };
        const average = (smart) => Array.from({ length: 200 }, () => play(smart)).reduce((a, b) => a + b, 0) / 200;
        expect(average(true)).toBeLessThan(average(false) - 20);
    });
});
