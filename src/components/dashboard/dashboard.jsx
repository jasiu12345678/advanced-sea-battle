import { MAX_FUEL, TURN } from "../../constants";
import "./dashboard.css";

const LOW_TIME = 5;

function Dashboard({ playerName, turn, fuel, timeLeft, radarReady, shots, onRadarClick }) {
    const isPlayerTurn = turn === TURN.PLAYER;
    const fuelPercent = Math.max(0, Math.min(100, (fuel / MAX_FUEL) * 100));

    return (
        <aside className="dashboard">
            <div className={`dashboard__turn dashboard__turn--${turn}`}>
                Turn: {isPlayerTurn ? playerName : "Computer"}
            </div>

            <div className="dashboard__timer">
                <span className={`dashboard__timer-value${timeLeft <= LOW_TIME ? " dashboard__timer-value--low" : ""}`}>
                    {timeLeft}s
                </span>
            </div>

            <div className="dashboard__fuel">
                Fuel: {fuel}/{MAX_FUEL}
                <div className="dashboard__fuel-bar">
                    <div className="dashboard__fuel-fill" style={{ width: `${fuelPercent}%` }} />
                </div>
            </div>

            <button className="dashboard__radar" disabled={!radarReady} onClick={onRadarClick}>
                Radar: {radarReady ? "Available" : "Unavailable"}
            </button>

            <div className="dashboard__shots">Shots: {shots}</div>
        </aside>
    );
}

export default Dashboard;
