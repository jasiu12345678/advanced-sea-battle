import { useState } from "react";
import { PHASE } from "./constants";
import Game from "./components/game/game";
import GameOver from "./components/game-over/game-over";
import Setup from "./components/setup/setup";
import "./assets/styles/App.css";

function App() {
    const [phase, setPhase] = useState(PHASE.SETUP);
    const [config, setConfig] = useState(null);
    const [result, setResult] = useState(null);

    const startGame = (newConfig) => {
        setConfig(newConfig);
        setPhase(PHASE.PLAYING);
    };

    const endGame = (gameResult) => {
        setResult(gameResult);
        setPhase(PHASE.GAME_OVER);
    };

    const restart = () => {
        setConfig(null);
        setResult(null);
        setPhase(PHASE.SETUP);
    };

    return (
        <div id="container" className={`container--${phase}`}>
            <header>Advanced Sea Battle</header>
            {phase === PHASE.SETUP && <Setup onSetupComplete={startGame} />}
            {phase === PHASE.PLAYING && <Game config={config} onGameEnd={endGame} />}
            {phase === PHASE.GAME_OVER && <GameOver result={result} onRestart={restart} />}
        </div>
    );
}

export default App;
