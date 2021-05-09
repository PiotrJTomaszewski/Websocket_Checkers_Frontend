import React, { useState } from "react";
import { Stage, Layer } from "react-konva";

import GameBoardBackground from "./GameBoardBackground";
import GamePiece from "./GamePiece";
import GamePieceModel from "../../models/GamePieceModel";

// TODO: Get name from depth?
const GameBoard = (props) => {

  return (
    <div>
      <h2>{props.name}</h2>
      <Stage
        width={1000}
        height={1000}
        className="game_board"
      >
        <GameBoardBackground highlightedFields={props.highlightedFields}/>
        <Layer>
            <GamePiece piece={new GamePieceModel(2, 10)} />
          {
            props.pieces.map((piece)=> {
              return <GamePiece key={piece.fieldNo} piece={piece} />
            })
          }
        </Layer>
      </Stage>
    </div>
  );
};

export default GameBoard;
