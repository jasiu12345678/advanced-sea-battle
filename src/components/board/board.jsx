import { BOARD_SIZE } from "../../constants";
import { toRowCol } from "../../game";
import Cell from "../cell/cell";
import "./board.css";

const COLUMN_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const cellLabel = (idx) => {
    const { row, col } = toRowCol(idx);
    return `${COLUMN_LETTERS[col]}${row + 1}`;
};

function Board({
    cells,
    showShips = false,
    highlightedCells = [],
    previewCells = [],
    previewValid = true,
    disabled = false,
    onCellClick,
    onCellHover,
    onLeave,
}) {
    const highlighted = new Set(highlightedCells);
    const preview = new Set(previewCells);

    return (
        <div
            className="board"
            style={{ "--board-size": BOARD_SIZE }}
            onMouseLeave={onLeave}
        >
            {cells.map((cell, idx) => (
                <Cell
                    key={idx}
                    state={cell.state}
                    label={cellLabel(idx)}
                    showShip={showShips}
                    highlighted={highlighted.has(idx)}
                    preview={preview.has(idx) ? (previewValid ? "ok" : "bad") : null}
                    disabled={disabled || !onCellClick}
                    onClick={() => onCellClick?.(idx)}
                    onMouseEnter={() => onCellHover?.(idx)}
                />
            ))}
        </div>
    );
}

export default Board;
