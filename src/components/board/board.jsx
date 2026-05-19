import Cell from "../cell/cell";
import { useState } from "react";
import "./board.css";

const Board = () => {

    const cells = Array.from({ length: 100});
    return (
        <div className="board-grid">

            {cells.map((_, index) => (
                <Cell key={index} />
            ))}
        </div>
    )
}

export default Board;
