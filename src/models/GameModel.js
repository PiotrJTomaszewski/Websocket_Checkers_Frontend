const GameState = {
    CONNECTING: 0,
    CONNECTED: 1,
    LOOKING_FOR_OPPONENT: 2,
    GAME_START: 3,
    MY_TURN: 4,
    OPPONENTS_TURN: 5,
    TIE: 6,
    MY_WIN: 7,
    OPPONENTS_WIN: 8
}

class GameModel {

}

export {GameModel as default, GameState};