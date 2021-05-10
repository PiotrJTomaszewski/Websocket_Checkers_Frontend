import React, { useState } from "react";
import { Stage, Layer } from "react-konva";

import GameBoardBackground from "./GameBoardBackground";
import GamePiece from "./GamePiece";
import GamePieceModel from "../../models/GamePieceModel";

// TODO: Rotate the board
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
          <GamePiece piece={new GamePieceModel(1, 1)} piecePickUpDropCallback={props.piecePickUpDropCallback} />
          <GamePiece piece={new GamePieceModel(2, 2)} piecePickUpDropCallback={props.piecePickUpDropCallback} />
          <GamePiece piece={new GamePieceModel(3, 3)} piecePickUpDropCallback={props.piecePickUpDropCallback} />
          <GamePiece piece={new GamePieceModel(3, 5)} piecePickUpDropCallback={props.piecePickUpDropCallback} />
            <GamePiece piece={new GamePieceModel(3, 10)} piecePickUpDropCallback={props.piecePickUpDropCallback} />
            <GamePiece piece={new GamePieceModel(3, 30)} piecePickUpDropCallback={props.piecePickUpDropCallback} />

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
