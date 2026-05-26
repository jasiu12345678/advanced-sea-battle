import "./cell.css";

function Cell({ state = 'water', showShip = false, highlighted = false, preview = null, onClick, disabled = false}) {
    let displayState = state;
    if (state === 'ship' && !showShip) displayState = 'water';

    const classes = [
        "cell",
        `cell--${displayState}`,
        highlighted && "cell--highlighted",
        preview === "ok" && "cell--preview-ok",
        preview === "bad" && "cell--preview-bad",
    ].filter(Boolean).join(" ");
    
    return (
        <button type="button" className={classes} onClick={onClick} disabled={disabled} />
    );
}

export default Cell;
