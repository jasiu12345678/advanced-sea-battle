import {
    END_REASON, FUEL_CONSUMPTION, FUEL_PENALTY_TIMEOUT, FUEL_REFILL, INITIAL_FUEL,
    MAX_FUEL, RADAR_THRESHOLD, TURN, TURN_TIME,
} from "../constants";
import { INITIAL_AI_MEMORY, updateAiMemory } from "./ai";
import { isShootable } from "./board";
import { isFleetDestroyed, processShot } from "./combat";

export const ACTIONS = {
    PLAYER_SHOT: "PLAYER_SHOT",
    COMPUTER_SHOT: "COMPUTER_SHOT",
    TICK: "TICK",
    USE_RADAR: "USE_RADAR",
};

export const createGameState = (config, now) => ({
    turn: TURN.PLAYER,
    turnStartedAt: now,
    timeLeft: TURN_TIME,
    fuel: INITIAL_FUEL,
    playerBoard: config.playerBoard,
    playerFleet: config.playerFleet,
    computerBoard: config.computerBoard,
    computerFleet: config.computerFleet,
    radarCharged: false,
    radarArea: [],
    aiMemory: INITIAL_AI_MEMORY,
    playerShots: 0,
    computerShots: 0,
    outcome: null, // { winner, reason } once the game is over
});

const finish = (state, winner, reason) => ({ ...state, outcome: { winner, reason } });

function playerShot(state, { idx, at }) {
    if (state.outcome || state.turn !== TURN.PLAYER) return state;
    if (!isShootable(state.computerBoard, idx)) return state;

    const { board, fleet, result } = processShot(state.computerBoard, state.computerFleet, idx);

    let fuel = Math.max(0, state.fuel - FUEL_CONSUMPTION);
    if (result.hit) fuel = Math.min(MAX_FUEL, fuel + FUEL_REFILL);

    const fastHit = result.hit && at - state.turnStartedAt < RADAR_THRESHOLD;

    const next = {
        ...state,
        computerBoard: board,
        computerFleet: fleet,
        fuel,
        radarCharged: state.radarCharged || fastHit,
        radarArea: [],
        playerShots: state.playerShots + 1,
    };

    if (isFleetDestroyed(fleet)) return finish(next, TURN.PLAYER, END_REASON.FLEET_DESTROYED);
    if (fuel <= 0) return finish(next, TURN.COMPUTER, END_REASON.FUEL_EMPTY);
    return { ...next, turn: TURN.COMPUTER };
}

function computerShot(state, { idx, at }) {
    if (state.outcome || state.turn !== TURN.COMPUTER) return state;
    if (!isShootable(state.playerBoard, idx)) return state;

    const { board, fleet, result } = processShot(state.playerBoard, state.playerFleet, idx);

    const next = {
        ...state,
        playerBoard: board,
        playerFleet: fleet,
        aiMemory: updateAiMemory(state.aiMemory, idx, result, board),
        computerShots: state.computerShots + 1,
    };

    if (isFleetDestroyed(fleet)) return finish(next, TURN.COMPUTER, END_REASON.FLEET_DESTROYED);
    return { ...next, turn: TURN.PLAYER, turnStartedAt: at, timeLeft: TURN_TIME };
}

function tick(state) {
    if (state.outcome || state.turn !== TURN.PLAYER) return state;

    const timeLeft = state.timeLeft - 1;
    if (timeLeft > 0) return { ...state, timeLeft };

    // Out of time: lose the turn and pay the fuel penalty.
    const fuel = Math.max(0, state.fuel - FUEL_PENALTY_TIMEOUT);
    const next = { ...state, timeLeft: 0, fuel };
    if (fuel <= 0) return finish(next, TURN.COMPUTER, END_REASON.FUEL_EMPTY);
    return { ...next, turn: TURN.COMPUTER };
}

function activateRadar(state, { area }) {
    if (state.outcome || !state.radarCharged || !area) return state;
    return { ...state, radarCharged: false, radarArea: area };
}

export function gameReducer(state, action) {
    switch (action.type) {
        case ACTIONS.PLAYER_SHOT: return playerShot(state, action);
        case ACTIONS.COMPUTER_SHOT: return computerShot(state, action);
        case ACTIONS.TICK: return tick(state);
        case ACTIONS.USE_RADAR: return activateRadar(state, action);
        default: return state;
    }
}
