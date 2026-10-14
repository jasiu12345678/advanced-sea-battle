import { END_REASON, TURN } from "../../constants";
import "./game-over.css";

const REASON_LABELS = {
    [END_REASON.FLEET_DESTROYED]: "all ships sunk",
    [END_REASON.FUEL_EMPTY]: "ran out of fuel",
};

function GameOver({ result, onRestart }) {
    const playerWon = result.winner === TURN.PLAYER;

    return (
        <div className="game-over">
            <h2>{playerWon ? "Victory!" : "Defeat"}</h2>
            <p>Winner: <strong>{playerWon ? result.playerName : "Computer"}</strong></p>
            <p>Reason: {REASON_LABELS[result.reason]}</p>
            <p>Your shots: {result.playerShots} · Computer shots: {result.computerShots}</p>
            <button onClick={onRestart}>Play again</button>
        </div>
    );
}

export default GameOver;
