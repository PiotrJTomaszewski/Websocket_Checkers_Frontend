const GamePieceColor = {
    LIGHT: 1,
    DARK: 2
}

const GamePieceType = {
    MAN: 1,
    KING: 2
}

class GamePieceModel {
    constructor(color, type, fieldNo) {
        this.color = color;
        this.type = type;
        this.setField(fieldNo);
    }

    setField(fieldNo) {
        this.fieldNo = fieldNo;
        const fieldsInRow = 8;
        const fieldsInCol = 4; // Only 4 usable fields in col
        const totalUsableFields = fieldsInCol * fieldsInRow;
        var fieldSize = 1000 / fieldsInRow; // TODO: Don't use hardcoded value
        const col = (totalUsableFields - fieldNo) % fieldsInCol;
        const row = Math.floor((totalUsableFields - fieldNo) / fieldsInCol);
        const xFieldSize = 2 * fieldSize; // There is unused white field between fields in row
        const yFieldSize = fieldSize;
        this.x = col * xFieldSize + fieldSize / 2;
        if (row % 2 == 0) { // Even rows start with an unused field
            this.x += fieldSize;
        }
        this.y = row * yFieldSize + fieldSize / 2;
    }

    setResetPositionFunc(resetPositionFunc) {
        this.resetPositionFunc = resetPositionFunc;
    }
}

export {GamePieceModel as default, GamePieceColor, GamePieceType};