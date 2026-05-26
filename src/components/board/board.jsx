import Cell from "../cell/cell";
import "./board.css";

const Board = ({cells, showShips = false, highlightedCells = [], previewCells = [], previewValid = true, onCellClick, disabled = false}) => {

    return (
        <div className="board">
            {cells.map((cell, idx) => (
                <Cell
                key={idx}
                state={cell.state}
                showShip={showShips}
                highlighted={highlightedCells.includes(idx)}
                preview={previewCells.includes(idx) ? (previewValid ? "ok" : "bad") : null }
                onClick={() => onCellClick && onCellClick(idx)}
                disabled={disabled}
                />
            ))}
        </div>
    );
}

export default Board;
