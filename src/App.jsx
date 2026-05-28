import "./assets/styles/App.css";
import Board from "./components/board/board";
import { createEmptyBoard } from "./helpers/game-logic";
import { generateRandomFleet, processShot, isFleetDestroyed } from "./helpers";
import Setup from "./components/setup/setup";
import Game from "./components/game/game";
import { useState, useEffect } from "react";

function App() {

  const [phase, setPhase] = useState("setup");
  const [config, setConfig] = useState(null);

  //tests
  /*
  const { board, fleet } = generateRandomFleet();
  console.log("fleet: ", fleet);
  console.log("board: ", board);
  
  const shot = processShot( board, fleet, 0);
  console.log("shot at idx 0", shot.result);

  let b = board, f = fleet;
  for (const idx of fleet[0].cells) {
    const r = processShot(b, f, idx);
    b = r.board; f = r.fleet;
  }
  console.log("is first ship sunk", f[0].hits === f[0].size);
  console.log("is fleet destroyed", isFleetDestroyed(f));

  const cells = createEmptyBoard();

  */

  return (
    <div className="container">
        <h1>Advanced Sea Battle</h1>
        {phase === "setup" && (
          <Setup onSetupComplete={(c) => {setConfig(c); setPhase("playing"); }} />
        )}
        {phase === "playing" && (
          <Game config={config} onGameEnd={(r) => { console.log("Score: ", r); setPhase("setup"); }} />
        )}
    </div>
  );
}

export default App;