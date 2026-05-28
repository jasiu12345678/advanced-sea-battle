import { placeShip, canPlaceShip, createEmptyBoard, generateRandomFleet, getShipCells } from "../../helpers";
import Board from "../board/board";
import "./setup.css";
import { useState } from "react";
import { SHIPS, BOARD_SIZE } from "../../constants";

function Setup( {onSetupComplete} ) {
    const [name, setName] = useState("");
    const [orientation, setOrientation] = useState("horizontal"); // horizontal or vertical
    const [board, setBoard] = useState(() => createEmptyBoard());
    const [fleet, setFleet] = useState([]);
    const [currentShipIndex, setCurrentShipIndex] = useState(0);
    const [hoverIdx, setHoverIdx] = useState(null);
    const [computerFleetOption, setComputerFleetOption] = useState("random");
    const [debugMode, setDebugMode] = useState(false);

    const allShipsPlaced = currentShipIndex >= SHIPS.length;
    const currentShip = SHIPS[currentShipIndex];
    const previewCells = (hoverIdx !== null && !allShipsPlaced) 
            ? getShipCells(hoverIdx, currentShip.size, orientation).filter(i => i >= 0 && i < BOARD_SIZE * BOARD_SIZE) 
            : [];
    const previewValid = hoverIdx !== null && !allShipsPlaced && canPlaceShip(board, hoverIdx, currentShip.size, orientation);

    function handleCellClick(idx) {
        if (allShipsPlaced) return;
        if (!canPlaceShip(board, idx, currentShip.size, orientation)) return;
        const result = placeShip(board, fleet, idx, currentShip.size, orientation, currentShip.name);
        setBoard(result.board);
        setFleet(result.fleet);
        setCurrentShipIndex(i => i+1);
    }
    return (
        <div className="setup">
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Player name" />

            <label>Computer's fleet:
                <select value={computerFleetOption} onChange={e => setComputerFleetOption(e.target.value)}>
                    <option value="random">Random</option>
                    <option value="fleet1">Fleet 1</option>
                    <option value="fleet2">Fleet 2</option>
                    <option value="fleet3">Fleet 3</option>
                </select>
            </label>

            <label>
                <input type="checkbox" checked={debugMode} onChange={e => setDebugMode(e.target.checked)} />
                Debug mode (shows computer fleet)
            </label>

            <button onClick={() => setOrientation(o => o === "horizontal" ? "vertical" : "horizontal")}>
                Orientation: {orientation === "horizontal" ? "horizontal" : "vertical"}
            </button>

            {!allShipsPlaced && (<p> Place ship: {currentShip.name} (size {currentShip.size}). Remaining: {SHIPS.length - currentShipIndex} </p>)}

            <Board
            cells={board}
            showShips
            previewCells={previewCells}
            previewValid={previewValid}
            onCellClick={handleCellClick}
            // on cell hover
            />

            <button onClick={() => {
                const { board: b, fleet: f} = generateRandomFleet();
                setBoard(b); setFleet(f); setCurrentShipIndex(SHIPS.length);
            }}>Generate random fleet</button>

            <button
                disabled = {!name || !allShipsPlaced}
                onClick={() => {
                    const computer = computerFleetOption === "random"
                    ? generateRandomFleet()
                    : PREDEFINED_FLEETS[Number(computerFleetOption.slice(-1)) -1];
                    
                onSetupComplete({
                    playerName: name,
                    playerBoard: board,
                    playerFleet: fleet,
                    computerBoard: computer.board,
                    computerFleet: computer.fleet,
                    debugMode,
                    });
                }}
                >
                Start game
            </button>
        </div>
    );
}

export default Setup;