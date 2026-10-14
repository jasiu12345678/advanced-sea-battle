import { CELL_STATES } from "../../constants";
import "./cell.css";

function Cell({
    state = CELL_STATES.WATER,
    showShip = false,
    highlighted = false,
    preview = null, // "ok" | "bad" | null (ship placement preview)
    label,
    disabled = false,
    onClick,
    onMouseEnter,
}) {
    const visibleState = state === CELL_STATES.SHIP && !showShip ? CELL_STATES.WATER : state;

    const classes = [
        "cell",
        `cell--${visibleState}`,
        highlighted && "cell--highlighted",
        preview && `cell--preview-${preview}`,
    ].filter(Boolean).join(" ");

    return (
        <button
            type="button"
            className={classes}
            disabled={disabled}
            aria-label={`${label}: ${visibleState}${highlighted ? ", radar" : ""}`}
            onClick={onClick}
            onMouseEnter={onMouseEnter}
        />
    );
}

export default Cell;
