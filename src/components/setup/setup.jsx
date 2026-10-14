import { useEffect, useState } from "react";
import { ORIENTATION, SHIPS } from "../../constants";
import {
    PRESET_FLEETS, canPlaceShip, createEmptyBoard, generateRandomFleet, getShipCells, placeShip,
} from "../../game";
import Board from "../board/board";
import "./setup.css";

const RANDOM_FLEET = "random";

function Setup({ onSetupComplete }) {
    const [name, setName] = useState("");
    const [orientation, setOrientation] = useState(ORIENTATION.HORIZONTAL);
    const [board, setBoard] = useState(createEmptyBoard);
    const [fleet, setFleet] = useState([]);
    const [hoverIdx, setHoverIdx] = useState(null);
    const [enemyFleetId, setEnemyFleetId] = useState(RANDOM_FLEET);
    const [revealEnemy, setRevealEnemy] = useState(false);

    const nextShip = SHIPS[fleet.length]; // undefined once the whole fleet is placed
    const allShipsPlaced = nextShip === undefined;
    const trimmedName = name.trim();

    const toggleOrientation = () =>
        setOrientation((o) => (o === ORIENTATION.HORIZONTAL ? ORIENTATION.VERTICAL : ORIENTATION.HORIZONTAL));

    // "R" rotates the ship being placed (ignored while typing in a field).
    useEffect(() => {
        const onKeyDown = (e) => {
            if (e.key.toLowerCase() !== "r" || e.target.matches("input, select, textarea")) return;
            toggleOrientation();
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, []);

    const previewCells = !allShipsPlaced && hoverIdx !== null
        ? getShipCells(hoverIdx, nextShip.size, orientation)
        : [];
    const previewValid = !allShipsPlaced && hoverIdx !== null
        && canPlaceShip(board, hoverIdx, nextShip.size, orientation);

    const handlePlace = (idx) => {
        if (allShipsPlaced || !canPlaceShip(board, idx, nextShip.size, orientation)) return;
        const placed = placeShip(board, fleet, idx, nextShip, orientation);
        setBoard(placed.board);
        setFleet(placed.fleet);
    };

    const handleRandomFleet = () => {
        const random = generateRandomFleet();
        setBoard(random.board);
        setFleet(random.fleet);
    };

    const handleReset = () => {
        setBoard(createEmptyBoard());
        setFleet([]);
    };

    const handleStart = () => {
        const enemy = enemyFleetId === RANDOM_FLEET
            ? generateRandomFleet()
            : PRESET_FLEETS.find((p) => p.id === enemyFleetId);

        onSetupComplete({
            playerName: trimmedName,
            playerBoard: board,
            playerFleet: fleet,
            computerBoard: enemy.board,
            computerFleet: enemy.fleet,
            revealEnemy,
        });
    };

    return (
        <div className="setup">
            <section className="setup__panel">
                <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Player name"
                    maxLength={20}
                />

                <label>
                    Computer's fleet:
                    <select value={enemyFleetId} onChange={(e) => setEnemyFleetId(e.target.value)}>
                        <option value={RANDOM_FLEET}>Random</option>
                        {PRESET_FLEETS.map((p) => (
                            <option key={p.id} value={p.id}>{p.label}</option>
                        ))}
                    </select>
                </label>

                <label>
                    <input type="checkbox" checked={revealEnemy} onChange={(e) => setRevealEnemy(e.target.checked)} />
                    Debug mode (shows computer fleet)
                </label>

                <button onClick={toggleOrientation}>Orientation: {orientation} (R)</button>

                {!allShipsPlaced && (
                    <p>
                        Place your <strong>{nextShip.name}</strong> (size {nextShip.size}).
                        Remaining: {SHIPS.length - fleet.length}
                    </p>
                )}
            </section>

            <section className="setup__board">
                <Board
                    cells={board}
                    showShips
                    previewCells={previewCells}
                    previewValid={previewValid}
                    onCellClick={handlePlace}
                    onCellHover={setHoverIdx}
                    onLeave={() => setHoverIdx(null)}
                />
            </section>

            <section className="setup__actions">
                <button onClick={handleRandomFleet}>Random fleet</button>
                <button onClick={handleReset} disabled={fleet.length === 0}>Reset</button>
                <button onClick={handleStart} disabled={!trimmedName || !allShipsPlaced}>Start game</button>
            </section>
        </div>
    );
}

export default Setup;
