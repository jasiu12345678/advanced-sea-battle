import { describe, it, expect } from "vitest";
import { createEmptyBoard, placeShip } from "./board";
import { isFleetDestroyed, processShot } from "./combat";
import { CELL_STATES, ORIENTATION, SHIPS } from "../constants";

const DESTROYER = SHIPS[4];
const setup = () => placeShip(createEmptyBoard(), [], 0, DESTROYER, ORIENTATION.HORIZONTAL);

describe("processShot", () => {
    it("marks a miss on water", () => {
        const { board, fleet } = setup();
        const res = processShot(board, fleet, 50);
        expect(res.board[50].state).toBe(CELL_STATES.MISS);
        expect(res.result).toMatchObject({ hit: false, sunk: false });
    });

    it("marks a hit, then sinks the whole ship on the last hit", () => {
        const { board, fleet } = setup();
        const first = processShot(board, fleet, 0);
        expect(first.board[0].state).toBe(CELL_STATES.HIT);
        expect(first.result).toMatchObject({ hit: true, sunk: false });

        const second = processShot(first.board, first.fleet, 1);
        expect(second.result.sunk).toBe(true);
        expect(second.board[0].state).toBe(CELL_STATES.SUNK);
        expect(second.board[1].state).toBe(CELL_STATES.SUNK);
        expect(isFleetDestroyed(second.fleet)).toBe(true);
    });

    it("ignores a cell that was already shot", () => {
        const { board, fleet } = setup();
        const once = processShot(board, fleet, 50);
        const twice = processShot(once.board, once.fleet, 50);
        expect(twice.result.alreadyShot).toBe(true);
        expect(twice.board).toBe(once.board);
    });

    it("does not mutate its input", () => {
        const { board, fleet } = setup();
        const snapshot = JSON.stringify({ board, fleet });
        processShot(board, fleet, 0);
        expect(JSON.stringify({ board, fleet })).toBe(snapshot);
    });
});

describe("isFleetDestroyed", () => {
    it("is false for an empty fleet", () => {
        expect(isFleetDestroyed([])).toBe(false);
    });
});
