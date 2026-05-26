import "./assets/styles/App.css";
import Board from "./components/board/board";
import { createEmptyBoard } from "./helpers/game-logic";
import { generateRandomFleet, processShot, isFleetDestroyed } from "./helpers";

function App() {
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

  return (
    <div className="container">
      <header>
        <h1>Advanced Sea Battle</h1>
      </header>

      <div className="boards">
        <Board cells={cells} />
        <Board cells={cells} />
      </div>
    </div>
  );
}

export default App;