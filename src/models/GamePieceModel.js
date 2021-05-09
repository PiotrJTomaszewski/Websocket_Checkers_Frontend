const GamePieceType = {
    LIGHT_MAN: 1,
    LIGHT_KING: 2,
    DARK_MAN: 3,
    DARK_KING: 4
}

class GamePieceModel {
    constructor(type, fieldNo) {
        this.type = type;
        this.setField(fieldNo);
    }

    setField(fieldNo) {
        this.fieldNo = fieldNo;
        const fieldsInRow = 8;
        const totalFields = fieldsInRow * fieldsInRow;
        var fieldSize = 1000 / fieldsInRow; // TODO: Don't use hardcoded value
        this.x = ((totalFields - fieldNo) % fieldsInRow) * fieldSize + fieldSize / 2;
        this.y = Math.floor((totalFields - fieldNo) / fieldsInRow) * fieldSize + fieldSize / 2;
    }
}

export {GamePieceModel as default, GamePieceType};