import { describe, it, expect } from "vitest";
import { canPlaceShip, createEmptyBoard, getNeighbors, getShipCells, placeShip } from "./board";
import { ORIENTATION, SHIPS } from "../constants";

const { HORIZONTAL, VERTICAL } = ORIENTATION;
const CRUISER = SHIPS[2];

describe("getShipCells", () => {
    it("follows the orientation", () => {
        expect(getShipCells(3, 3, HORIZONTAL)).toEqual([3, 4, 5]);
        expect(getShipCells(3, 3, VERTICAL)).toEqual([3, 13, 23]);
    });

    it("stops at the board edge instead of wrapping to the next row", () => {
        expect(getShipCells(8, 3, HORIZONTAL)).toEqual([8, 9]);
        expect(getShipCells(80, 3, VERTICAL)).toEqual([80, 90]);
    });
});

describe("canPlaceShip", () => {
    it("accepts a ship fully inside an empty board", () => {
        expect(canPlaceShip(createEmptyBoard(), 0, 5, HORIZONTAL)).toBe(true);
        expect(canPlaceShip(createEmptyBoard(), 0, 5, VERTICAL)).toBe(true);
    });

    it("rejects ships that stick out of the board", () => {
        const board = createEmptyBoard();
        expect(canPlaceShip(board, 8, 3, HORIZONTAL)).toBe(false);
        expect(canPlaceShip(board, 80, 3, VERTICAL)).toBe(false);
    });

    it("rejects overlapping ships", () => {
        const { board } = placeShip(createEmptyBoard(), [], 0, CRUISER, HORIZONTAL);
        expect(canPlaceShip(board, 2, 2, VERTICAL)).toBe(false);
    });
});

describe("getNeighbors", () => {
    it("returns 4 neighbours in the middle and 2 in a corner", () => {
        expect(getNeighbors(44).sort((a, b) => a - b)).toEqual([34, 43, 45, 54]);
        expect(getNeighbors(0).sort((a, b) => a - b)).toEqual([1, 10]);
        expect(getNeighbors(99).sort((a, b) => a - b)).toEqual([89, 98]);
    });

    it("does not wrap around row edges", () => {
        expect(getNeighbors(9)).not.toContain(10);
        expect(getNeighbors(10)).not.toContain(9);
    });
});
