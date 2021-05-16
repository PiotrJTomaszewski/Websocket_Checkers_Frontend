const GamePieceColor = {
  LIGHT: 1,
  DARK: 2,
};

const GamePieceType = {
  MAN: 1,
  KING: 2,
};

const fieldsInRow = 8;
const fieldsInCol = 4; // Only 4 usable fields in col
const totalUsableFields = fieldsInCol * fieldsInRow;

function rowCol2FieldNo(row, col) {
  return row * fieldsInCol + col + 1;
}

function getPieceColor(row, col, piecesDict) {
  let fieldNo = rowCol2FieldNo(row, col);
  if (row >= 0 && row < fieldsInRow && col >= 0 && col < fieldsInCol) {
    let piece = piecesDict[fieldNo];
    if (piece) {
      return piece.color;
    } else {
      return null;
    }
  }
  return undefined;
}

class GamePieceModel {
  constructor(color, type, fieldNo, boardDimensions, moveable = false) {
    this.color = color;
    this.type = type;
    this.boardDimensions=boardDimensions;
    this.setField(fieldNo);
    this.moveable = moveable;
  }

  setField(fieldNo) {
    this.fieldNo = fieldNo;
    if (fieldNo > 0) {
      // Negative fields are used to hide pieces;
      var fieldSize = this.boardDimensions.width / fieldsInRow;
      const col = (totalUsableFields - fieldNo) % fieldsInCol;
      const row = Math.floor((totalUsableFields - fieldNo) / fieldsInCol);
      const xFieldSize = 2 * fieldSize; // There is unused white field between fields in row
      const yFieldSize = fieldSize;
      this.x = col * xFieldSize;
      if (row % 2 === 0) {
        // Even rows start with an unused field
        this.x += fieldSize;
      }
      this.y = row * yFieldSize;
    } else {
      this.x = -10000;
      this.y = -10000;
    }
  }

  setResetPositionFunc(resetPositionFunc) {
    this.resetPositionFunc = resetPositionFunc;
  }

  getPossibleCaptures(piecesDict, row, col) {
    const opponentColor =
      this.color === GamePieceColor.LIGHT
        ? GamePieceColor.DARK
        : GamePieceColor.LIGHT;
    var possibleMoves = [];
    if (
      this.color === GamePieceColor.DARK ||
      this.type === GamePieceType.KING
    ) {
      if (row % 2 === 0) {
        // Two up left
        if (
          getPieceColor(row + 2, col + 1, piecesDict) === null &&
          getPieceColor(row + 1, col + 1, piecesDict) === opponentColor
        ) {
          console.log("Two up left");
          possibleMoves.push(rowCol2FieldNo(row + 2, col + 1));
        }
        // Two up right
        if (
          getPieceColor(row + 2, col - 1, piecesDict) === null &&
          getPieceColor(row + 1, col, piecesDict) === opponentColor
        ) {
          console.log("Two up right");
          possibleMoves.push(rowCol2FieldNo(row + 2, col - 1));
        }
      } else {
        // Two up left
        if (
          getPieceColor(row + 2, col + 1, piecesDict) === null &&
          getPieceColor(row + 1, col, piecesDict) === opponentColor
        ) {
          console.log("Two up left");
          possibleMoves.push(rowCol2FieldNo(row + 2, col + 1));
        }
        // Two up right
        if (
          getPieceColor(row + 2, col - 1, piecesDict) === null &&
          getPieceColor(row + 1, col - 1, piecesDict) === opponentColor
        ) {
          console.log("Two up right");
          possibleMoves.push(rowCol2FieldNo(row + 2, col - 1));
        }
      }
    }
    if (
      this.color === GamePieceColor.LIGHT ||
      this.type === GamePieceType.KING
    ) {
      if (row % 2 === 0) {
        // Two down left
        if (
          getPieceColor(row - 2, col + 1, piecesDict) === null &&
          getPieceColor(row - 1, col + 1, piecesDict) === opponentColor
        ) {
          console.log("Two down left");
          possibleMoves.push(rowCol2FieldNo(row - 2, col + 1));
        }
        // Two down right
        if (
          getPieceColor(row - 2, col - 1, piecesDict) === null &&
          getPieceColor(row - 1, col, piecesDict) === opponentColor
        ) {
          console.log("Two down right");
          possibleMoves.push(rowCol2FieldNo(row - 2, col - 1));
        }
      } else {
        // Two down left
        if (
          getPieceColor(row - 2, col + 1, piecesDict) === null &&
          getPieceColor(row - 1, col, piecesDict) === opponentColor
        ) {
          console.log("Two down left");
          possibleMoves.push(rowCol2FieldNo(row - 2, col + 1));
        }
        // Two down right
        if (
          getPieceColor(row - 2, col - 1, piecesDict) === null &&
          getPieceColor(row - 1, col - 1, piecesDict) === opponentColor
        ) {
          console.log("Two down right");
          possibleMoves.push(rowCol2FieldNo(row - 2, col - 1));
        }
      }
    }
    return possibleMoves;
  }

  getPossibleMoves(otherPieces) {
    var piecesDict = {};
    otherPieces.forEach((piece) => {
      piecesDict[piece.fieldNo] = piece;
    });
    const row = Math.floor((this.fieldNo - 1) / fieldsInCol);
    const col = (this.fieldNo - 1) % fieldsInCol;
    var possibleMoves = this.getPossibleCaptures(piecesDict, row, col);
    if (possibleMoves.length > 0) {
      return possibleMoves;
    }
    if (
      this.color === GamePieceColor.DARK ||
      this.type === GamePieceType.KING
    ) {
      if (row % 2 === 0) {
        // One up left
        if (getPieceColor(row + 1, col + 1, piecesDict) === null) {
          console.log("One down left");
          possibleMoves.push(rowCol2FieldNo(row + 1, col + 1));
        }
        // One up right
        if (getPieceColor(row + 1, col, piecesDict) === null) {
          console.log("One down right");
          possibleMoves.push(rowCol2FieldNo(row + 1, col));
        }
      } else {
        // One up left
        if (getPieceColor(row + 1, col, piecesDict) === null) {
          console.log("One up left");
          possibleMoves.push(rowCol2FieldNo(row + 1, col));
        }
        // One up right
        if (getPieceColor(row + 1, col - 1, piecesDict) === null) {
          console.log("One up right");
          possibleMoves.push(rowCol2FieldNo(row + 1, col - 1));
        }
      }
    }
    if (
      this.color === GamePieceColor.LIGHT ||
      this.type === GamePieceType.KING
    ) {
      if (row % 2 === 0) {
        // One down left
        if (getPieceColor(row - 1, col + 1, piecesDict) === null) {
          console.log("One down left");
          possibleMoves.push(rowCol2FieldNo(row - 1, col + 1));
        }
        // One down right
        if (getPieceColor(row - 1, col, piecesDict) === null) {
          console.log("One down right");
          possibleMoves.push(rowCol2FieldNo(row - 1, col));
        }
      } else {
        // One down left
        if (getPieceColor(row - 1, col, piecesDict) === null) {
          console.log("One down left");
          possibleMoves.push(rowCol2FieldNo(row - 1, col));
        }
        // One down right
        if (getPieceColor(row - 1, col - 1, piecesDict) === null) {
          console.log("One down right");
          possibleMoves.push(rowCol2FieldNo(row - 1, col - 1));
        }
      }
    }
    return possibleMoves;
  }
}

export { GamePieceModel as default, GamePieceColor, GamePieceType };
