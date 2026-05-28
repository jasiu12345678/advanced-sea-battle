import { CELL_STATES, COMPUTER_TURN_DELAY } from "../../constants";
import { isFleetDestroyed, processShot } from "../../helpers";
import "./game.css";
import { useState, useEffect } from "react";
import Board from "../board/board";

function Game( {config, onGameEnd} ) {
    const [playerBoard, setPlayerBoard] = useState(config.playerBoard);
    const [playerFleet, setPlayerFleet] = useState(config.playerFleet);
    const [computerBoard, setComputerBoard] = useState(config.computerBoard);
    const [computerFleet, setComputerFleet] = useState(config.computerFleet);
    const [currentTurn, setCurrentTurn] = useState("player");
    const [shotsCount, setShotsCount] = useState(0);

    function handlePlayerShot(idx) {
        if (currentTurn !== "player") return;
        const cell = computerBoard[idx];
        if (cell.state !== CELL_STATES.WATER && cell.state !== CELL_STATES.SHIP) return;

        const { board: newBoard, fleet: newFleet, result } =  processShot(computerBoard, computerFleet, idx);
        setComputerBoard(newBoard);
        setComputerFleet(newFleet);
        setShotsCount(c => c+1);

        if (isFleetDestroyed(newFleet)) {
            onGameEnd({winner: "player", totalMoves: shotsCount + 1, reason: "fleetDestroyed", playerName: config.playerName});
            return;
        }
        setCurrentTurn("computer");
    }

    // basic ai, completely random shooting
    useEffect(() => {
        if (currentTurn !== "computer") return;
        const id = setTimeout(() => {
            const candidates = playerBoard
            .map((c, i) => (c.state === CELL_STATES.WATER || c.state == CELL_STATES.SHIP) ? i : -1)
            .filter(i => i >= 0);
            const idx = candidates[Math.floor(Math.random() * candidates.length)];
            const {board, fleet} = processShot(playerBoard, playerFleet, idx);
            setPlayerBoard(board);
            setPlayerFleet(fleet);

            if (isFleetDestroyed(fleet)) {
                onGameEnd({winner: "computer", totalMoves: shotsCount + 1, reason: "fleetDestroyed", playerName: config.playerName});
                return;
            }
            setCurrentTurn("player");
        }, COMPUTER_TURN_DELAY);
        return () => clearTimeout(id);
    }, [currentTurn]);

    return (
        <div className="game">
            <h2>Turn: {currentTurn === "player" ? config.playerName : "Computer"}</h2>
            <p>Shots: {shotsCount}</p>
            <div className="game_boards">
                <div>
                    <h3>{config.playerName}</h3>
                    <Board cells={playerBoard} showShips />
                </div>
                <div>
                    <h3>Computer</h3>
                    <Board cells= {computerBoard} showShips={config.debugMode} onCellClick={handlePlayerShot} disabled={currentTurn !== "player"}/>
                </div>
            </div>
        </div>
    );
}

export default Game;