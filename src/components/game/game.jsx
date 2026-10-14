import { useEffect, useReducer } from "react";
import { COMPUTER_TURN_DELAY, TURN } from "../../constants";
import { ACTIONS, createGameState, findRadarArea, gameReducer, nextAiShot } from "../../game";
import Board from "../board/board";
import Dashboard from "../dashboard/dashboard";
import "./game.css";

function Game({ config, onGameEnd }) {
    const [state, dispatch] = useReducer(gameReducer, config, (c) => createGameState(c, Date.now()));
    const { turn, outcome, playerBoard, aiMemory } = state;

    // Countdown for the player's turn.
    useEffect(() => {
        if (turn !== TURN.PLAYER || outcome) return;
        const id = setInterval(() => dispatch({ type: ACTIONS.TICK }), 1000);
        return () => clearInterval(id);
    }, [turn, outcome]);

    // Computer move, slightly delayed so the player can follow what happened.
    useEffect(() => {
        if (turn !== TURN.COMPUTER || outcome) return;
        const id = setTimeout(() => {
            dispatch({ type: ACTIONS.COMPUTER_SHOT, idx: nextAiShot(playerBoard, aiMemory), at: Date.now() });
        }, COMPUTER_TURN_DELAY);
        return () => clearTimeout(id);
    }, [turn, outcome, playerBoard, aiMemory]);

    // Report the result to the parent exactly once.
    useEffect(() => {
        if (!outcome) return;
        onGameEnd({
            ...outcome,
            playerName: config.playerName,
            playerShots: state.playerShots,
            computerShots: state.computerShots,
        });
    }, [outcome]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleShot = (idx) => dispatch({ type: ACTIONS.PLAYER_SHOT, idx, at: Date.now() });
    const handleRadar = () => dispatch({ type: ACTIONS.USE_RADAR, area: findRadarArea(state.computerBoard) });

    return (
        <div className="game">
            <Dashboard
                playerName={config.playerName}
                turn={turn}
                fuel={state.fuel}
                timeLeft={state.timeLeft}
                radarReady={state.radarCharged}
                shots={state.playerShots}
                onRadarClick={handleRadar}
            />

            <div className="game__boards">
                <section className="game__board-col">
                    <h3>{config.playerName}</h3>
                    <Board cells={playerBoard} showShips />
                </section>
                <section className="game__board-col">
                    <h3>Computer</h3>
                    <Board
                        cells={state.computerBoard}
                        showShips={config.revealEnemy}
                        highlightedCells={state.radarArea}
                        disabled={turn !== TURN.PLAYER}
                        onCellClick={handleShot}
                    />
                </section>
            </div>
        </div>
    );
}

export default Game;
