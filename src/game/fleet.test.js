import { describe, it, expect } from "vitest";
import { generateRandomFleet, PRESET_FLEETS } from "./fleet";
import { BOARD_SIZE, CELL_STATES, SHIPS } from "../constants";

const expectValidFleet = ({ board, fleet }) => {
    expect(fleet.map((s) => s.size).sort()).toEqual(SHIPS.map((s) => s.size).sort());

    const cells = fleet.flatMap((s) => s.cells);
    expect(new Set(cells).size).toBe(cells.length); // no overlap
    expect(board.filter((c) => c.state === CELL_STATES.SHIP)).toHaveLength(cells.length);

    for (const ship of fleet) {
        expect(ship.cells).toHaveLength(ship.size);
        const rows = new Set(ship.cells.map((c) => Math.floor(c / BOARD_SIZE)));
        const cols = new Set(ship.cells.map((c) => c % BOARD_SIZE));
        expect(rows.size === 1 || cols.size === 1).toBe(true); // straight line, no wrapping
    }
};

describe("fleets", () => {
    it("random fleets are always valid", () => {
        for (let i = 0; i < 200; i++) expectValidFleet(generateRandomFleet());
    });

    it("preset fleets are valid", () => {
        expect(PRESET_FLEETS).toHaveLength(3);
        PRESET_FLEETS.forEach(expectValidFleet);
    });
});
