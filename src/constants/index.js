export const TURN_TIME = 15; // seconds
export const RADAR_THRESHOLD = 3000; // miliseconds

export const MAX_FUEL = 100;
export const INITIAL_FUEL = MAX_FUEL;
export const FUEL_CONSUMPTION = 5;
export const FUEL_REFILL = 10;

export const BOARD_SIZE = 10;

export const SHIPS = [{size: 5, name: 'carrier'}, {size: 4, name: 'battleship'}, {size: 3, name: 'cruiser'}, {size: 3, name: 'submarine'}, {size: 2, name: 'destroyer'}];
export const CELL_STATES = {WATER: 'water', SHIP: 'ship', HIT: 'hit', MISS: 'miss', SUNK: 'sunk'};
