const GameState = {
    NOT_STARTED: 1,
    LIGHT_TURN: 2,
    DARK_TURN: 3,
    LIGHT_WON: 4,
    DARK_WON: 5,
    TIE: 6
}

const GameError = {
    NO_ERROR: 1,
    CANT_MOVE_PIECE: 2,
    ILLEGAL_MOVE: 3,
    FIELD_TAKEN: 4,
    NOT_KING: 5,
    NOT_YOUR_TURN: 6,
    NOT_YOUR_PIECE: 7,
    MUST_CAPTURE: 8
}

export {GameState as default, GameError};