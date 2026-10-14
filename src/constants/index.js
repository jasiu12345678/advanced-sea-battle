// Timing
export const TURN_TIME = 15; // seconds
export const RADAR_THRESHOLD = 3000; // ms: a hit faster than this charges the radar
export const COMPUTER_TURN_DELAY = 800; // ms

// Fuel
export const MAX_FUEL = 100;
export const INITIAL_FUEL = MAX_FUEL;
export const FUEL_CONSUMPTION = 5; // per shot
export const FUEL_REFILL = 10; // per hit
export const FUEL_PENALTY_TIMEOUT = 5; // when the turn timer runs out

// Board & fleet
export const BOARD_SIZE = 10;
export const SHIPS = [
    { size: 5, name: "Carrier" },
    { size: 4, name: "Battleship" },
    { size: 3, name: "Cruiser" },
    { size: 3, name: "Submarine" },
    { size: 2, name: "Destroyer" },
    { size: 2, name: "Patrol boat" },
];

export const CELL_STATES = { WATER: "water", SHIP: "ship", HIT: "hit", MISS: "miss", SUNK: "sunk" };
export const ORIENTATION = { HORIZONTAL: "horizontal", VERTICAL: "vertical" };

// App flow
export const PHASE = { SETUP: "setup", PLAYING: "playing", GAME_OVER: "gameover" };
export const TURN = { PLAYER: "player", COMPUTER: "computer" };
export const END_REASON = { FLEET_DESTROYED: "fleetDestroyed", FUEL_EMPTY: "fuelEmpty" };
