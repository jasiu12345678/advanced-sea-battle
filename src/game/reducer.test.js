import { describe, it, expect } from "vitest";
import { ACTIONS, createGameState, gameReducer } from "./reducer";
import { createEmptyBoard, placeShip } from "./board";
import {
    END_REASON, FUEL_CONSUMPTION, FUEL_PENALTY_TIMEOUT, FUEL_REFILL, INITIAL_FUEL,
    ORIENTATION, RADAR_THRESHOLD, SHIPS, TURN, TURN_TIME,
} from "../constants";

const DESTROYER = SHIPS[4];
const T0 = 1_000_000;

const makeConfig = () => {
    const mine = placeShip(createEmptyBoard(), [], 0, DESTROYER, ORIENTATION.HORIZONTAL);
    const theirs = placeShip(createEmptyBoard(), [], 0, DESTROYER, ORIENTATION.HORIZONTAL); // cells 0, 1
    return {
        playerBoard: mine.board, playerFleet: mine.fleet,
        computerBoard: theirs.board, computerFleet: theirs.fleet,
    };
};
const newGame = () => createGameState(makeConfig(), T0);
const shoot = (state, idx, at = T0 + 5000) => gameReducer(state, { type: ACTIONS.PLAYER_SHOT, idx, at });

describe("player shot", () => {
    it("miss: costs fuel, passes the turn", () => {
        const s = shoot(newGame(), 50);
        expect(s.fuel).toBe(INITIAL_FUEL - FUEL_CONSUMPTION);
        expect(s.turn).toBe(TURN.COMPUTER);
        expect(s.playerShots).toBe(1);
        expect(s.radarCharged).toBe(false);
    });

    it("hit: refunds fuel (net +5, capped at max)", () => {
        const s = shoot(newGame(), 0);
        expect(s.fuel).toBe(INITIAL_FUEL); // 100 - 5 + 10 capped to 100
        const low = shoot({ ...newGame(), fuel: 50 }, 0);
        expect(low.fuel).toBe(50 - FUEL_CONSUMPTION + FUEL_REFILL);
    });

    it("fast hit charges the radar, slow hit does not", () => {
        expect(shoot(newGame(), 0, T0 + RADAR_THRESHOLD - 1).radarCharged).toBe(true);
        expect(shoot(newGame(), 0, T0 + RADAR_THRESHOLD).radarCharged).toBe(false);
    });

    it("sinking the last ship wins", () => {
        const afterHit = { ...shoot(newGame(), 0), turn: TURN.PLAYER };
        const end = shoot(afterHit, 1);
        expect(end.outcome).toEqual({ winner: TURN.PLAYER, reason: END_REASON.FLEET_DESTROYED });
    });

    it("running out of fuel on a miss loses immediately", () => {
        const s = shoot({ ...newGame(), fuel: FUEL_CONSUMPTION }, 50);
        expect(s.outcome).toEqual({ winner: TURN.COMPUTER, reason: END_REASON.FUEL_EMPTY });
    });

    it("ignores shots at already-shot cells and out of turn", () => {
        const once = shoot(newGame(), 50);
        expect(shoot(once, 51)).toBe(once); // computer's turn
        const back = { ...once, turn: TURN.PLAYER };
        expect(shoot(back, 50)).toBe(back);
    });
});

describe("timer", () => {
    it("counts down", () => {
        expect(gameReducer(newGame(), { type: ACTIONS.TICK }).timeLeft).toBe(TURN_TIME - 1);
    });

    it("timeout passes the turn and costs fuel", () => {
        const s = gameReducer({ ...newGame(), timeLeft: 1 }, { type: ACTIONS.TICK });
        expect(s.turn).toBe(TURN.COMPUTER);
        expect(s.fuel).toBe(INITIAL_FUEL - FUEL_PENALTY_TIMEOUT);
        expect(s.timeLeft).toBe(0);
    });

    it("timeout with an empty tank loses", () => {
        const s = gameReducer({ ...newGame(), timeLeft: 1, fuel: FUEL_PENALTY_TIMEOUT }, { type: ACTIONS.TICK });
        expect(s.outcome.reason).toBe(END_REASON.FUEL_EMPTY);
    });

    it("does not tick during the computer's turn", () => {
        const s = { ...newGame(), turn: TURN.COMPUTER };
        expect(gameReducer(s, { type: ACTIONS.TICK })).toBe(s);
    });
});

describe("computer shot", () => {
    it("hands the turn back and resets the clock", () => {
        const afterPlayer = { ...shoot(newGame(), 50), timeLeft: 3 };
        const s = gameReducer(afterPlayer, { type: ACTIONS.COMPUTER_SHOT, idx: 99, at: T0 + 9000 });
        expect(s.turn).toBe(TURN.PLAYER);
        expect(s.timeLeft).toBe(TURN_TIME);
        expect(s.turnStartedAt).toBe(T0 + 9000);
        expect(s.computerShots).toBe(1);
    });

    it("computer wins by sinking the player's fleet", () => {
        let s = { ...newGame(), turn: TURN.COMPUTER };
        s = gameReducer(s, { type: ACTIONS.COMPUTER_SHOT, idx: 0, at: T0 });
        s = { ...s, turn: TURN.COMPUTER };
        s = gameReducer(s, { type: ACTIONS.COMPUTER_SHOT, idx: 1, at: T0 });
        expect(s.outcome).toEqual({ winner: TURN.COMPUTER, reason: END_REASON.FLEET_DESTROYED });
    });
});

describe("radar", () => {
    it("needs a charge, is single use and is cleared by the next shot", () => {
        const area = [0, 1, 10, 11];
        const empty = newGame();
        expect(gameReducer(empty, { type: ACTIONS.USE_RADAR, area })).toBe(empty);

        const charged = { ...empty, radarCharged: true };
        const used = gameReducer(charged, { type: ACTIONS.USE_RADAR, area });
        expect(used.radarCharged).toBe(false);
        expect(used.radarArea).toEqual(area);
        expect(gameReducer(used, { type: ACTIONS.USE_RADAR, area })).toBe(used);

        expect(shoot(used, 50).radarArea).toEqual([]);
    });
});
