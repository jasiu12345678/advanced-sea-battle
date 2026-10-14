import { describe, it, expect } from "vitest";
import { findRadarArea } from "./radar";
import { createEmptyBoard, placeShip } from "./board";
import { processShot } from "./combat";
import { CELL_STATES, ORIENTATION, SHIPS } from "../constants";

describe("findRadarArea", () => {
    it("returns null when no intact ship cell is left", () => {
        expect(findRadarArea(createEmptyBoard())).toBeNull();
    });

    it("returns a 2x2 area that contains an intact ship cell", () => {
        const { board } = placeShip(createEmptyBoard(), [], 55, SHIPS[2], ORIENTATION.VERTICAL);
        for (let i = 0; i < 30; i++) {
            const area = findRadarArea(board);
            expect(area).toHaveLength(4);
            expect(area.some((c) => board[c].state === CELL_STATES.SHIP)).toBe(true);
        }
    });

    it("ignores ship cells that were already hit", () => {
        const { board, fleet } = placeShip(createEmptyBoard(), [], 0, SHIPS[4], ORIENTATION.HORIZONTAL);
        const { board: afterHit } = processShot(board, fleet, 0);
        const area = findRadarArea(afterHit);
        expect(area.some((c) => afterHit[c].state === CELL_STATES.SHIP)).toBe(true);
    });
});
